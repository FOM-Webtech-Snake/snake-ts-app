import '../../public/css/main.css'; // this will apply the css globally
import App from "./App";
import ReactDOM from 'react-dom/client';
import React from 'react';
import {GameSessionProvider} from "./components/GameSessionContext";
import {ThemeProvider} from "./components/ThemeProvider";
import {GameStateProvider} from "./components/GameStateContext";

window.addEventListener('DOMContentLoaded', () => {
    const rootElement = document.getElementById('root');
    if (rootElement) {
        const root = ReactDOM.createRoot(rootElement);
        root.render(
            <React.StrictMode>
                <GameSessionProvider>
                    <ThemeProvider>
                        <GameStateProvider>
                            <App/>
                        </GameStateProvider>
                    </ThemeProvider>
                </GameSessionProvider>
            </React.StrictMode>
        );
    }
});


