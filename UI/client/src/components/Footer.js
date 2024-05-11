// Footer.js
import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faTwitter,
  faInstagram,
} from "@fortawesome/free-brands-svg-icons";
import "bootstrap/dist/css/bootstrap.css";

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-5" style={{ marginTop: "auto" }}>
      <Container>
        <Row>
          <Col lg={4} className="mb-4 mb-lg-0">
            <h5 className="mb-3">Connect with Us</h5>
            <p>Stay connected with us on social media.</p>

            <div className="d-flex">
              <a href="#" className="me-3 text-white">
                <FontAwesomeIcon icon={faFacebook} />
              </a>
              <a href="#" className="me-3 text-white">
                <FontAwesomeIcon icon={faTwitter} />
              </a>
              <a href="#" className="text-white">
                <FontAwesomeIcon icon={faInstagram} />
              </a>
            </div>
          </Col>

          <Col lg={4} className="mb-4 mb-lg-0">
            <h5 className="mb-3">Quick Links</h5>
            <ul className="list-unstyled">
              <li>
                <a href="#" className="text-white">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-white">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-white">
                  Contact Us
                </a>
              </li>
            </ul>
          </Col>

          <Col lg={4}>
            <h5 className="mb-3">© 2023 Your Company Name</h5>
            <p className="text-muted small">
              All rights reserved. Designed with{" "}
              <i className="bi bi-heart-fill text-danger"></i> by Your Company
              Name.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
