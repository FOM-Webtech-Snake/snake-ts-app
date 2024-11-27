import React from 'react';
import "../../../public/css/footer.css";
import {Col, Container, Row} from "react-bootstrap";

const Footer: React.FC = () => {
    // REPO_URL & BUILD_NUMBER are injected by DefinePlugin
    return (
        <footer>
            <Container>
                <Row className="align-items-center">
                    {/* Left side: Copyright */}
                    <Col xs={12} md={6}>
                        <p className="mb-0">&copy; {new Date().getFullYear()} Snake Extreme (Build: {BUILD_NUMBER})</p>
                    </Col>

                    {/* Right side: GitHub icon */}
                    <Col xs={12} md={6} className="text-md-end">
                        <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="text-white">
                            <i className="fab fa-github"></i>
                        </a>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;
