import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const { token } = useAuth();
    const [theme, setThemeState] = useState(localStorage.getItem('app-theme') || 'glass');
    const API_URL = 'http://localhost:8000';

    useEffect(() => {
        // If logged in, fetch current setting from backend
        if (token) {
            const fetchTheme = async () => {
                try {
                    const res = await axios.get(`${API_URL}/settings`);
                    if (res.data.theme) {
                        setThemeState(res.data.theme);
                    }
                } catch (err) {
                    console.error("Theme fetch failed", err);
                }
            };
            fetchTheme();
        }
    }, [token]);

    useEffect(() => {
        // Apply theme to document root
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('app-theme', theme);
    }, [theme]);

    const setTheme = (newTheme) => {
        setThemeState(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
