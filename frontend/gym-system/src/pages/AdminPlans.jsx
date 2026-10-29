
import React, { useEffect, useState } from "react";
import axios from "axios";

const initialForm = {
    name: "",
    duration: "",
    price: "",
    description: ""
};

function AdminPlans() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState(initialForm);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fetchPlans = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get(
                "/api/membership-plans",
                { withCredentials: true }
            );

            if (response.data.status === true) {
                setPlans(
                    Array.isArray(response.data.data)
                        ? response.data.data
                        : []
                );
            } else {
                throw new Error(
                    response.data.message ||
                    "Failed to load membership plans"
                );
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to fetch membership plans"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAdd = () => {
        setEditingId(null);
        setFormData({ ...initialForm });
        setError("");
        setSuccess("");
        setShowForm(true);
    };

    const handleEdit = (plan) => {
        setEditingId(plan.id);

        setFormData({
            name: plan.name || "",
            duration: String(plan.duration ?? ""),
            price: String(plan.price ?? ""),
            description: plan.description || ""
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
            name: formData.name.trim(),
            duration: formData.duration.trim(),
            price: Number(formData.price),
            description: formData.description.trim()
        };

        if (
            !payload.name ||
            !payload.duration ||
            !formData.price.trim() ||
            !payload.description
        ) {
            setError("All fields are required");
            return;
        }

        if (
            !Number.isFinite(payload.price) ||
            payload.price <= 0
        ) {
            setError("Enter a valid price greater than zero");
            return;
        }

        try {
            setSaving(true);

            let response;

            if (editingId !== null) {
                response = await axios.put(
                    `/api/membership-plans/${editingId}`,
                    payload,
                    { withCredentials: true }
                );
            } else {
                response = await axios.post(
                    "/api/membership-plans",
                    payload,
                    { withCredentials: true }
                );
            }

            if (response.data.status === true) {
                const message =
                    response.data.message ||
                    (editingId !== null
                        ? "Plan updated successfully"
                        : "Plan created successfully");

                setShowForm(false);
                setEditingId(null);
                setFormData({ ...initialForm });

                await fetchPlans();
                setSuccess(message);
            } else {
                setError(
                    response.data.message ||
                    "Unable to save membership plan"
                );
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to save membership plan"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (deletingId !== null) return;

        const confirmed = window.confirm(
            "Are you sure you want to delete this membership plan?"
        );

        if (!confirmed) return;

        setError("");
        setSuccess("");

        try {
            setDeletingId(id);

            const response = await axios.delete(
                `/api/membership-plans/${id}`,
                { withCredentials: true }
            );

            if (response.data.status === true) {
                setPlans((prev) =>
                    prev.filter(
                        (plan) =>
                            String(plan.id) !== String(id)
                    )
                );

                if (String(editingId) === String(id)) {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ ...initialForm });
                }

                setSuccess(
                    response.data.message ||
                    "Plan deleted successfully"
                );
            } else {
                setError(
                    response.data.message ||
                    "Unable to delete plan"
                );
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to delete membership plan"
            );
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (date) => {
        if (!date) return "N/A";

        const parsed = new Date(date);

        if (Number.isNaN(parsed.getTime())) {
            return "N/A";
        }

        return parsed.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const formatPrice = (price) => {
        const amount = Number(price);

        if (!Number.isFinite(amount)) {
            return "N/A";
        }

        return `₹${amount.toLocaleString("en-IN", {
            maximumFractionDigits: 2
        })}`;
    };

    return (
        <div
            className="container py-5"
            style={{ marginTop: "60px" }}
        >

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>

                    <p className="text-warning fw-bold mb-2">
                        MEMBERSHIP MANAGEMENT
                    </p>

                    <h2 className="fw-bold mb-1">
                        Membership Plans
                    </h2>

                    <p className="text-secondary mb-0">
                        Create and manage GYM PRO membership plans.
                    </p>

                </div>

                <button
                    type="button"
                    className="btn btn-warning fw-semibold"
                    onClick={handleAdd}
                    disabled={saving}
                >
                    Add Plan
                </button>

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

            {/* Add / Edit Plan Form */}
            {showForm && (
                <div className="card border-0 shadow-sm mb-4">

                    <div className="card-body p-4">

                        <h4 className="fw-bold mb-4">
                            {editingId !== null
                                ? "Edit Membership Plan"
                                : "Add Membership Plan"}
                        </h4>

                        <form onSubmit={handleSubmit}>

                            <div className="row g-3">

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Plan Name
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        className="form-control"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter plan name"
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Duration
                                    </label>

                                    <input
                                        type="text"
                                        name="duration"
                                        className="form-control"
                                        value={formData.duration}
                                        onChange={handleChange}
                                        placeholder="e.g. 1 Month"
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Price (₹)
                                    </label>

                                    <input
                                        type="number"
                                        name="price"
                                        className="form-control"
                                        value={formData.price}
                                        onChange={handleChange}
                                        min="0.01"
                                        step="0.01"
                                        placeholder="Enter price"
                                        required
                                    />
                                </div>

                                <div className="col-12">
                                    <label className="form-label">
                                        Description
                                    </label>

                                    <textarea
                                        name="description"
                                        className="form-control"
                                        rows="3"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Enter plan description"
                                        required
                                    />
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
                                            ? "Update Plan"
                                            : "Save Plan"}
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

            {/* Plans Table */}
            <div className="card border-0 shadow-sm">

                <div className="card-body p-0">

                    <div className="table-responsive">

                        <table className="table table-hover align-middle mb-0">

                            <thead className="table-light">

                                <tr>
                                    <th>ID</th>
                                    <th>Plan Name</th>
                                    <th>Duration</th>
                                    <th>Price</th>
                                    <th>Description</th>
                                    <th>Created At</th>
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
                                            Loading membership plans...
                                        </td>
                                    </tr>
                                ) : plans.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="text-center py-4 text-secondary"
                                        >
                                            No membership plans found
                                        </td>
                                    </tr>
                                ) : (
                                    plans.map((plan) => (
                                        <tr key={plan.id}>

                                            <td>{plan.id}</td>

                                            <td className="fw-semibold">
                                                {plan.name}
                                            </td>

                                            <td>
                                                {plan.duration}
                                            </td>

                                            <td className="fw-semibold text-warning">
                                                {formatPrice(plan.price)}
                                            </td>

                                            <td>
                                                {plan.description}
                                            </td>

                                            <td>
                                                {formatDate(plan.created_at)}
                                            </td>

                                            <td>

                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-warning me-2"
                                                    onClick={() => handleEdit(plan)}
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
                                                    onClick={() => handleDelete(plan.id)}
                                                    disabled={
                                                        saving ||
                                                        deletingId !== null
                                                    }
                                                >
                                                    {deletingId === plan.id
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

export default AdminPlans;
