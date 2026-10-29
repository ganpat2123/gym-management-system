import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
    return (
        <footer
            className="pt-5 pb-3"
            style={{ backgroundColor: "#1e3a5f" }}
        >
            <div className="container">

                <div className="row g-4">

                    <div className="col-lg-4">

                        <h4 className="fw-bold text-warning">
                            GYM PRO
                        </h4>

                        <p className="text-white-50 mt-3">
                            Your trusted fitness partner. Train harder,
                            stay stronger and achieve your fitness goals
                            with GYM PRO.
                        </p>

                    </div>

                    <div className="col-6 col-lg-2">

                        <h5 className="text-white fw-bold">
                            Quick Links
                        </h5>

                        <ul className="list-unstyled mt-3">

                            <li className="mb-2">
                                <Link
                                    to="/"
                                    className="text-white-50 text-decoration-none"
                                >
                                    Home
                                </Link>
                            </li>

                            <li className="mb-2">
                                <Link
                                    to="/plans"
                                    className="text-white-50 text-decoration-none"
                                >
                                    Plans
                                </Link>
                            </li>

                            <li className="mb-2">
                                <Link
                                    to="/about"
                                    className="text-white-50 text-decoration-none"
                                >
                                    About
                                </Link>
                            </li>

                            <li>
                                <Link
                                    to="/contact"
                                    className="text-white-50 text-decoration-none"
                                >
                                    Contact
                                </Link>
                            </li>

                        </ul>

                    </div>

                    <div className="col-6 col-lg-3">

                        <h5 className="text-white fw-bold">
                            Membership
                        </h5>

                        <ul className="list-unstyled mt-3">

                            <li className="mb-2 text-white-50">
                                Basic Plan
                            </li>

                            <li className="mb-2 text-white-50">
                                Standard Plan
                            </li>

                            <li className="mb-2 text-white-50">
                                Premium Plan
                            </li>

                            <li className="text-white-50">
                                Personal Training
                            </li>

                        </ul>

                    </div>
        
                    <div className="col-lg-3">

                        <h5 className="text-white fw-bold">
                            Contact Us
                        </h5>

                        <ul className="list-unstyled mt-3">

                            <li className="mb-2 text-white-50">
                                Surat, Gujarat
                            </li>

                            <li className="mb-2 text-white-50">
                                +91 98765 43210
                            </li>

                            <li className="text-white-50">
                                info@gympro.com
                            </li>

                        </ul>

                    </div>

                </div>


                <hr className="border-secondary my-4" />


                <div className="text-center">

                    <p className="text-white-50 mb-0">
                        © 2026 GYM PRO. All Rights Reserved.
                    </p>

                </div>

            </div>
        </footer>
    );
};

export default Footer;