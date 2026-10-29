
import React, { useEffect, useState } from "react";
import axios from "axios";

const initialForm = {
    name: "",
    specialization: "",
    experience: "",
    phone: "",
    description: "",
    image: ""
};

function AdminTrainers() {
    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState(initialForm);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fetchTrainers = async () => {
        try {
            setLoading(true);

            const response = await axios.get("/api/trainers");

            if (response.data.status === true) {
                setTrainers(
                    Array.isArray(response.data.data)
                        ? response.data.data
                        : []
                );
            } else {
                throw new Error(
                    response.data.message ||
                    "Failed to load trainers"
                );
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to fetch trainers"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrainers();
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

    const handleEdit = (trainer) => {
        setEditingId(trainer.id);

        setFormData({
            name: trainer.name || "",
            specialization: trainer.specialization || "",
            experience: String(trainer.experience ?? ""),
            phone: String(trainer.phone || ""),
            description: trainer.description || "",
            image: trainer.image || ""
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
            specialization: formData.specialization.trim(),
            experience: formData.experience.trim(),
            phone: formData.phone.trim(),
            description: formData.description.trim(),
            image: formData.image.trim()
        };

        if (Object.values(payload).some((value) => !value)) {
            setError("All fields are required");
            return;
        }

        if (!/^\d{10}$/.test(payload.phone)) {
            setError("Phone number must be 10 digits");
            return;
        }

        if (!Number.isFinite(Number(payload.experience)) ||
            Number(payload.experience) <= 0) {
            setError("Enter valid trainer experience");
            return;
        }

        try {
            setSaving(true);

            let response;

            if (editingId !== null) {
                response = await axios.put(
                    `/api/trainers/${editingId}`,
                    payload,
                    { withCredentials: true }
                );
            } else {
                response = await axios.post(
                    "/api/trainers",
                    payload,
                    { withCredentials: true }
                );
            }

            if (response.data.status === true) {
                const message =
                    response.data.message ||
                    (editingId !== null
                        ? "Trainer updated successfully"
                        : "Trainer added successfully");

                setShowForm(false);
                setEditingId(null);
                setFormData({ ...initialForm });

                await fetchTrainers();
                setError("");
                setSuccess(message);
            } else {
                setError(
                    response.data.message ||
                    "Unable to save trainer"
                );
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to save trainer"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (deletingId !== null) return;

        const confirmed = window.confirm(
            "Are you sure you want to delete this trainer?"
        );

        if (!confirmed) return;

        setError("");
        setSuccess("");

        try {
            setDeletingId(id);

            const response = await axios.delete(
                `/api/trainers/${id}`,
                { withCredentials: true }
            );

            if (response.data.status === true) {
                setTrainers((prev) =>
                    prev.filter(
                        (trainer) =>
                            String(trainer.id) !== String(id)
                    )
                );

                if (String(editingId) === String(id)) {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ ...initialForm });
                }

                setSuccess(
                    response.data.message ||
                    "Trainer deleted successfully"
                );
            } else {
                setError(
                    response.data.message ||
                    "Unable to delete trainer"
                );
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to delete trainer"
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

    return (
        <div
            className="container py-5"
            style={{ marginTop: "60px" }}
        >

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>
                    <p className="text-warning fw-bold mb-2">
                        TRAINER MANAGEMENT
                    </p>

                    <h2 className="fw-bold mb-1">
                        All Trainers
                    </h2>

                    <p className="text-secondary mb-0">
                        Manage GYM PRO trainers and their information.
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-warning fw-semibold"
                    onClick={handleAdd}
                    disabled={saving}
                >
                    Add Trainer
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

            {/* Add / Edit Trainer Form */}
            {showForm && (
                <div className="card border-0 shadow-sm mb-4">

                    <div className="card-body p-4">

                        <h4 className="fw-bold mb-4">
                            {editingId !== null
                                ? "Edit Trainer"
                                : "Add New Trainer"}
                        </h4>

                        <form onSubmit={handleSubmit}>

                            <div className="row g-3">

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Trainer Name
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
                                        Specialization
                                    </label>

                                    <input
                                        type="text"
                                        name="specialization"
                                        className="form-control"
                                        value={formData.specialization}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Experience (Years)
                                    </label>

                                    <input
                                        type="number"
                                        name="experience"
                                        className="form-control"
                                        value={formData.experience}
                                        onChange={handleChange}
                                        min="1"
                                        step="1"
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Phone Number
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
                                        required
                                    />
                                </div>

                                <div className="col-12">
                                    <label className="form-label">
                                        Trainer Image URL
                                    </label>

                                    <input
                                        type="url"
                                        name="image"
                                        className="form-control"
                                        placeholder="https://example.com/trainer.jpg"
                                        value={formData.image}
                                        onChange={handleChange}
                                        required
                                    />

                                    <small className="text-secondary">
                                        Enter a valid public image URL.
                                    </small>
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
                                            ? "Update Trainer"
                                            : "Save Trainer"}
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

            {/* Trainers Table */}
            <div className="card border-0 shadow-sm">

                <div className="card-body p-0">

                    <div className="table-responsive">

                        <table className="table table-hover align-middle mb-0">

                            <thead className="table-light">

                                <tr>
                                    <th>ID</th>
                                    <th>Trainer</th>
                                    <th>Specialization</th>
                                    <th>Experience</th>
                                    <th>Phone</th>
                                    <th>Description</th>
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
                                            Loading trainers...
                                        </td>
                                    </tr>
                                ) : trainers.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="8"
                                            className="text-center py-4 text-secondary"
                                        >
                                            No trainers found
                                        </td>
                                    </tr>
                                ) : (
                                    trainers.map((trainer) => (
                                        <tr key={trainer.id}>

                                            <td>{trainer.id}</td>

                                            <td>
                                                <div className="d-flex align-items-center">

                                                    <img
                                                        src={trainer.image}
                                                        alt={trainer.name}
                                                        width="50"
                                                        height="50"
                                                        className="rounded-circle object-fit-cover me-3"
                                                    />

                                                    <span className="fw-semibold">
                                                        {trainer.name}
                                                    </span>

                                                </div>
                                            </td>

                                            <td>
                                                {trainer.specialization}
                                            </td>

                                            <td>
                                                {trainer.experience} Years
                                            </td>

                                            <td>
                                                {trainer.phone}
                                            </td>

                                            <td>
                                                {trainer.description}
                                            </td>

                                            <td>
                                                {formatDate(trainer.created_at)}
                                            </td>

                                            <td>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-warning me-2"
                                                    onClick={() => handleEdit(trainer)}
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
                                                    onClick={() => handleDelete(trainer.id)}
                                                    disabled={
                                                        saving ||
                                                        deletingId !== null
                                                    }
                                                >
                                                    {deletingId === trainer.id
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

export default AdminTrainers;
