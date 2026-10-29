
import React, { useEffect, useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";

import axios from "axios";

import "./App.css";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Plans from "./pages/Plans";
import About from "./pages/About";
import Contact from "./pages/Contact";

import UserDashboard from "./pages/UserDashbord";
import Profile from "./pages/Profile";
import MyPayments from "./pages/MyPayments";

import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminTrainers from "./pages/AdminTrainers";
import AdminPlans from "./pages/AdminPlans";
import AdminMemberships from "./pages/AdminMemberships";
import AdminPayments from "./pages/AdminPayments";
import AdminMessages from "./pages/AdminMessages";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true
});

function LoadingPage() {
  return (
    <div
      className="container d-flex justify-content-center align-items-center"
      style={{ minHeight: "70vh", paddingTop: "80px" }}
    >
      <div className="text-center">
        <div
          className="spinner-border text-warning"
          role="status"
        >
          <span className="visually-hidden">
            Loading...
          </span>
        </div>

        <p className="text-secondary mt-3">
          Checking your account...
        </p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function checkAuthentication() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/users/me");

        if (!active) return;

        if (
          response.data.status === true &&
          response.data.data
        ) {
          setUser(response.data.data);
        } else {
          setUser(null);
        }
      } catch (err) {
        if (!active) return;

        setUser(null);

        if (err.response?.status !== 401) {
          setError(
            "Unable to verify your account. Please try again."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    checkAuthentication();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <LoadingPage />;
  }

  if (error) {
    return (
      <div
        className="container py-5"
        style={{ marginTop: "80px" }}
      >
        <div className="alert alert-danger">
          {error}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  const role = String(user.role || "").toLowerCase();

  if (!allowedRoles.includes(role)) {
    return (
      <Navigate
        to={
          role === "admin"
            ? "/admin/dashboard"
            : "/user/dashboard"
        }
        replace
      />
    );
  }

  return children;
}

function GuestRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        const response = await api.get("/users/me");

        if (!active) return;

        if (response.data.status === true) {
          setUser(response.data.data);
        }
      } catch (err) {
        if (!active) return;

        if (err.response?.status !== 401) {
          setError("Unable to check your login status.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    checkSession();

    return () => {
      active = false;
    };
  }, []);

  if (loading) return <LoadingPage />;

  if (error) {
    return (
      <div
        className="container py-5"
        style={{ marginTop: "80px" }}
      >
        <div className="alert alert-danger">
          {error}
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <Navigate
        to={
          user.role === "admin"
            ? "/admin/dashboard"
            : "/user/dashboard"
        }
        replace
      />
    );
  }

  return children;
}

function NotFound() {
  return (
    <div
      className="container text-center py-5"
      style={{ marginTop: "100px", minHeight: "60vh" }}
    >
      <h1 className="display-3 fw-bold text-warning">
        404
      </h1>

      <h3 className="fw-bold">
        Page Not Found
      </h3>

      <p className="text-secondary">
        The page you are looking for does not exist.
      </p>

      <a href="/" className="btn btn-warning px-4 mt-3">
        Back to Home
      </a>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/contact" element={<Contact />} />

        {/* Guest Authentication */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />

        <Route
          path="/register"
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }
        />

        {/* Member Pages */}
        <Route
          path="/user/dashboard"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["user", "admin"]}>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-payments"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <MyPayments />
            </ProtectedRoute>
          }
        />

        {/* Admin Pages */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/trainers"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminTrainers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/plans"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminPlans />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/memberships"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminMemberships />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/payments"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminPayments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/messages"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminMessages />
            </ProtectedRoute>
          }
        />

        {/* Unknown Routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;
