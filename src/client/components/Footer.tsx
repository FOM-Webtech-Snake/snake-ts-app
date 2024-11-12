import React from 'react';
import "../../../public/css/footer.css"; // Importing CSS

const Footer: React.FC = () => {
    // REPO_URL & BUILD_NUMBER are injected by DefinePlugin
    return (
        <footer>
            <div className="container">
                <p>&copy; {new Date().getFullYear()} Snake Extreme (Build: {BUILD_NUMBER})</p>
                <p>
                    <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
                        <i className="fab fa-github"></i>
                    </a>
                </p>
            </div>
        </footer>
    );
};

export default Footer;
