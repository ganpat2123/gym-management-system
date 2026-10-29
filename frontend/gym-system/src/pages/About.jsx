import React from "react";
import { Link } from "react-router-dom";

function About() {
    return (
        <div
            className="container py-5"
            style={{ marginTop: "60px" }}
        >

            {/* Page Heading */}
            <div className="text-center mb-5">

                <p className="text-warning fw-bold mb-2">
                    ABOUT GYM PRO
                </p>

                <h1 className="fw-bold">
                    Get to Know <span className="text-warning">GYM PRO</span>
                </h1>

                <p className="text-secondary">
                    Your trusted partner on the journey to a stronger
                    and healthier lifestyle.
                </p>

            </div>


            {/* Who We Are */}
            <div className="row align-items-center g-5 mb-5">

                <div className="col-lg-6">

                    <img
                        src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=900&q=80"
                        alt="GYM PRO"
                        className="img-fluid rounded-4 shadow"
                    />

                </div>

                <div className="col-lg-6">

                    <h2 className="fw-bold mb-3">
                        Who We Are
                    </h2>

                    <p className="text-secondary">
                        GYM PRO is a professional fitness center designed
                        to help people improve their strength, fitness and
                        overall lifestyle.
                    </p>

                    <p className="text-secondary">
                        We provide modern equipment, experienced trainers
                        and a clean training environment for both beginners
                        and experienced fitness enthusiasts.
                    </p>

                </div>

            </div>


            {/* Mission & Vision */}
            <div className="row g-4 mb-5">

                <div className="col-md-6">

                    <div className="card h-100 shadow-sm border-0 p-4">

                        <h3 className="fw-bold">
                            Our <span className="text-warning">Mission</span>
                        </h3>

                        <p className="text-secondary mt-3 mb-0">
                            Our mission is to help every member achieve
                            their fitness goals through proper training,
                            professional guidance and a motivating
                            environment.
                        </p>

                    </div>

                </div>


                <div className="col-md-6">

                    <div className="card h-100 shadow-sm border-0 p-4">

                        <h3 className="fw-bold">
                            Our <span className="text-warning">Vision</span>
                        </h3>

                        <p className="text-secondary mt-3 mb-0">
                            Our vision is to build a healthier and stronger
                            community by making fitness a part of everyday
                            life.
                        </p>

                    </div>

                </div>

            </div>


            {/* Why Choose GYM PRO */}
            <div className="text-center mb-4">

                <h2 className="fw-bold">
                    Why Choose <span className="text-warning">GYM PRO?</span>
                </h2>

            </div>

            <div className="row g-4 mb-5">

                <div className="col-md-6 col-lg-3">
                    <div className="card h-100 shadow-sm border-0">
                        <div className="card-body text-center p-4">

                            <h5 className="fw-bold">
                                Modern Equipment
                            </h5>

                            <p className="text-secondary mt-3 mb-0">
                                Quality equipment for effective workouts.
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

                            <p className="text-secondary mt-3 mb-0">
                                Professional trainers to guide your journey.
                            </p>

                        </div>
                    </div>
                </div>


                <div className="col-md-6 col-lg-3">
                    <div className="card h-100 shadow-sm border-0">
                        <div className="card-body text-center p-4">

                            <h5 className="fw-bold">
                                Clean Environment
                            </h5>

                            <p className="text-secondary mt-3 mb-0">
                                A clean and comfortable place to train.
                            </p>

                        </div>
                    </div>
                </div>


                <div className="col-md-6 col-lg-3">
                    <div className="card h-100 shadow-sm border-0">
                        <div className="card-body text-center p-4">

                            <h5 className="fw-bold">
                                Flexible Plans
                            </h5>

                            <p className="text-secondary mt-3 mb-0">
                                Membership options for different goals.
                            </p>

                        </div>
                    </div>
                </div>

            </div>


            {/* CTA */}
            <div className="text-center">

                <Link
                    to="/plans"
                    className="btn btn-warning px-4 fw-semibold"
                >
                    View Membership Plans
                </Link>

            </div>

        </div>
    );
}

export default About;