
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [memberships, setMemberships] = useState([]);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        const fetchDashboardData = async () => {
            try {
                const [usersRes, membershipsRes, plansRes] =
                    await Promise.all([
                        axios.get("/api/users", {
                            withCredentials: true
                        }),
                        axios.get("/api/memberships", {
                            withCredentials: true
                        }),
                        axios.get("/api/membership-plans")
                    ]);

                if (!active) return;

                if (
                    usersRes.data.status !== true ||
                    membershipsRes.data.status !== true ||
                    plansRes.data.status !== true
                ) {
                    throw new Error(
                        "Unable to load dashboard data"
                    );
                }

                setUsers(
                    Array.isArray(usersRes.data.data)
                        ? usersRes.data.data
                        : []
                );

                setMemberships(
                    Array.isArray(membershipsRes.data.data)
                        ? membershipsRes.data.data
                        : []
                );

                setPlans(
                    Array.isArray(plansRes.data.data)
                        ? plansRes.data.data
                        : []
                );

            } catch (err) {
                if (!active) return;

                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "Failed to load dashboard data"
                );
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        fetchDashboardData();

        return () => {
            active = false;
        };
    }, []);

    const isActive = (membership) => {
        return String(
            membership.status || ""
        ).toLowerCase() === "active";
    };

    const totalUsers = users.length;

    const activeMembers = new Set(
        memberships
            .filter(isActive)
            .map((membership) => String(membership.user_id))
    ).size;

    const totalPlans = plans.length;

    const currentDate = new Date();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(currentDate.getDate() - 30);

    const newMembers = new Set(
        memberships
            .filter((membership) => {
                if (!membership.start_date) return false;

                const startDate = new Date(
                    membership.start_date
                );

                return (
                    !Number.isNaN(startDate.getTime()) &&
                    startDate >= thirtyDaysAgo &&
                    startDate <= currentDate
                );
            })
            .map((membership) => String(membership.user_id))
    ).size;

    const recentMemberships = [...memberships]
        .sort((a, b) => {
            const dateA = new Date(
                a.start_date || 0
            ).getTime();

            const dateB = new Date(
                b.start_date || 0
            ).getTime();

            return dateB - dateA;
        })
        .slice(0, 5);

    const getUser = (userId) => {
        return users.find(
            (user) =>
                String(user.id) === String(userId)
        );
    };

    const getPlan = (planId) => {
        return plans.find(
            (plan) =>
                String(plan.id) === String(planId)
        );
    };

    return (
        <div
            className="container py-5"
            style={{ marginTop: "60px" }}
        >

            <div className="mb-5">

                <p className="text-warning fw-bold mb-2">
                    ADMIN DASHBOARD
                </p>

                <h2 className="fw-bold">
                    Welcome, <span className="text-warning">Admin!</span>
                </h2>

                <p className="text-secondary">
                    Manage your gym members, memberships and plans.
                </p>

            </div>

            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            <div className="row g-4 mb-5">

                <div className="col-6 col-lg-3">

                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-4">

                            <p className="text-secondary mb-2">
                                Total Users
                            </p>

                            <h3 className="fw-bold">
                                {loading ? "..." : error ? "—" : totalUsers}
                            </h3>

                        </div>
                    </div>

                </div>

                <div className="col-6 col-lg-3">

                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-4">

                            <p className="text-secondary mb-2">
                                Active Members
                            </p>

                            <h3 className="fw-bold text-warning">
                                {loading ? "..." : error ? "—" : activeMembers}
                            </h3>

                        </div>
                    </div>

                </div>

                <div className="col-6 col-lg-3">

                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-4">

                            <p className="text-secondary mb-2">
                                Membership Plans
                            </p>

                            <h3 className="fw-bold">
                                {loading ? "..." : error ? "—" : totalPlans}
                            </h3>

                        </div>
                    </div>

                </div>

                <div className="col-6 col-lg-3">

                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-4">

                            <p className="text-secondary mb-2">
                                New Members
                            </p>

                            <h3 className="fw-bold text-warning">
                                {loading ? "..." : error ? "—" : newMembers}
                            </h3>

                        </div>
                    </div>

                </div>

            </div>

            <div className="row g-4 mb-5">

                <div className="col-lg-8">

                    <div className="card border-0 shadow-sm h-100">

                        <div className="card-body p-4">

                            <h4 className="fw-bold mb-4">
                                Recent Members
                            </h4>

                            <div className="table-responsive">

                                <table className="table align-middle">

                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Plan</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {loading ? (

                                            <tr>
                                                <td
                                                    colSpan="4"
                                                    className="text-center"
                                                >
                                                    Loading members...
                                                </td>
                                            </tr>

                                        ) : error ? (

                                            <tr>
                                                <td
                                                    colSpan="4"
                                                    className="text-center text-danger"
                                                >
                                                    Unable to load members
                                                </td>
                                            </tr>

                                        ) : recentMemberships.length === 0 ? (

                                            <tr>
                                                <td
                                                    colSpan="4"
                                                    className="text-center text-secondary"
                                                >
                                                    No members found
                                                </td>
                                            </tr>

                                        ) : (

                                            recentMemberships.map(
                                                (membership) => {

                                                    const user = getUser(
                                                        membership.user_id
                                                    );

                                                    const plan = getPlan(
                                                        membership.plan_id
                                                    );

                                                    const status =
                                                        membership.status ||
                                                        "Pending";

                                                    return (
                                                        <tr key={membership.id}>

                                                            <td>
                                                                {user?.name || "Unknown User"}
                                                            </td>

                                                            <td>
                                                                {user?.email || "N/A"}
                                                            </td>

                                                            <td>
                                                                {plan?.name ||
                                                                    plan?.plan_name ||
                                                                    "N/A"}
                                                            </td>

                                                            <td>
                                                                <span
                                                                    className={
                                                                        "badge " +
                                                                        (
                                                                            isActive(membership)
                                                                                ? "bg-success"
                                                                                : "bg-warning text-dark"
                                                                        )
                                                                    }
                                                                >
                                                                    {status}
                                                                </span>
                                                            </td>

                                                        </tr>
                                                    );
                                                }
                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

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
                                    to="/admin/users"
                                    className="btn btn-warning"
                                >
                                    Manage Users
                                </Link>

                                <Link
                                    to="/admin/plans"
                                    className="btn btn-outline-warning"
                                >
                                    Manage Membership Plans
                                </Link>

                                <Link
                                    to="/"
                                    className="btn btn-outline-secondary"
                                >
                                    View Website
                                </Link>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

            <div className="card border-0 shadow-sm">

                <div className="card-body p-4 text-center">

                    <h4 className="fw-bold">
                        GYM PRO Management
                    </h4>

                    <p className="text-secondary mb-0">
                        Manage your gym efficiently and keep track of
                        your members and membership plans.
                    </p>

                </div>

            </div>

        </div>
    );
}

export default AdminDashboard;
