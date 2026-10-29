
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (!/^\d{10}$/.test(formData.phone)) {
            setError("Phone number must be 10 digits");
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post(
                "http://localhost:8080/api/users/register",
                {
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    phone: formData.phone,
                    password: formData.password
                }
            );

            if (response.data.status === true) {
                setSuccess(response.data.message);

                setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    password: "",
                    confirmPassword: ""
                });

                navigate("/login", {
                    state: {
                        message: "Registration successful! Please login."
                    }
                });
            } else {
                setError(
                    response.data.message || "Registration failed"
                );
            }

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5" style={{ marginTop: "60px" }}>

            <div className="row justify-content-center">

                <div className="col-md-6 col-lg-5">

                    <div className="card shadow border-0 p-4">

                        <h3 className="text-center fw-bold mb-4">
                            Create Your Account
                        </h3>

                        {error && (
                            <div className="alert alert-danger">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="alert alert-success">
                                {success}
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
                                    value={formData.name}
                                    onChange={handleChange}
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
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-3">
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

                            <div className="mb-3">
                                <label className="form-label">
                                    Password
                                </label>

                                <input
                                    type="password"
                                    name="password"
                                    className="form-control"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">
                                    Confirm Password
                                </label>

                                <input
                                    type="password"
                                    name="confirmPassword"
                                    className="form-control"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-warning w-100"
                                disabled={loading}
                            >
                                {loading ? "Registering..." : "Register"}
                            </button>

                            <p className="text-center mt-3 mb-0">
                                Already have an account?{" "}
                                <Link to="/login" className="text-decoration-none">
                                    Login
                                </Link>
                            </p>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;