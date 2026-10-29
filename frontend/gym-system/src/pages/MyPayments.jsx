
import React, { useEffect, useState } from "react";
import axios from "axios";

const api = axios.create({
    baseURL: "/api",
    withCredentials: true
});

function MyPayments() {
    const [payments, setPayments] = useState([]);
    const [memberships, setMemberships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        const fetchPayments = async () => {
            try {
                setLoading(true);
                setError("");

                const [
                    paymentsResponse,
                    membershipsResponse
                ] = await Promise.all([
                    api.get("/payments/mine"),
                    api.get("/memberships/mine")
                ]);

                if (!active) return;

                if (
                    paymentsResponse.data.status !== true ||
                    membershipsResponse.data.status !== true
                ) {
                    throw new Error(
                        "Unable to load payment history"
                    );
                }

                const paymentData =
                    paymentsResponse.data.data;

                const membershipData =
                    membershipsResponse.data.data;

                if (
                    !Array.isArray(paymentData) ||
                    !Array.isArray(membershipData)
                ) {
                    throw new Error(
                        "Invalid payment data received"
                    );
                }

                setPayments(paymentData);
                setMemberships(membershipData);

            } catch (err) {
                if (!active) return;

                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "Unable to load your payments"
                );

                setPayments([]);
                setMemberships([]);
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        fetchPayments();

        return () => {
            active = false;
        };
    }, []);

    const formatAmount = (amount) => {
        if (
            amount === null ||
            amount === undefined ||
            amount === ""
        ) {
            return "Not Available";
        }

        const value = Number(amount);

        if (!Number.isFinite(value)) {
            return "Not Available";
        }

        return `₹${value.toLocaleString("en-IN", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        })}`;
    };

    const formatDate = (value) => {
        if (!value) return "Not Available";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "Not Available";
        }

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const isPaid = (payment) => {
        return [
            "paid",
            "success",
            "successful",
            "completed"
        ].includes(
            String(payment.status || "")
                .trim()
                .toLowerCase()
        );
    };

    const getMembershipName = (payment) => {
        const membership = memberships.find(
            (item) =>
                String(item.id) ===
                String(payment.membership_id)
        );

        if (membership?.plan_name) {
            return membership.plan_name;
        }

        return payment.membership_id
            ? `Membership #${payment.membership_id}`
            : "Not Available";
    };

    const getStatusClass = (status) => {
        switch (
            String(status || "").trim().toLowerCase()
        ) {
            case "paid":
            case "success":
            case "successful":
            case "completed":
                return "bg-success";

            case "pending":
                return "bg-warning text-dark";

            case "failed":
            case "cancelled":
            case "canceled":
                return "bg-danger";

            default:
                return "bg-secondary";
        }
    };

    const sortedPayments = [...payments].sort(
        (a, b) => {
            const first = new Date(
                a.payment_date || 0
            ).getTime();

            const second = new Date(
                b.payment_date || 0
            ).getTime();

            return (
                (Number.isFinite(second) ? second : 0) -
                (Number.isFinite(first) ? first : 0)
            );
        }
    );

    const paidPayments = sortedPayments.filter(isPaid);

    const totalPayments = paidPayments.length;

    const totalAmountPaid = paidPayments.reduce(
        (total, payment) => {
            const amount = Number(payment.amount);

            return total + (
                Number.isFinite(amount) ? amount : 0
            );
        },
        0
    );

    const lastPayment = paidPayments[0] || null;

    return (
        <div
            className="container py-5"
            style={{ marginTop: "60px" }}
        >

            {/* Header */}
            <div className="mb-4">

                <p className="text-warning fw-bold mb-2">
                    MY PAYMENTS
                </p>

                <h2 className="fw-bold mb-1">
                    Payment{" "}
                    <span className="text-warning">
                        History
                    </span>
                </h2>

                <p className="text-secondary mb-0">
                    View your membership payment history.
                </p>

            </div>

            {/* Error Message */}
            {error && (
                <div
                    className="alert alert-danger"
                    role="alert"
                >
                    {error}
                </div>
            )}

            {/* Payment Summary */}
            <div className="row g-4 mb-5">

                <div className="col-md-4">

                    <div className="card border-0 shadow-sm h-100">

                        <div className="card-body p-4">

                            <p className="text-secondary mb-2">
                                Total Payments
                            </p>

                            <h3 className="fw-bold">
                                {loading
                                    ? "..."
                                    : error
                                        ? "—"
                                        : totalPayments}
                            </h3>

                        </div>

                    </div>

                </div>

                <div className="col-md-4">

                    <div className="card border-0 shadow-sm h-100">

                        <div className="card-body p-4">

                            <p className="text-secondary mb-2">
                                Total Amount Paid
                            </p>

                            <h3 className="fw-bold text-warning">
                                {loading
                                    ? "..."
                                    : error
                                        ? "—"
                                        : formatAmount(
                                            totalAmountPaid
                                        )}
                            </h3>

                        </div>

                    </div>

                </div>

                <div className="col-md-4">

                    <div className="card border-0 shadow-sm h-100">

                        <div className="card-body p-4">

                            <p className="text-secondary mb-2">
                                Last Payment
                            </p>

                            <h3 className="fw-bold">
                                {loading
                                    ? "..."
                                    : error
                                        ? "—"
                                        : lastPayment
                                            ? formatDate(
                                                lastPayment.payment_date
                                            )
                                            : "Not Available"}
                            </h3>

                        </div>

                    </div>

                </div>

            </div>

            {/* Payment History */}
            <div className="card border-0 shadow-sm">

                <div className="card-body p-0">

                    <div className="table-responsive">

                        <table className="table table-hover align-middle mb-0">

                            <thead className="table-light">

                                <tr>
                                    <th>ID</th>
                                    <th>Membership</th>
                                    <th>Amount</th>
                                    <th>Payment Date</th>
                                    <th>Status</th>
                                </tr>

                            </thead>

                            <tbody>

                                {loading ? (

                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="text-center py-4"
                                        >
                                            Loading payments...
                                        </td>
                                    </tr>

                                ) : error ? (

                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="text-center py-4 text-danger"
                                        >
                                            Unable to load payment history.
                                        </td>
                                    </tr>

                                ) : sortedPayments.length === 0 ? (

                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="text-center py-4 text-secondary"
                                        >
                                            No payment history found.
                                        </td>
                                    </tr>

                                ) : (

                                    sortedPayments.map((payment) => (

                                        <tr key={payment.id}>

                                            <td>
                                                {payment.id}
                                            </td>

                                            <td className="fw-semibold">
                                                {getMembershipName(payment)}
                                            </td>

                                            <td className="fw-semibold text-warning">
                                                {formatAmount(
                                                    payment.amount
                                                )}
                                            </td>

                                            <td>
                                                {formatDate(
                                                    payment.payment_date
                                                )}
                                            </td>

                                            <td>
                                                <span
                                                    className={
                                                        "badge " +
                                                        getStatusClass(
                                                            payment.status
                                                        )
                                                    }
                                                >
                                                    {payment.status || "N/A"}
                                                </span>
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

export default MyPayments;
