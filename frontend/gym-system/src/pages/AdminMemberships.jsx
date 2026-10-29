
import React, { useEffect, useState } from "react";
import axios from "axios";

const initialForm = {
    user_id: "",
    plan_id: "",
    start_date: "",
    end_date: "",
    status: "active"
};

const api = axios.create({
    baseURL: "/api",
    withCredentials: true
});

function AdminMemberships() {
    const [memberships, setMemberships] = useState([]);
    const [users, setUsers] = useState([]);
    const [plans, setPlans] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        ...initialForm
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                membershipsResponse,
                usersResponse,
                plansResponse
            ] = await Promise.all([
                api.get("/memberships"),
                api.get("/users"),
                api.get("/membership-plans")
            ]);

            const responses = [
                membershipsResponse,
                usersResponse,
                plansResponse
            ];

            if (responses.some(
                (response) => response.data.status !== true
            )) {
                throw new Error(
                    "Unable to load membership data"
                );
            }

            setMemberships(
                Array.isArray(membershipsResponse.data.data)
                    ? membershipsResponse.data.data
                    : []
            );

            setUsers(
                Array.isArray(usersResponse.data.data)
                    ? usersResponse.data.data
                    : []
            );

            setPlans(
                Array.isArray(plansResponse.data.data)
                    ? plansResponse.data.data
                    : []
            );

        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to load memberships"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const getDateValue = (value) => {
        if (!value) return "";

        if (typeof value === "string") {
            const match = value.match(
                /^(\d{4}-\d{2}-\d{2})/
            );

            if (match) return match[1];
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        const year = date.getFullYear();
        const month = String(
            date.getMonth() + 1
        ).padStart(2, "0");
        const day = String(
            date.getDate()
        ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    const formatDate = (value) => {
        const dateValue = getDateValue(value);

        if (!dateValue) return "N/A";

        const [year, month, day] = dateValue.split("-");

        return new Date(
            Number(year),
            Number(month) - 1,
            Number(day)
        ).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const getUserName = (userId) => {
        const user = users.find(
            (item) =>
                String(item.id) === String(userId)
        );

        return user?.name || `User #${userId}`;
    };

    const getPlanName = (planId) => {
        const plan = plans.find(
            (item) =>
                String(item.id) === String(planId)
        );

        return plan?.name || `Plan #${planId}`;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

        setError("");
    };

    const handleAdd = () => {
        setEditingId(null);
        setFormData({ ...initialForm });
        setError("");
        setSuccess("");
        setShowForm(true);
    };

    const handleEdit = (membership) => {
        setEditingId(membership.id);

        setFormData({
            user_id: String(membership.user_id ?? ""),
            plan_id: String(membership.plan_id ?? ""),
            start_date: getDateValue(
                membership.start_date
            ),
            end_date: getDateValue(
                membership.end_date
            ),
            status: membership.status || "active"
        });

        setError("");
        setSuccess("");
        setShowForm(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({ ...initialForm });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (saving) return;

        setError("");
        setSuccess("");

        const payload = {
            user_id: Number(formData.user_id),
            plan_id: Number(formData.plan_id),
            start_date: formData.start_date,
            end_date: formData.end_date,
            status: formData.status
        };

        if (
            !formData.user_id ||
            !formData.plan_id ||
            !payload.start_date ||
            !payload.end_date ||
            !payload.status
        ) {
            setError("All fields are required");
            return;
        }

        if (
            !Number.isInteger(payload.user_id) ||
            payload.user_id <= 0 ||
            !Number.isInteger(payload.plan_id) ||
            payload.plan_id <= 0
        ) {
            setError("Please select valid user and plan");
            return;
        }

        if (
            payload.end_date < payload.start_date
        ) {
            setError(
                "End date cannot be before start date"
            );
            return;
        }

        try {
            setSaving(true);

            let response;

            if (editingId !== null) {
                response = await api.put(
                    `/memberships/${editingId}`,
                    payload
                );
            } else {
                response = await api.post(
                    "/memberships",
                    payload
                );
            }

            if (response.data.status === true) {
                const message =
                    response.data.message ||
                    "Membership saved successfully";

                setShowForm(false);
                setEditingId(null);
                setFormData({ ...initialForm });

                await loadData();

                setSuccess(message);
            } else {
                setError(
                    response.data.message ||
                    "Failed to save membership"
                );
            }

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to save membership"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (deletingId !== null) return;

        const confirmed = window.confirm(
            "Are you sure you want to delete this membership?"
        );

        if (!confirmed) return;

        setError("");
        setSuccess("");

        try {
            setDeletingId(id);

            const response = await api.delete(
                `/memberships/${id}`
            );

            if (response.data.status === true) {
                setMemberships((previous) =>
                    previous.filter(
                        (membership) =>
                            String(membership.id) !== String(id)
                    )
                );

                if (
                    editingId !== null &&
                    String(editingId) === String(id)
                ) {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ ...initialForm });
                }

                setSuccess(
                    response.data.message ||
                    "Membership deleted successfully"
                );
            } else {
                setError(
                    response.data.message ||
                    "Failed to delete membership"
                );
            }

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to delete membership"
            );
        } finally {
            setDeletingId(null);
        }
    };

    const getStatusClass = (status) => {
        switch (String(status).toLowerCase()) {
            case "active":
                return "bg-success";

            case "expired":
            case "cancelled":
            case "canceled":
                return "bg-danger";

            case "pending":
                return "bg-warning text-dark";

            default:
                return "bg-secondary";
        }
    };

    return (
        <div
            className="container py-5"
            style={{ marginTop: "60px" }}
        >

            {/* Header */}
            <div className="mb-4">

                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">

                    <div>
                        <p className="text-warning fw-bold mb-2">
                            MEMBERSHIP MANAGEMENT
                        </p>

                        <h2 className="fw-bold mb-1">
                            All Memberships
                        </h2>

                        <p className="text-secondary mb-0">
                            Manage user memberships and their current status.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="btn btn-warning fw-semibold"
                        onClick={handleAdd}
                        disabled={saving || loading}
                    >
                        Add Membership
                    </button>

                </div>

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

            {/* Add / Edit Form */}
            {showForm && (
                <div className="card border-0 shadow-sm mb-4">

                    <div className="card-body p-4">

                        <h4 className="fw-bold mb-4">
                            {editingId !== null
                                ? "Edit Membership"
                                : "Add New Membership"}
                        </h4>

                        <form onSubmit={handleSubmit}>

                            <div className="row g-3">

                                <div className="col-md-6">

                                    <label className="form-label">
                                        Select User
                                    </label>

                                    <select
                                        className="form-select"
                                        name="user_id"
                                        value={formData.user_id}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">
                                            Select User
                                        </option>

                                        {users.map((user) => (
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
                                        Select Membership Plan
                                    </label>

                                    <select
                                        className="form-select"
                                        name="plan_id"
                                        value={formData.plan_id}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">
                                            Select Plan
                                        </option>

                                        {plans.map((plan) => (
                                            <option
                                                key={plan.id}
                                                value={plan.id}
                                            >
                                                {plan.name}
                                            </option>
                                        ))}
                                    </select>

                                </div>

                                <div className="col-md-6">

                                    <label className="form-label">
                                        Start Date
                                    </label>

                                    <input
                                        type="date"
                                        className="form-control"
                                        name="start_date"
                                        value={formData.start_date}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>

                                <div className="col-md-6">

                                    <label className="form-label">
                                        End Date
                                    </label>

                                    <input
                                        type="date"
                                        className="form-control"
                                        name="end_date"
                                        value={formData.end_date}
                                        onChange={handleChange}
                                        min={formData.start_date || undefined}
                                        required
                                    />

                                </div>

                                <div className="col-md-6">

                                    <label className="form-label">
                                        Membership Status
                                    </label>

                                    <select
                                        className="form-select"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        required
                                    >
                                        {formData.status &&
                                            ![
                                                "active",
                                                "expired",
                                                "pending",
                                                "cancelled"
                                            ].includes(formData.status.toLowerCase()) && (
                                                <option value={formData.status}>
                                                    {formData.status}
                                                </option>
                                            )}

                                        <option value="active">
                                            Active
                                        </option>

                                        <option value="expired">
                                            Expired
                                        </option>

                                        <option value="pending">
                                            Pending
                                        </option>

                                        <option value="cancelled">
                                            Cancelled
                                        </option>
                                    </select>

                                </div>

                            </div>

                            <div className="d-flex gap-2 mt-4">

                                <button
                                    type="submit"
                                    className="btn btn-warning fw-semibold"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingId !== null
                                            ? "Update Membership"
                                            : "Save Membership"}
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

            {/* Membership Table */}
            <div className="card border-0 shadow-sm">

                <div className="card-body p-0">

                    <div className="table-responsive">

                        <table className="table table-hover align-middle mb-0">

                            <thead className="table-light">

                                <tr>
                                    <th>ID</th>
                                    <th>User</th>
                                    <th>Plan</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Status</th>
                                    <th>Created At</th>
                                    <th>Actions</th>
                                </tr>

                            </thead>

                            <tbody>

                                {loading ? (

                                    <tr>
                                        <td
                                            colSpan="8"
                                            className="text-center py-4"
                                        >
                                            Loading memberships...
                                        </td>
                                    </tr>

                                ) : error && memberships.length === 0 ? (

                                    <tr>
                                        <td
                                            colSpan="8"
                                            className="text-center py-4 text-danger"
                                        >
                                            Unable to load memberships
                                        </td>
                                    </tr>

                                ) : memberships.length === 0 ? (

                                    <tr>
                                        <td
                                            colSpan="8"
                                            className="text-center py-4 text-secondary"
                                        >
                                            No memberships found
                                        </td>
                                    </tr>

                                ) : (

                                    memberships.map((membership) => (

                                        <tr key={membership.id}>

                                            <td>
                                                {membership.id}
                                            </td>

                                            <td className="fw-semibold">
                                                {getUserName(
                                                    membership.user_id
                                                )}
                                            </td>

                                            <td>
                                                {getPlanName(
                                                    membership.plan_id
                                                )}
                                            </td>

                                            <td>
                                                {formatDate(
                                                    membership.start_date
                                                )}
                                            </td>

                                            <td>
                                                {formatDate(
                                                    membership.end_date
                                                )}
                                            </td>

                                            <td>
                                                <span
                                                    className={
                                                        "badge " +
                                                        getStatusClass(
                                                            membership.status
                                                        )
                                                    }
                                                >
                                                    {membership.status || "N/A"}
                                                </span>
                                            </td>

                                            <td>
                                                {formatDate(
                                                    membership.created_at
                                                )}
                                            </td>

                                            <td>

                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-warning me-2"
                                                    onClick={() =>
                                                        handleEdit(membership)
                                                    }
                                                    disabled={
                                                        saving ||
                                                        deletingId !== null
                                                    }
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() =>
                                                        handleDelete(
                                                            membership.id
                                                        )
                                                    }
                                                    disabled={
                                                        saving ||
                                                        deletingId !== null
                                                    }
                                                >
                                                    {deletingId === membership.id
                                                        ? "Deleting..."
                                                        : "Delete"}
                                                </button>

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

export default AdminMemberships;
