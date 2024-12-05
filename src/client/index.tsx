import '../../public/css/main.css'; // this will apply the css globally
import App from "./App";
import ReactDOM from 'react-dom/client';
import React from 'react';
import {GameSessionSocketProvider} from "./components/GameSessionSocketContext";
import {ThemeProvider} from "./components/ThemeProvider";

window.addEventListener('DOMContentLoaded', () => {
    const rootElement = document.getElementById('root');
    if (rootElement) {
        const root = ReactDOM.createRoot(rootElement);
        root.render(
            <React.StrictMode>
                <GameSessionSocketProvider>
                    <ThemeProvider>
                        <App/>
                    </ThemeProvider>
                </GameSessionSocketProvider>
            </React.StrictMode>
        );
    }
});


