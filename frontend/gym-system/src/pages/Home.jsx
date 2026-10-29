import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
    return (
        <div>

            <section
                className="py-5"
                style={{ backgroundColor: "#f8f9fa", marginTop: "56px" }}
            >
                <div className="container">
                    <div className="row align-items-center min-vh-75">

                        <div className="col-lg-6">

                            <p className="text-warning fw-bold mb-2">
                                WELCOME TO GYM PRO
                            </p>

                            <h1 className="display-3 fw-bold">
                                Build Your
                                <span className="text-warning">
                                    {" "}Strongest Self
                                </span>
                            </h1>

                            <p className="lead text-secondary mt-4">
                                Train harder, stay stronger and achieve your
                                fitness goals with our professional gym,
                                modern equipment and flexible membership plans.
                            </p>

                            <div className="mt-4">
                                <Link
                                    to="/plans"
                                    className="btn btn-warning btn-lg px-4 fw-semibold"
                                >
                                    View Membership Plans
                                </Link>
                            </div>

                        </div>

                        <div className="col-lg-6 mt-5 mt-lg-0">

                            <img
                                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48"
                                alt="Gym workout"
                                className="img-fluid rounded-4 shadow"
                            />

                        </div>

                    </div>
                </div>
            </section>

            <section className="py-5 bg-light">
                <div className="container">

                    <div className="text-center mb-5">
                        <h2 className="fw-bold">
                            Why Choose <span className="text-warning">GYM PRO?</span>
                        </h2>

                        <p className="text-secondary">
                            Everything you need to achieve your fitness goals.
                        </p>
                    </div>

                    <div className="row g-4">

                        <div className="col-md-6 col-lg-3">
                            <div className="card h-100 shadow-sm border-0">
                                <div className="card-body text-center p-4">

                                    <h5 className="fw-bold">
                                        Modern Equipment
                                    </h5>

                                    <p className="text-secondary mt-3">
                                        High-quality equipment for effective
                                        and comfortable workouts.
                                    </p>

                                </div>
                            </div>
                        </div>

                        <div className="col-md-6 col-lg-3">
                            <div className="card h-100 shadow-sm border-0">
                                <div className="card-body text-center p-4">

                                    <h5 className="fw-bold">
                                        Expert Trainers
                                    </h5>

                                    <p className="text-secondary mt-3">
                                        Get professional guidance to improve
                                        your fitness and workout performance.
                                    </p>

                                </div>
                            </div>
                        </div>

                        <div className="col-md-6 col-lg-3">
                            <div className="card h-100 shadow-sm border-0">
                                <div className="card-body text-center p-4">

                                    <h5 className="fw-bold">
                                        Personal Training
                                    </h5>

                                    <p className="text-secondary mt-3">
                                        Follow personalized training programs
                                        based on your fitness goals.
                                    </p>

                                </div>
                            </div>
                        </div>

                        <div className="col-md-6 col-lg-3">
                            <div className="card h-100 shadow-sm border-0">
                                <div className="card-body text-center p-4">

                                    <h5 className="fw-bold">
                                        Flexible Timing
                                    </h5>

                                    <p className="text-secondary mt-3">
                                        Convenient gym timings that fit
                                        your daily schedule.
                                    </p>

                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            </section>

            <section className="py-5">
                <div className="container">

                    <div className="text-center mb-5">
                        <h2 className="fw-bold">
                            Membership <span className="text-warning">Plans</span>
                        </h2>

                        <p className="text-secondary">
                            Choose a membership plan that fits your fitness goals.
                        </p>
                    </div>

                    <div className="row g-4">

                        <div className="col-md-6 col-lg-4">
                            <div className="card h-100 shadow-sm border-0">

                                <div className="card-body text-center p-4">

                                    <h4 className="fw-bold">
                                        Basic
                                    </h4>

                                    <h2 className="fw-bold text-warning my-3">
                                        ₹999
                                        <small className="fs-6 text-secondary">
                                            /Month
                                        </small>
                                    </h2>

                                    <hr />

                                    <ul className="list-unstyled text-secondary">
                                        <li className="mb-3">
                                            ✓ Gym Access
                                        </li>

                                        <li className="mb-3">
                                            ✓ Locker Facility
                                        </li>

                                        <li className="mb-3">
                                            ✓ Modern Equipment
                                        </li>

                                        <li className="mb-3">
                                            ✓ Flexible Timing
                                        </li>
                                    </ul>

                                    <Link
                                        to="/register"
                                        className="btn btn-outline-warning px-4"
                                    >
                                        Join Now
                                    </Link>

                                </div>
                            </div>
                        </div>

                        <div className="col-md-6 col-lg-4">
                            <div className="card h-100 shadow border-warning">

                                <div className="card-body text-center p-4">

                                    <span className="badge bg-warning text-dark mb-3">
                                        Most Popular
                                    </span>

                                    <h4 className="fw-bold">
                                        Standard
                                    </h4>

                                    <h2 className="fw-bold text-warning my-3">
                                        ₹1,499
                                        <small className="fs-6 text-secondary">
                                            /Month
                                        </small>
                                    </h2>

                                    <hr />

                                    <ul className="list-unstyled text-secondary">
                                        <li className="mb-3">
                                            ✓ Gym Access
                                        </li>

                                        <li className="mb-3">
                                            ✓ Locker Facility
                                        </li>

                                        <li className="mb-3">
                                            ✓ Cardio & Strength Training
                                        </li>

                                        <li className="mb-3">
                                            ✓ Diet Guidance
                                        </li>
                                    </ul>

                                    <Link
                                        to="/register"
                                        className="btn btn-warning px-4"
                                    >
                                        Join Now
                                    </Link>

                                </div>
                            </div>
                        </div>

                        <div className="col-md-6 col-lg-4">
                            <div className="card h-100 shadow-sm border-0">

                                <div className="card-body text-center p-4">

                                    <h4 className="fw-bold">
                                        Premium
                                    </h4>

                                    <h2 className="fw-bold text-warning my-3">
                                        ₹2,499
                                        <small className="fs-6 text-secondary">
                                            /Month
                                        </small>
                                    </h2>

                                    <hr />

                                    <ul className="list-unstyled text-secondary">
                                        <li className="mb-3">
                                            ✓ Unlimited Gym Access
                                        </li>

                                        <li className="mb-3">
                                            ✓ Personal Training
                                        </li>

                                        <li className="mb-3">
                                            ✓ Personalized Diet Plan
                                        </li>

                                        <li className="mb-3">
                                            ✓ Priority Support
                                        </li>
                                    </ul>

                                    <Link
                                        to="/register"
                                        className="btn btn-outline-warning px-4"
                                    >
                                        Join Now
                                    </Link>

                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            </section>

            <section className="py-5 bg-light">
                <div className="container">

                    <div className="row align-items-center g-5">

                        <div className="col-lg-6">

                            <img
                                src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=900&q=80"
                                alt="GYM PRO"
                                className="img-fluid rounded-4 shadow"
                            />

                        </div>

                        <div className="col-lg-6">

                            <p className="text-warning fw-bold mb-2">
                                ABOUT GYM PRO
                            </p>

                            <h2 className="fw-bold mb-4">
                                Train Hard.
                                <span className="text-warning">
                                    {" "}Stay Strong.
                                </span>
                            </h2>

                            <p className="text-secondary">
                                At GYM PRO, we provide a professional and motivating
                                environment where members can focus on their fitness
                                goals and build a healthier lifestyle.
                            </p>

                            <p className="text-secondary">
                                Our gym provides modern equipment, professional
                                trainers and flexible membership plans suitable
                                for beginners and experienced fitness enthusiasts.
                            </p>

                            <div className="row mt-4">

                                <div className="col-sm-6 mb-3">
                                    <div className="d-flex align-items-center">
                                        <span className="text-warning fw-bold me-2">
                                            ✓
                                        </span>
                                        <span>
                                            Modern Equipment
                                        </span>
                                    </div>
                                </div>

                                <div className="col-sm-6 mb-3">
                                    <div className="d-flex align-items-center">
                                        <span className="text-warning fw-bold me-2">
                                            ✓
                                        </span>
                                        <span>
                                            Professional Trainers
                                        </span>
                                    </div>
                                </div>

                                <div className="col-sm-6 mb-3">
                                    <div className="d-flex align-items-center">
                                        <span className="text-warning fw-bold me-2">
                                            ✓
                                        </span>
                                        <span>
                                            Clean & Safe Environment
                                        </span>
                                    </div>
                                </div>

                                <div className="col-sm-6 mb-3">
                                    <div className="d-flex align-items-center">
                                        <span className="text-warning fw-bold me-2">
                                            ✓
                                        </span>
                                        <span>
                                            Flexible Membership Plans
                                        </span>
                                    </div>
                                </div>

                            </div>


                            <div className="mt-3">
                                <Link
                                    to="/about"
                                    className="btn btn-warning px-4 fw-semibold"
                                >
                                    Learn More
                                </Link>
                            </div>

                        </div>

                    </div>

                </div>
            </section>

            <section className="py-5">
                <div className="container">

                    <div className="row text-center g-4">

                        <div className="col-6 col-lg-3">
                            <div className="p-4">
                                <h2 className="fw-bold text-warning">
                                    500+
                                </h2>

                                <p className="text-secondary mb-0">
                                    Active Members
                                </p>
                            </div>
                        </div>

                        <div className="col-6 col-lg-3">
                            <div className="p-4">
                                <h2 className="fw-bold text-warning">
                                    10+
                                </h2>

                                <p className="text-secondary mb-0">
                                    Expert Trainers
                                </p>
                            </div>
                        </div>

                        <div className="col-6 col-lg-3">
                            <div className="p-4">
                                <h2 className="fw-bold text-warning">
                                    5+
                                </h2>

                                <p className="text-secondary mb-0">
                                    Years Experience
                                </p>
                            </div>
                        </div>

                        <div className="col-6 col-lg-3">
                            <div className="p-4">
                                <h2 className="fw-bold text-warning">
                                    20+
                                </h2>

                                <p className="text-secondary mb-0">
                                    Fitness Programs
                                </p>
                            </div>
                        </div>

                    </div>

                </div>
            </section>

           <section
    className="py-5"
    style={{ backgroundColor: "#e8f1f8" }}
>
    <div className="container">

        <div className="text-center py-4">

            <p className="text-warning fw-bold mb-2">
                START YOUR FITNESS JOURNEY
            </p>

            <h2 className="fw-bold display-6">
                Ready to Become Your
                <span className="text-warning">
                    {" "}Strongest Self?
                </span>
            </h2>

            <p className="text-secondary mt-3 mb-4">
                Choose a membership plan and start working
                towards a healthier and stronger lifestyle.
            </p>

            <Link
                to="/register"
                className="btn btn-warning btn-lg px-5 fw-semibold"
            >
                Join Now
            </Link>

        </div>

    </div>
</section>

        </div>
    );
};

export default Home;