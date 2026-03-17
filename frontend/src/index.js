import React from 'react';
import ReactDOM from 'react-dom/client';
import Dashboard from './pages/dashboard';

const App = () => {
    return (
        <div className="app-root">
            <Dashboard />
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
