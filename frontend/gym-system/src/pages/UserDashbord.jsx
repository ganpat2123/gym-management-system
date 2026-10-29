
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true
});

function UserDashboard() {
  const [user, setUser] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError("");

        const [userResponse, membershipResponse] =
          await Promise.all([
            api.get("/users/me"),
            api.get("/memberships/mine")
          ]);

        if (!active) return;

        if (
          userResponse.data.status !== true ||
          membershipResponse.data.status !== true
        ) {
          throw new Error(
            "Unable to load dashboard data"
          );
        }

        if (
          !userResponse.data.data ||
          !Array.isArray(membershipResponse.data.data)
        ) {
          throw new Error(
            "Invalid dashboard data received"
          );
        }

        setUser(userResponse.data.data);
        setMemberships(
          membershipResponse.data.data
        );

      } catch (err) {
        if (!active) return;

        setUser(null);
        setMemberships([]);

        setError(
          err.response?.data?.message ||
          err.message ||
          "Unable to load dashboard"
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchDashboardData();

    return () => {
      active = false;
    };
  }, []);

  const getDateOnly = (value) => {
    if (!value) return null;

    if (typeof value === "string") {
      const match = value.match(
        /^(\d{4})-(\d{2})-(\d{2})/
      );

      if (match) {
        return new Date(
          Number(match[1]),
          Number(match[2]) - 1,
          Number(match[3])
        );
      }
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
  };

  const formatDate = (value) => {
    const date = getDateOnly(value);

    if (!date) return "Not Available";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  };

  const formatPrice = (price) => {
    if (
      price === null ||
      price === undefined ||
      price === ""
    ) {
      return "Not Available";
    }

    const amount = Number(price);

    if (!Number.isFinite(amount)) {
      return "Not Available";
    }

    return `₹${amount.toLocaleString("en-IN", {
      maximumFractionDigits: 2
    })}`;
  };

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const sortedMemberships = [...memberships].sort(
    (a, b) => {
      const first = getDateOnly(a.start_date);
      const second = getDateOnly(b.start_date);

      return (
        (second?.getTime() || 0) -
        (first?.getTime() || 0)
      );
    }
  );

  const activeMembership = sortedMemberships.find(
    (membership) => {
      const start = getDateOnly(
        membership.start_date
      );

      const end = getDateOnly(
        membership.end_date
      );

      return (
        String(membership.status || "")
          .toLowerCase() === "active" &&
        start &&
        end &&
        start <= today &&
        end >= today
      );
    }
  );

  const currentMembership =
    activeMembership ||
    sortedMemberships[0] ||
    null;

  const getRemainingDays = () => {
    if (!activeMembership) return null;

    const endDate = getDateOnly(
      activeMembership.end_date
    );

    if (!endDate) return null;

    return Math.max(
      0,
      Math.ceil(
        (endDate.getTime() - today.getTime()) /
        86400000
      )
    );
  };

  const getMembershipStatus = () => {
    if (!currentMembership) {
      return "No Membership";
    }

    const status = String(
      currentMembership.status || ""
    ).toLowerCase();

    const endDate = getDateOnly(
      currentMembership.end_date
    );

    const startDate = getDateOnly(
      currentMembership.start_date
    );

    if (status === "active") {
      if (endDate && endDate < today) {
        return "Expired";
      }

      if (startDate && startDate > today) {
        return "Upcoming";
      }
    }

    return currentMembership.status || "Unknown";
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
      case "upcoming":
        return "bg-warning text-dark";

      default:
        return "bg-secondary";
    }
  };

  const membershipStatus =
    getMembershipStatus();

  const displayValue = (value) => {
    if (loading) return "...";
    if (error) return "—";

    return (
      value === undefined ||
      value === null ||
      value === ""
    )
      ? "Not Available"
      : value;
  };

  const remainingDays = getRemainingDays();

  // Attendance feature has no verified backend API yet.
  // Never display fake attendance numbers.
  const attendanceDays = null;

  return (
    <div
      className="container py-5"
      style={{ marginTop: "60px" }}
    >

      <div className="mb-5">

        <p className="text-warning fw-bold mb-2">
          USER DASHBOARD
        </p>

        <h2 className="fw-bold">
          Welcome,{" "}
          <span className="text-warning">
            {loading
              ? "..."
              : user?.name || "Member"}!
          </span>
        </h2>

        <p className="text-secondary">
          Track your membership and stay on top
          of your fitness journey.
        </p>

      </div>

      {error && (
        <div
          className="alert alert-danger"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="row g-4 mb-5">

        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">

              <p className="text-secondary mb-2">
                Membership
              </p>

              <h4 className="fw-bold text-warning">
                {displayValue(
                  currentMembership?.plan_name
                )}
              </h4>

            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">

              <p className="text-secondary mb-2">
                Duration
              </p>

              <h4 className="fw-bold">
                {displayValue(
                  currentMembership?.plan_duration
                )}
              </h4>

            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">

              <p className="text-secondary mb-2">
                Remaining Days
              </p>

              <h4 className="fw-bold text-warning">
                {loading
                  ? "..."
                  : error
                    ? "—"
                    : remainingDays === null
                      ? "Not Available"
                      : `${remainingDays} Days`}
              </h4>

            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">

              <p className="text-secondary mb-2">
                Attendance
              </p>

              <h4 className="fw-bold">
                {attendanceDays === null
                  ? "Not Available"
                  : `${attendanceDays} Days`}
              </h4>

            </div>
          </div>
        </div>

      </div>

      <div className="row g-4 mb-5">

        <div className="col-lg-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">

              <div className="d-flex justify-content-between align-items-center mb-4">

                <h4 className="fw-bold mb-0">
                  Current Membership
                </h4>

                <span
                  className={
                    "badge " +
                    getStatusClass(membershipStatus)
                  }
                >
                  {loading
                    ? "Loading"
                    : error
                      ? "Unavailable"
                      : membershipStatus}
                </span>

              </div>

              <div className="row g-4">

                <div className="col-sm-6">
                  <p className="text-secondary mb-1">
                    Plan
                  </p>

                  <h6 className="fw-bold">
                    {displayValue(
                      currentMembership?.plan_name
                    )}
                  </h6>
                </div>

                <div className="col-sm-6">
                  <p className="text-secondary mb-1">
                    Price
                  </p>

                  <h6 className="fw-bold">
                    {loading
                      ? "..."
                      : error
                        ? "—"
                        : formatPrice(
                          currentMembership?.plan_price
                        )}
                  </h6>
                </div>

                <div className="col-sm-6">
                  <p className="text-secondary mb-1">
                    Start Date
                  </p>

                  <h6 className="fw-bold">
                    {loading
                      ? "..."
                      : error
                        ? "—"
                        : formatDate(
                          currentMembership?.start_date
                        )}
                  </h6>
                </div>

                <div className="col-sm-6">
                  <p className="text-secondary mb-1">
                    End Date
                  </p>

                  <h6 className="fw-bold">
                    {loading
                      ? "..."
                      : error
                        ? "—"
                        : formatDate(
                          currentMembership?.end_date
                        )}
                  </h6>
                </div>

              </div>

              {!loading && !error &&
                !currentMembership && (
                  <p className="text-secondary mt-4 mb-0">
                    You don't have a membership yet.
                    Explore our membership plans.
                  </p>
                )}

            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">

              <h4 className="fw-bold mb-4">
                Quick Actions
              </h4>

              <div className="d-grid gap-3">

                <Link
                  to="/profile"
                  className="btn btn-outline-warning"
                >
                  View Profile
                </Link>

                <Link
                  to="/plans"
                  className="btn btn-outline-warning"
                >
                  View Membership Plans
                </Link>

                <Link
                  to="/contact"
                  className="btn btn-warning"
                >
                  Contact Gym
                </Link>

              </div>

            </div>
          </div>
        </div>

      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-4 text-center">

          <h4 className="fw-bold">
            Keep Going!
          </h4>

          <p className="text-secondary mb-0">
            Stay consistent with your workouts
            and keep working towards your fitness goals.
          </p>

        </div>
      </div>

    </div>
  );
}

export default UserDashboard;
