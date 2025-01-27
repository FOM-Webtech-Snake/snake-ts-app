import React, {forwardRef} from 'react';
import {Col, Container, Row} from "react-bootstrap";

const Footer= forwardRef<HTMLDivElement, {}>((_, ref) => {
    // REPO_URL & BUILD_NUMBER are injected by DefinePlugin
    return (
        <footer ref={ref} className="bg-dark text-light py-3 fixed-bottom">
            <Container>
                <Row>
                    {/* Left side: Copyright */}
                    <Col xs={10} md={6}>
                        <span>&copy; {new Date().getFullYear()} Snake Extreme (Build: {APP_VERSION})</span>
                    </Col>

                    {/* Right side: GitHub icon */}
                    <Col xs={2} md={6} className="text-end">
                        <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="text-light me-3">
                            <i className="fab fa-github"></i>
                        </a>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
});

export default Footer;
