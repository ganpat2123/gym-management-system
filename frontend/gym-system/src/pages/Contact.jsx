
import React, { useState } from "react";
import axios from "axios";

function Contact() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        setError("");
        setSuccess("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        setError("");
        setSuccess("");

        const payload = {
            name: formData.name.trim(),
            email: formData.email.trim(),
            subject: formData.subject.trim(),
            message: formData.message.trim()
        };

        if (
            !payload.name ||
            !payload.email ||
            !payload.subject ||
            !payload.message
        ) {
            setError("Please fill in all fields.");
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post(
                "/api/contact-messages",
                payload,
                {
                    withCredentials: true
                }
            );

            if (response.data.status !== true) {
                throw new Error(
                    response.data.message ||
                    "Unable to send message"
                );
            }

            setSuccess(
                response.data.message ||
                "Your message has been sent successfully!"
            );

            setFormData({
                name: "",
                email: "",
                subject: "",
                message: ""
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to send message. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="container py-5"
            style={{ marginTop: "60px" }}
        >
            <div className="text-center mb-5">
                <p className="text-warning fw-bold mb-2">
                    CONTACT US
                </p>

                <h1 className="fw-bold">
                    Get In <span className="text-warning">Touch</span>
                </h1>

                <p className="text-secondary">
                    Have a question? We'd love to hear from you.
                </p>
            </div>

            <div className="row g-4">
                <div className="col-lg-5">
                    <div className="card h-100 shadow-sm border-0 p-4">
                        <h3 className="fw-bold mb-4">
                            Contact Information
                        </h3>

                        <div className="mb-4">
                            <h6 className="fw-bold">
                                Location
                            </h6>

                            <p className="text-secondary mb-0">
                                Surat, Gujarat
                            </p>
                        </div>

                        <div className="mb-4">
                            <h6 className="fw-bold">
                                Phone
                            </h6>

                            <p className="text-secondary mb-0">
                                +91 98765 43210
                            </p>
                        </div>

                        <div className="mb-4">
                            <h6 className="fw-bold">
                                Email
                            </h6>

                            <p className="text-secondary mb-0">
                                info@gympro.com
                            </p>
                        </div>

                        <div>
                            <h6 className="fw-bold">
                                Opening Hours
                            </h6>

                            <p className="text-secondary mb-1">
                                Monday - Saturday
                            </p>

                            <p className="text-secondary mb-0">
                                6:00 AM - 10:00 PM
                            </p>
                        </div>
                    </div>
                </div>

                <div className="col-lg-7">
                    <div className="card shadow-sm border-0 p-4">
                        <h3 className="fw-bold mb-4">
                            Send Us a Message
                        </h3>

                        {success && (
                            <div
                                className="alert alert-success"
                                role="status"
                            >
                                {success}
                            </div>
                        )}

                        {error && (
                            <div
                                className="alert alert-danger"
                                role="alert"
                            >
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label">
                                    Name
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    className="form-control"
                                    placeholder="Enter your name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    maxLength={100}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">
                                    Email
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    className="form-control"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    maxLength={255}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">
                                    Subject
                                </label>

                                <input
                                    type="text"
                                    name="subject"
                                    className="form-control"
                                    placeholder="Enter subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    maxLength={200}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">
                                    Message
                                </label>

                                <textarea
                                    name="message"
                                    className="form-control"
                                    rows="5"
                                    placeholder="Enter your message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    maxLength={5000}
                                    required
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-warning px-4 fw-semibold"
                                disabled={loading}
                            >
                                {loading
                                    ? "Sending..."
                                    : "Send Message"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Contact;
