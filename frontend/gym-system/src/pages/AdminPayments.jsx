
import React, { useEffect, useState } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true
});

const today = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60000;

  return new Date(date.getTime() - offset)
    .toISOString()
    .slice(0, 10);
};

const formatInputDate = (value) => {
  if (!value) return today();

  if (typeof value === "string") {
    const match = value.match(/^\d{4}-\d{2}-\d{2}/);
    if (match) return match[0];
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return today();

  return date.toISOString().slice(0, 10);
};

const initialForm = () => ({
  user_id: "",
  membership_id: "",
  amount: "",
  payment_date: today(),
  status: "pending"
});

function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [plans, setPlans] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [form, setForm] = useState(initialForm);

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);

      const [
        paymentsResponse,
        usersResponse,
        membershipsResponse,
        plansResponse
      ] = await Promise.all([
        api.get("/payments"),
        api.get("/users"),
        api.get("/memberships"),
        api.get("/membership-plans")
      ]);

      const responses = [
        paymentsResponse,
        usersResponse,
        membershipsResponse,
        plansResponse
      ];

      if (responses.some((res) => res.data.status !== true)) {
        throw new Error("Failed to load payment information");
      }

      setPayments(
        Array.isArray(paymentsResponse.data.data)
          ? paymentsResponse.data.data
          : []
      );

      setUsers(
        Array.isArray(usersResponse.data.data)
          ? usersResponse.data.data
          : []
      );

      setMemberships(
        Array.isArray(membershipsResponse.data.data)
          ? membershipsResponse.data.data
          : []
      );

      setPlans(
        Array.isArray(plansResponse.data.data)
          ? plansResponse.data.data
          : []
      );

      return true;
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to load payments"
      );

      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const getUserName = (userId) => {
    const user = users.find(
      (item) => String(item.id) === String(userId)
    );

    return user?.name || `User #${userId}`;
  };

  const getMembershipName = (membershipId) => {
    const membership = memberships.find(
      (item) => String(item.id) === String(membershipId)
    );

    if (!membership) {
      return `Membership #${membershipId}`;
    }

    const plan = plans.find(
      (item) => String(item.id) === String(membership.plan_id)
    );

    return plan?.name || `Membership #${membershipId}`;
  };

  const formatAmount = (amount) => {
    if (
      amount === null ||
      amount === undefined ||
      amount === ""
    ) {
      return "N/A";
    }

    const number = Number(amount);

    if (!Number.isFinite(number)) return "N/A";

    return `₹${number.toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })}`;
  };

  const formatDate = (value) => {
    if (!value) return "N/A";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "N/A";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const getStatusClass = (status) => {
    const value = String(status || "").toLowerCase();

    switch (value) {
      case "paid":
      case "success":
      case "successful":
      case "completed":
        return "bg-success";

      case "failed":
      case "cancelled":
      case "canceled":
        return "bg-danger";

      case "pending":
        return "bg-warning text-dark";

      default:
        return "bg-secondary";
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setShowForm(false);
    setForm(initialForm());
  };

  const openAddForm = () => {
    if (saving || deletingId !== null) return;

    clearMessages();

    if (showForm && editingId === null) {
      resetForm();
      return;
    }

    setEditingId(null);
    setForm(initialForm());
    setShowForm(true);
  };

  const openEditForm = (payment) => {
    if (saving || deletingId !== null) return;

    clearMessages();

    setEditingId(payment.id);

    setForm({
      user_id: String(payment.user_id ?? ""),
      membership_id: String(payment.membership_id ?? ""),
      amount: String(payment.amount ?? ""),
      payment_date: formatInputDate(payment.payment_date),
      status: String(payment.status || "pending").toLowerCase()
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
      ...(name === "user_id"
        ? { membership_id: "" }
        : {})
    }));

    clearMessages();
  };

  const availableMemberships = memberships.filter(
    (membership) =>
      String(membership.user_id) === String(form.user_id)
  );

  const selectedMembership = memberships.find(
    (membership) =>
      String(membership.id) === String(form.membership_id)
  );

  const handleSave = async (event) => {
    event.preventDefault();

    if (saving || loading || deletingId !== null) return;

    clearMessages();

    const amount = Number(form.amount);

    if (!form.user_id || !form.membership_id) {
      setError("Please select a member and membership");
      return;
    }

    if (
      !selectedMembership ||
      String(selectedMembership.user_id) !== String(form.user_id)
    ) {
      setError(
        "Selected membership does not belong to this member"
      );
      return;
    }

    if (
      !Number.isFinite(amount) ||
      amount <= 0 ||
      !/^\d+(\.\d{1,2})?$/.test(String(form.amount))
    ) {
      setError(
        "Enter a valid amount with maximum 2 decimal places"
      );
      return;
    }

    if (!form.payment_date) {
      setError("Please select a payment date");
      return;
    }

    if (!["pending", "paid", "failed"].includes(form.status)) {
      setError("Please select a valid payment status");
      return;
    }

    const isEditing = editingId !== null;

    const originalPayment = isEditing
      ? payments.find(
          (payment) => String(payment.id) === String(editingId)
        )
      : null;

    const wasPaid = [
      "paid",
      "completed",
      "success",
      "successful"
    ].includes(
      String(originalPayment?.status || "").toLowerCase()
    );

    let message = isEditing
      ? `Update payment #${editingId}?`
      : "Create a new payment record?";

    message +=
      `\nMember: ${getUserName(form.user_id)}` +
      `\nAmount: ${formatAmount(amount)}` +
      `\nStatus: ${form.status.toUpperCase()}`;

    if (wasPaid) {
      message +=
        "\n\nWARNING: You are modifying an existing PAID payment.";
    }

    if (form.status === "paid") {
      message +=
        "\n\nOnly mark a payment PAID when money has actually been received.";
    }

    const confirmed = window.confirm(message);

    if (!confirmed) return;

    const payload = {
      user_id: Number(form.user_id),
      membership_id: Number(form.membership_id),
      amount,
      payment_date: form.payment_date,
      status: form.status
    };

    try {
      setSaving(true);

      const response = isEditing
        ? await api.put(`/payments/${editingId}`, payload)
        : await api.post("/payments", payload);

      if (response.data.status !== true) {
        throw new Error(
          response.data.message || "Unable to save payment"
        );
      }

      resetForm();

      const refreshed = await fetchPayments();

      if (refreshed) {
        setSuccess(
          response.data.message ||
          (isEditing
            ? "Payment updated successfully"
            : "Payment created successfully")
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to save payment"
      );
    } finally {
      setSaving(false);
    }
  };

  // DELETE PAYMENT - Only Pending or Failed
  const handleDelete = async (payment) => {
    if (saving || loading || deletingId !== null) return;

    const status = String(payment.status || "").toLowerCase();

    if (!["pending", "failed"].includes(status)) {
      setError(
        "Paid payments cannot be deleted from this page."
      );
      return;
    }

    const confirmed = window.confirm(
      `Permanently delete Payment #${payment.id}?\n\n` +
      `Member: ${getUserName(payment.user_id)}\n` +
      `Amount: ${formatAmount(payment.amount)}\n` +
      `Status: ${payment.status}\n\n` +
      "This action cannot be undone."
    );

    if (!confirmed) return;

    clearMessages();

    try {
      setDeletingId(payment.id);

      const response = await api.delete(
        `/payments/${payment.id}`
      );

      if (response.data.status !== true) {
        throw new Error(
          response.data.message || "Delete failed"
        );
      }

      if (String(editingId) === String(payment.id)) {
        resetForm();
      }

      const refreshed = await fetchPayments();

      if (refreshed) {
        setSuccess(
          "Payment deleted successfully"
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to delete payment"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const sortedPayments = [...payments].sort((a, b) => {
    const dateA = new Date(a.payment_date || 0).getTime();
    const dateB = new Date(b.payment_date || 0).getTime();

    return (
      (Number.isFinite(dateB) ? dateB : 0) -
      (Number.isFinite(dateA) ? dateA : 0)
    );
  });

  return (
    <div
      className="container py-5"
      style={{ marginTop: "60px" }}
    >
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <p className="text-warning fw-bold mb-2">
            PAYMENT MANAGEMENT
          </p>

          <h2 className="fw-bold mb-1">
            Payment History
          </h2>

          <p className="text-secondary mb-0">
            View and manage gym membership payments.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-warning fw-semibold"
          onClick={openAddForm}
          disabled={saving || deletingId !== null}
        >
          {showForm && editingId === null
            ? "Cancel"
            : "+ Add Payment"}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="alert alert-success" role="status">
          {success}
        </div>
      )}

      {/* Add / Edit Payment Form */}
      {showForm && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <h4 className="fw-bold mb-4">
              {editingId !== null
                ? `Edit Payment #${editingId}`
                : "Add New Payment"}
            </h4>

            <form onSubmit={handleSave}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">
                    Select Member
                  </label>

                  <select
                    className="form-select"
                    name="user_id"
                    value={form.user_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select Member
                    </option>

                    {users
                      .filter(
                        (user) =>
                          String(user.role).toLowerCase() !==
                          "admin"
                      )
                      .map((user) => (
                        <option
                          key={user.id}
                          value={user.id}
                        >
                          {user.name} ({user.email})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    Select Membership
                  </label>

                  <select
                    className="form-select"
                    name="membership_id"
                    value={form.membership_id}
                    onChange={handleChange}
                    disabled={!form.user_id}
                    required
                  >
                    <option value="">
                      Select Membership
                    </option>

                    {availableMemberships.map((membership) => (
                      <option
                        key={membership.id}
                        value={membership.id}
                      >
                        #{membership.id} -{" "}
                        {getMembershipName(membership.id)}
                        {" "}({membership.status || "N/A"})
                      </option>
                    ))}
                  </select>

                  {form.user_id &&
                    availableMemberships.length === 0 && (
                      <small className="text-secondary">
                        No membership found for this member.
                      </small>
                    )}
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    Amount (₹)
                  </label>

                  <input
                    type="number"
                    name="amount"
                    className="form-control"
                    value={form.amount}
                    onChange={handleChange}
                    min="0.01"
                    step="0.01"
                    placeholder="Enter amount"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    Payment Date
                  </label>

                  <input
                    type="date"
                    name="payment_date"
                    className="form-control"
                    value={form.payment_date}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    Payment Status
                  </label>

                  <select
                    className="form-select"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-warning fw-semibold"
                  disabled={
                    saving ||
                    loading ||
                    deletingId !== null
                  }
                >
                  {saving
                    ? "Saving..."
                    : editingId !== null
                      ? "Update Payment"
                      : "Save Payment"}
                </button>

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  disabled={saving}
                  onClick={() => {
                    resetForm();
                    clearMessages();
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment History Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Membership</th>
                  <th>Amount</th>
                  <th>Payment Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="text-center py-4"
                    >
                      Loading payments...
                    </td>
                  </tr>
                ) : error && payments.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="text-center py-4 text-danger"
                    >
                      Unable to load payments
                    </td>
                  </tr>
                ) : sortedPayments.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="text-center py-4 text-secondary"
                    >
                      No payments found
                    </td>
                  </tr>
                ) : (
                  sortedPayments.map((payment) => (
                    <tr key={payment.id}>
                      <td>{payment.id}</td>

                      <td className="fw-semibold">
                        {getUserName(payment.user_id)}
                      </td>

                      <td>
                        {getMembershipName(
                          payment.membership_id
                        )}
                      </td>

                      <td className="fw-semibold text-warning">
                        {formatAmount(payment.amount)}
                      </td>

                      <td>
                        {formatDate(payment.payment_date)}
                      </td>

                      <td>
                        <span
                          className={
                            "badge " +
                            getStatusClass(payment.status)
                          }
                        >
                          {payment.status || "N/A"}
                        </span>
                      </td>

                      <td>
                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => openEditForm(payment)}
                            disabled={
                              saving ||
                              loading ||
                              deletingId !== null
                            }
                          >
                            Edit
                          </button>

                          {["pending", "failed"].includes(
                            String(payment.status || "")
                              .toLowerCase()
                          ) && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(payment)}
                              disabled={
                                saving ||
                                loading ||
                                deletingId !== null
                              }
                            >
                              {String(deletingId) ===
                              String(payment.id)
                                ? "Deleting..."
                                : "Delete"}
                            </button>
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

export default AdminPayments;
