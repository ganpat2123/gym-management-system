
import React, { useEffect, useState } from "react";
import axios from "axios";

function AdminMessages() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        let active = true;

        const fetchMessages = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await axios.get(
                    "/api/contact-messages",
                    {
                        withCredentials: true
                    }
                );

                if (!active) return;

                if (response.data.status === true) {
                    setMessages(
                        Array.isArray(response.data.data)
                            ? response.data.data
                            : []
                    );
                } else {
                    throw new Error(
                        response.data.message ||
                        "Failed to load contact messages"
                    );
                }

            } catch (err) {
                if (!active) return;

                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "Unable to load contact messages"
                );
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        fetchMessages();

        return () => {
            active = false;
        };
    }, []);

    const handleDelete = async (id) => {
        if (deletingId !== null) return;

        const confirmed = window.confirm(
            "Are you sure you want to delete this message?"
        );

        if (!confirmed) return;

        setError("");
        setSuccess("");

        try {
            setDeletingId(id);

            const response = await axios.delete(
                `/api/contact-messages/${id}`,
                {
                    withCredentials: true
                }
            );

            if (response.data.status === true) {
                setMessages((previous) =>
                    previous.filter(
                        (message) =>
                            String(message.id) !== String(id)
                    )
                );

                setSuccess(
                    response.data.message ||
                    "Message deleted successfully"
                );
            } else {
                setError(
                    response.data.message ||
                    "Failed to delete message"
                );
            }

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to delete message"
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

    const sortedMessages = [...messages].sort((a, b) => {
        const dateA = new Date(
            a.created_at || 0
        ).getTime();

        const dateB = new Date(
            b.created_at || 0
        ).getTime();

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
            <div className="mb-4">

                <p className="text-warning fw-bold mb-2">
                    CONTACT MANAGEMENT
                </p>

                <h2 className="fw-bold mb-1">
                    Contact Messages
                </h2>

                <p className="text-secondary mb-0">
                    View messages received from website visitors.
                </p>

            </div>

            {/* Alert Messages */}
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

            {/* Messages */}
            <div className="card border-0 shadow-sm">

                <div className="card-body p-0">

                    <div className="table-responsive">

                        <table className="table table-hover align-middle mb-0">

                            <thead className="table-light">

                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Message</th>
                                    <th>Created At</th>
                                    <th>Actions</th>
                                </tr>

                            </thead>

                            <tbody>

                                {loading ? (

                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="text-center py-4"
                                        >
                                            Loading messages...
                                        </td>
                                    </tr>

                                ) : error && messages.length === 0 ? (

                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="text-center py-4 text-danger"
                                        >
                                            Unable to load messages
                                        </td>
                                    </tr>

                                ) : sortedMessages.length === 0 ? (

                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="text-center py-4 text-secondary"
                                        >
                                            No contact messages found
                                        </td>
                                    </tr>

                                ) : (

                                    sortedMessages.map((message) => (

                                        <tr key={message.id}>

                                            <td>
                                                {message.id}
                                            </td>

                                            <td className="fw-semibold">
                                                {message.name || "N/A"}
                                            </td>

                                            <td>
                                                {message.email || "N/A"}
                                            </td>

                                            <td style={{
                                                whiteSpace: "pre-wrap",
                                                overflowWrap: "anywhere"
                                            }}>
                                                {message.message || "N/A"}
                                            </td>

                                            <td>
                                                {formatDate(
                                                    message.created_at
                                                )}
                                            </td>

                                            <td>

                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() =>
                                                        handleDelete(message.id)
                                                    }
                                                    disabled={
                                                        deletingId !== null
                                                    }
                                                >
                                                    {deletingId === message.id
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

export default AdminMessages;
