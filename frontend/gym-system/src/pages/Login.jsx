
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true
});

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");

    const email = formData.email.trim();
    const password = formData.password;

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const loginResponse = await api.post(
        "/users/login",
        { email, password }
      );

      if (loginResponse.data.status !== true) {
        throw new Error(
          loginResponse.data.message ||
          "Login failed."
        );
      }

      // Read the authenticated user from the backend.
      const userResponse = await api.get("/users/me");

      if (
        userResponse.data.status !== true ||
        !userResponse.data.data
      ) {
        throw new Error(
          "Unable to verify your account."
        );
      }

      const user = userResponse.data.data;

      const role = String(
        user.role || ""
      ).toLowerCase();

      if (role === "admin") {
        navigate("/admin/dashboard", {
          replace: true
        });
      } else if (role === "user") {
        navigate("/user/dashboard", {
          replace: true
        });
      } else {
        throw new Error(
          "Your account role is not supported."
        );
      }

    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to login. Please try again."
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
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow border-0 p-4">

            <h3 className="text-center fw-bold mb-4">
              Welcome Back
            </h3>

            <p className="text-center text-secondary mb-4">
              Login to your GYM PRO account
            </p>

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
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
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
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-warning w-100 fw-semibold"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>

              <p className="text-center mt-3 mb-0">
                Don't have an account?{" "}

                <Link
                  to="/register"
                  className="text-decoration-none"
                >
                  Register
                </Link>
              </p>

            </form>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
