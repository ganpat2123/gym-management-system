
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function Plans() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        const fetchPlans = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await axios.get(
                    "/api/membership-plans"
                );

                if (!active) return;

                if (
                    response.data.status === true &&
                    Array.isArray(response.data.data)
                ) {
                    setPlans(response.data.data);
                } else {
                    throw new Error(
                        response.data.message ||
                        "Failed to load membership plans"
                    );
                }

            } catch (err) {
                if (!active) return;

                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "Unable to load membership plans"
                );
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        fetchPlans();

        return () => {
            active = false;
        };
    }, []);

    const formatPrice = (price) => {
        const amount = Number(price);

        if (!Number.isFinite(amount)) {
            return "Price Unavailable";
        }

        return `₹${amount.toLocaleString("en-IN", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        })}`;
    };

    const isPopular = (plan) => {
        return String(plan.name || "")
            .trim()
            .toLowerCase() === "standard";
    };

    return (
        <div
            className="container py-5"
            style={{ marginTop: "60px" }}
        >

            <div className="text-center mb-5">

                <p className="text-warning fw-bold mb-2">
                    MEMBERSHIP PLANS
                </p>

                <h1 className="fw-bold">
                    Choose Your{" "}
                    <span className="text-warning">
                        Plan
                    </span>
                </h1>

                <p className="text-secondary">
                    Select the membership plan that fits your fitness goals.
                </p>

            </div>

            {error && (
                <div
                    className="alert alert-danger text-center"
                    role="alert"
                >
                    {error}
                </div>
            )}

            <div className="row g-4">

                {loading ? (

                    <div className="col-12 text-center py-5">
                        <div
                            className="spinner-border text-warning"
                            role="status"
                        >
                            <span className="visually-hidden">
                                Loading...
                            </span>
                        </div>

                        <p className="text-secondary mt-3">
                            Loading membership plans...
                        </p>
                    </div>

                ) : error ? null : plans.length === 0 ? (

                    <div className="col-12 text-center py-5">
                        <p className="text-secondary">
                            No membership plans available.
                        </p>
                    </div>

                ) : (

                    plans.map((plan) => {

                        const popular = isPopular(plan);

                        return (
                            <div
                                className="col-md-6 col-lg-4"
                                key={plan.id}
                            >

                                <div
                                    className={
                                        popular
                                            ? "card h-100 shadow border-warning"
                                            : "card h-100 shadow-sm border-0"
                                    }
                                >

                                    <div className="card-body text-center p-4">

                                        {popular && (
                                            <span className="badge bg-warning text-dark mb-3">
                                                Most Popular
                                            </span>
                                        )}

                                        <h4 className="fw-bold">
                                            {plan.name}
                                        </h4>

                                        <h2 className="text-warning fw-bold my-3">
                                            {formatPrice(plan.price)}
                                        </h2>

                                        <p className="text-secondary">
                                            {plan.description}
                                        </p>

                                        <p className="text-secondary">
                                            Duration: {plan.duration}
                                        </p>

                                        <Link
                                            to="/register"
                                            className={
                                                popular
                                                    ? "btn btn-warning px-4 mt-3"
                                                    : "btn btn-outline-warning px-4 mt-3"
                                            }
                                        >
                                            Join Now
                                        </Link>

                                    </div>

                                </div>

                            </div>
                        );
                    })

                )}

            </div>

        </div>
    );
}

export default Plans;
