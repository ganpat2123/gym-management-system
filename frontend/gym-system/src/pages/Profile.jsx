
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true
});

const initialProfile = {
  name: "",
  email: "",
  phone: ""
};

const initialPassword = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: ""
};

function Profile() {
  const [user, setUser] = useState(null);
  const [profileForm, setProfileForm] = useState(initialProfile);
  const [passwordForm, setPasswordForm] = useState(initialPassword);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [activeForm, setActiveForm] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    const fetchProfile = async () => {
      try {
        setLoading(true);

        const response = await api.get("/users/me");

        if (!active) return;

        if (
          response.data.status !== true ||
          !response.data.data
        ) {
          throw new Error("Unable to load profile");
        }

        const data = response.data.data;

        setUser(data);

        setProfileForm({
          name: data.name || "",
          email: data.email || "",
          phone: String(data.phone || "")
        });

      } catch (err) {
        if (!active) return;

        setError(
          err.response?.data?.message ||
          err.message ||
          "Unable to fetch profile"
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      active = false;
    };
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    setProfileForm((previous) => ({
      ...previous,
      [name]: value
    }));

    setError("");
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordForm((previous) => ({
      ...previous,
      [name]: value
    }));

    setError("");
  };

  const openProfileForm = () => {
    if (!user) return;

    setProfileForm({
      name: user.name || "",
      email: user.email || "",
      phone: String(user.phone || "")
    });

    setActiveForm("profile");
    setError("");
    setSuccess("");
  };

  const openPasswordForm = () => {
    setPasswordForm({ ...initialPassword });
    setActiveForm("password");
    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    if (saving || changingPassword) return;

    setActiveForm(null);
    setPasswordForm({ ...initialPassword });
    setError("");
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (saving) return;

    setError("");
    setSuccess("");

    const payload = {
      name: profileForm.name.trim(),
      email: profileForm.email.trim(),
      phone: profileForm.phone.trim()
    };

    if (
      !payload.name ||
      !payload.email ||
      !payload.phone
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (!/^\d{10}$/.test(payload.phone)) {
      setError("Phone number must be 10 digits.");
      return;
    }

    try {
      setSaving(true);

      const response = await api.patch(
        "/users/me",
        payload
      );

      if (
        response.data.status !== true ||
        !response.data.data
      ) {
        throw new Error(
          response.data.message ||
          "Profile update failed"
        );
      }

      setUser(response.data.data);

      setProfileForm({
        name: response.data.data.name || "",
        email: response.data.data.email || "",
        phone: String(
          response.data.data.phone || ""
        )
      });

      setActiveForm(null);

      setSuccess(
        response.data.message ||
        "Profile updated successfully!"
      );

    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (changingPassword) return;

    setError("");
    setSuccess("");

    const {
      currentPassword,
      newPassword,
      confirmPassword
    } = passwordForm;

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setError("Please fill in all password fields.");
      return;
    }

    if (
      newPassword.length < 8 ||
      newPassword.length > 72
    ) {
      setError(
        "New password must contain 8 to 72 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setError(
        "New password must be different from current password."
      );
      return;
    }

    try {
      setChangingPassword(true);

      const response = await api.put(
        "/users/me/password",
        {
          currentPassword,
          newPassword
        }
      );

      if (response.data.status !== true) {
        throw new Error(
          response.data.message ||
          "Password change failed"
        );
      }

      setPasswordForm({ ...initialPassword });
      setActiveForm(null);

      setSuccess(
        response.data.message ||
        "Password changed successfully!"
      );

    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to change password"
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return "Not Available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Not Available";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  };

  const displayValue = (value) => {
    if (loading) return "Loading...";

    return value === undefined ||
      value === null ||
      value === ""
      ? "Not Available"
      : value;
  };

  const role = String(
    user?.role || ""
  ).toLowerCase();

  const dashboardPath =
    role === "admin"
      ? "/admin/dashboard"
      : "/user/dashboard";

  return (
    <div
      className="container py-5"
      style={{ marginTop: "60px" }}
    >
      {/* Header */}
      <div className="mb-5">
        <p className="text-warning fw-bold mb-2">
          MY PROFILE
        </p>

        <h2 className="fw-bold">
          Account{" "}
          <span className="text-warning">
            Information
          </span>
        </h2>

        <p className="text-secondary">
          View and manage your account information.
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div
          className="alert alert-danger"
          role="alert"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="alert alert-success"
          role="status"
        >
          {success}
        </div>
      )}

      <div className="row g-4">
        {/* Personal Information */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">
                  Personal Information
                </h4>

                <span
                  className={
                    user
                      ? "badge bg-success"
                      : "badge bg-secondary"
                  }
                >
                  {loading
                    ? "Loading"
                    : user
                      ? "Account"
                      : "Unavailable"}
                </span>
              </div>

              <div className="row g-4">
                <div className="col-md-6">
                  <p className="text-secondary mb-1">
                    Full Name
                  </p>

                  <h6 className="fw-bold">
                    {displayValue(user?.name)}
                  </h6>
                </div>

                <div className="col-md-6">
                  <p className="text-secondary mb-1">
                    Email
                  </p>

                  <h6
                    className="fw-bold"
                    style={{
                      overflowWrap: "anywhere"
                    }}
                  >
                    {displayValue(user?.email)}
                  </h6>
                </div>

                <div className="col-md-6">
                  <p className="text-secondary mb-1">
                    Phone
                  </p>

                  <h6 className="fw-bold">
                    {displayValue(user?.phone)}
                  </h6>
                </div>

                <div className="col-md-6">
                  <p className="text-secondary mb-1">
                    Account Role
                  </p>

                  <h6 className="fw-bold">
                    {loading
                      ? "Loading..."
                      : role === "admin"
                        ? "Admin"
                        : role === "user"
                          ? "User"
                          : "Not Available"}
                  </h6>
                </div>

                <div className="col-md-6">
                  <p className="text-secondary mb-1">
                    Member Since
                  </p>

                  <h6 className="fw-bold">
                    {loading
                      ? "Loading..."
                      : formatDate(user?.created_at)}
                  </h6>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Profile Form */}
          {activeForm === "profile" && (
            <div className="card border-0 shadow-sm mt-4">
              <div className="card-body p-4">
                <h4 className="fw-bold mb-4">
                  Edit Profile
                </h4>

                <form onSubmit={handleProfileSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">
                        Full Name
                      </label>

                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        value={profileForm.name}
                        onChange={handleProfileChange}
                        maxLength={100}
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
                        value={profileForm.email}
                        onChange={handleProfileChange}
                        maxLength={254}
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
                        value={profileForm.phone}
                        onChange={handleProfileChange}
                        maxLength={10}
                        required
                      />
                    </div>
                  </div>

                  <div className="d-flex gap-2 mt-4">
                    <button
                      type="submit"
                      className="btn btn-warning"
                      disabled={saving}
                    >
                      {saving
                        ? "Saving..."
                        : "Save Changes"}
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Change Password Form */}
          {activeForm === "password" && (
            <div className="card border-0 shadow-sm mt-4">
              <div className="card-body p-4">
                <h4 className="fw-bold mb-4">
                  Change Password
                </h4>

                <form onSubmit={handlePasswordSubmit}>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">
                        Current Password
                      </label>

                      <input
                        type="password"
                        name="currentPassword"
                        className="form-control"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        autoComplete="current-password"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        New Password
                      </label>

                      <input
                        type="password"
                        name="newPassword"
                        className="form-control"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        autoComplete="new-password"
                        minLength={8}
                        maxLength={72}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        Confirm New Password
                      </label>

                      <input
                        type="password"
                        name="confirmPassword"
                        className="form-control"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        autoComplete="new-password"
                        minLength={8}
                        maxLength={72}
                        required
                      />
                    </div>
                  </div>

                  <div className="d-flex gap-2 mt-4">
                    <button
                      type="submit"
                      className="btn btn-warning"
                      disabled={changingPassword}
                    >
                      {changingPassword
                        ? "Updating..."
                        : "Update Password"}
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={handleCancel}
                      disabled={changingPassword}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Account Actions */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <h4 className="fw-bold mb-4">
                Account Actions
              </h4>

              <div className="d-grid gap-3">
                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={openProfileForm}
                  disabled={
                    loading ||
                    !user ||
                    saving ||
                    changingPassword
                  }
                >
                  Edit Profile
                </button>

                <button
                  type="button"
                  className="btn btn-outline-warning"
                  onClick={openPasswordForm}
                  disabled={
                    loading ||
                    !user ||
                    saving ||
                    changingPassword
                  }
                >
                  Change Password
                </button>

                <Link
                  to={dashboardPath}
                  className="btn btn-outline-secondary"
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
