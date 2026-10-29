
import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true
});

const guestLinks = [
  { label: "Home", to: "/" },
  { label: "Membership Plans", to: "/plans" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" }
];

const memberLinks = [
  { label: "Home", to: "/" },
  { label: "Plans", to: "/plans" },
  { label: "Dashboard", to: "/user/dashboard" },
  { label: "My Payments", to: "/my-payments" },
  { label: "Profile", to: "/profile" }
];

const adminLinks = [
  { label: "Dashboard", to: "/admin/dashboard" },
  { label: "Users", to: "/admin/users" },
  { label: "Trainers", to: "/admin/trainers" },
  { label: "Plans", to: "/admin/plans" },
  { label: "Memberships", to: "/admin/memberships" },
  { label: "Payments", to: "/admin/payments" },
  { label: "Messages", to: "/admin/messages" }
];

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        setChecking(true);

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
      } catch (error) {
        if (!active) return;

        if (error.response?.status === 401) {
          setUser(null);
        } else {
          console.error("Session check failed", error);
        }
      } finally {
        if (active) setChecking(false);
      }
    }

    checkSession();

    return () => {
      active = false;
    };
  }, [location.pathname]);

  async function handleLogout() {
    if (loggingOut) return;

    try {
      setLoggingOut(true);

      await api.post("/users/logout");

      setUser(null);
      setOpen(false);

      sessionStorage.removeItem("gymUserId");

      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed", error);
      window.alert(
        error.response?.data?.message ||
        "Unable to logout. Please try again."
      );
    } finally {
      setLoggingOut(false);
    }
  }

  const role = user?.role?.toLowerCase();

  const links =
    role === "admin"
      ? adminLinks
      : role === "user"
        ? memberLinks
        : guestLinks;

  const isLoggedIn = role === "admin" || role === "user";

  return (
    <nav
      className="navbar navbar-expand-lg fixed-top navbar-dark"
      style={{ backgroundColor: "#1e3a5f" }}
    >
      <div className="container">
        <NavLink
          className="navbar-brand fw-bold text-warning"
          to="/"
        >
          GYM PRO
        </NavLink>

        <button
          type="button"
          className="navbar-toggler"
          aria-label="Toggle navigation"
          aria-expanded={open}
          aria-controls="navbarNav"
          onClick={() => setOpen(!open)}
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div
          id="navbarNav"
          className={
            "collapse navbar-collapse " +
            (open ? "show" : "")
          }
        >
          <ul className="navbar-nav ms-auto align-items-lg-center">
            {!checking &&
              links.map((link) => (
                <li
                  className="nav-item"
                  key={link.to}
                >
                  <NavLink
                    to={link.to}
                    end={link.to === "/"}
                    className={({ isActive }) =>
                      "nav-link px-lg-2 " +
                      (isActive
                        ? "text-warning fw-semibold"
                        : "text-white")
                    }
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}

            {!checking && !isLoggedIn && (
              <>
                <li className="nav-item ms-lg-3 my-2 my-lg-0">
                  <NavLink
                    to="/login"
                    className="btn btn-warning px-4 fw-semibold"
                    onClick={() => setOpen(false)}
                  >
                    Login
                  </NavLink>
                </li>

                <li className="nav-item ms-lg-2">
                  <NavLink
                    to="/register"
                    className="btn btn-outline-warning px-4 fw-semibold"
                    onClick={() => setOpen(false)}
                  >
                    Join Now
                  </NavLink>
                </li>
              </>
            )}

            {!checking && isLoggedIn && (
              <li className="nav-item ms-lg-3 mt-2 mt-lg-0">
                <button
                  type="button"
                  className="btn btn-outline-warning px-4 fw-semibold"
                  onClick={handleLogout}
                  disabled={loggingOut}
                >
                  {loggingOut ? "Logging out..." : "Logout"}
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
