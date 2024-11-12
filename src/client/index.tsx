import '../../public/css/main.css'; // this will apply the css globally
import App from "./components/App";
import ReactDOM from 'react-dom/client';
import React from 'react';

window.addEventListener('DOMContentLoaded', () => {
    const rootElement = document.getElementById('root');
    if (rootElement) {
        const root = ReactDOM.createRoot(rootElement);
        root.render(
            <React.StrictMode>
                <App/>
            </React.StrictMode>
        );
    }
});


