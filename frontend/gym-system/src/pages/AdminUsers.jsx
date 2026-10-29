
import React, { useEffect, useState } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true
});

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  password: ""
};

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ ...emptyForm });

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [changingStatusId, setChangingStatusId] = useState(null);
  const [currentAdminId, setCurrentAdminId] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await api.get("/users");

      if (
        response.data.status !== true ||
        !Array.isArray(response.data.data)
      ) {
        throw new Error(
          response.data.message || "Failed to load users"
        );
      }

      setUsers(response.data.data);
      return true;
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to fetch users"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const loadPage = async () => {
      try {
        const response = await api.get("/users/me");

        if (active && response.data.status === true) {
          setCurrentAdminId(response.data.data?.id ?? null);
        }
      } catch (err) {
        console.error("Unable to identify admin", err);
      }

      if (active) {
        await fetchUsers();
      }
    };

    loadPage();

    return () => {
      active = false;
    };
  }, []);

  const isActive = (user) => {
    return Number(user.is_active) === 1;
  };

  const isAdmin = (user) => {
    return String(user.role || "").toLowerCase() === "admin";
  };

  const isCurrentUser = (user) => {
    return (
      currentAdminId !== null &&
      String(currentAdminId) === String(user.id)
    );
  };

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const handleEdit = (user) => {
    setEditingUser(user.id);

    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: String(user.phone || ""),
      password: ""
    });

    clearMessages();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));

    setError("");
  };

  const handleCancel = () => {
    setEditingUser(null);
    setFormData({ ...emptyForm });
    setError("");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (saving || editingUser === null) return;

    clearMessages();

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password
    ) {
      setError("All fields are required");
      return;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      setError("Phone number must be 10 digits");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must contain at least 8 characters");
      return;
    }

    try {
      setSaving(true);

      const response = await api.put(
        `/users/${editingUser}`,
        {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone,
          password: formData.password
        }
      );

      if (response.data.status !== true) {
        throw new Error(
          response.data.message || "Update failed"
        );
      }

      setEditingUser(null);
      setFormData({ ...emptyForm });

      const refreshed = await fetchUsers();

      if (refreshed) {
        setSuccess(
          response.data.message ||
          "User updated successfully"
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to update user"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (user) => {
    if (
      changingStatusId !== null ||
      saving ||
      deletingId !== null ||
      isAdmin(user) ||
      currentAdminId === null ||
      isCurrentUser(user)
    ) {
      return;
    }

    const newStatus = isActive(user) ? 0 : 1;
    const action = newStatus === 0 ? "deactivate" : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${user.name}?`
    );

    if (!confirmed) return;

    clearMessages();

    try {
      setChangingStatusId(user.id);

      const response = await api.patch(
        `/users/${user.id}/status`,
        { is_active: newStatus }
      );

      if (response.data.status !== true) {
        throw new Error(
          response.data.message ||
          "Unable to change user status"
        );
      }

      setUsers((previous) =>
        previous.map((item) =>
          String(item.id) === String(user.id)
            ? { ...item, is_active: newStatus }
            : item
        )
      );

      setSuccess(
        response.data.message ||
        `User ${newStatus === 1 ? "activated" : "deactivated"} successfully`
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to change user status"
      );
    } finally {
      setChangingStatusId(null);
    }
  };

  const handleDelete = async (user) => {
    if (
      deletingId !== null ||
      saving ||
      changingStatusId !== null ||
      isAdmin(user) ||
      currentAdminId === null ||
      isCurrentUser(user)
    ) {
      return;
    }

    const confirmed = window.confirm(
      `Permanently delete ${user.name}?\n\n` +
      "If the user has memberships or payments, deletion may be blocked. " +
      "Use Deactivate to preserve their records."
    );

    if (!confirmed) return;

    clearMessages();

    try {
      setDeletingId(user.id);

      const response = await api.delete(
        `/users/${user.id}`
      );

      if (response.data.status !== true) {
        throw new Error(
          response.data.message || "Delete failed"
        );
      }

      setUsers((previous) =>
        previous.filter(
          (item) => String(item.id) !== String(user.id)
        )
      );

      if (String(editingUser) === String(user.id)) {
        setEditingUser(null);
        setFormData({ ...emptyForm });
      }

      setSuccess(
        response.data.message ||
        "User deleted successfully"
      );
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Unable to delete user";

      setError(
        `${message} If this user has linked membership or payment records, deactivate the account instead.`
      );
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (value) => {
    if (!value) return "N/A";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "N/A";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const busy =
    saving ||
    deletingId !== null ||
    changingStatusId !== null;

  return (
    <div
      className="container py-5"
      style={{ marginTop: "60px" }}
    >
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <p className="text-warning fw-bold mb-2">
            USER MANAGEMENT
          </p>

          <h2 className="fw-bold mb-1">
            All Users
          </h2>

          <p className="text-secondary mb-0">
            Manage registered GYM PRO users.
          </p>
        </div>

        <span className="badge bg-warning text-dark fs-6">
          Total Users: {loading ? "..." : users.length}
        </span>
      </div>

      {/* Messages */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success" role="status">
          {success}
        </div>
      )}

      {/* Edit User Form */}
      {editingUser !== null && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <h4 className="fw-bold mb-4">
              Edit User
            </h4>

            <form onSubmit={handleUpdate}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">
                    Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    Phone
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    className="form-control"
                    value={formData.phone}
                    onChange={handleChange}
                    maxLength={10}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    New Password
                  </label>

                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    value={formData.password}
                    onChange={handleChange}
                    minLength={8}
                    autoComplete="new-password"
                    required
                  />

                  <small className="text-secondary">
                    Backend requires a new password when editing a user.
                  </small>
                </div>
              </div>

              <div className="mt-4 d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-warning"
                  disabled={busy}
                >
                  {saving ? "Saving..." : "Update User"}
                </button>

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleCancel}
                  disabled={busy}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="text-center py-4 text-secondary"
                    >
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>

                      <td className="fw-semibold">
                        {user.name}
                      </td>

                      <td>{user.email}</td>

                      <td>{user.phone || "N/A"}</td>

                      <td>
                        <span
                          className={
                            isAdmin(user)
                              ? "badge bg-dark"
                              : "badge bg-primary"
                          }
                        >
                          {isAdmin(user) ? "Admin" : "User"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            isActive(user)
                              ? "badge bg-success"
                              : "badge bg-secondary"
                          }
                        >
                          {isActive(user) ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td>
                        {formatDate(user.created_at)}
                      </td>

                      <td>
                        <div className="d-flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => handleEdit(user)}
                            disabled={busy}
                          >
                            Edit
                          </button>

                          {!isAdmin(user) && (
                            <>
                              <button
                                type="button"
                                className={
                                  isActive(user)
                                    ? "btn btn-sm btn-outline-secondary"
                                    : "btn btn-sm btn-outline-success"
                                }
                                onClick={() =>
                                  handleStatusChange(user)
                                }
                                disabled={
                                  busy ||
                                  currentAdminId === null ||
                                  isCurrentUser(user)
                                }
                              >
                                {String(changingStatusId) === String(user.id)
                                  ? "Updating..."
                                  : isActive(user)
                                    ? "Deactivate"
                                    : "Activate"}
                              </button>

                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(user)}
                                disabled={
                                  busy ||
                                  currentAdminId === null ||
                                  isCurrentUser(user)
                                }
                              >
                                {String(deletingId) === String(user.id)
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminUsers;
