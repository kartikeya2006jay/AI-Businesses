import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, User, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import '../styles/Auth.css';

const Signup = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        fullName: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await signup(formData.username, formData.email, formData.password, formData.fullName);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.detail || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-bg-blobs">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="auth-card glass"
            >
                <div className="auth-header">
                    <div className="auth-logo-premium">
                        <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
                            <path d="M6 26V6L16 16L26 6V26" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="16" cy="16" r="3" fill="white" />
                        </svg>
                    </div>
                    <h1>
                        <span style={{ fontWeight: 300 }}>MERCHANT</span>
                        <span className="text-primary" style={{ fontWeight: 800, marginLeft: '0.4rem' }}>COPILOT</span>
                    </h1>
                    <p>Initialize your Neural Business ID</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && <div className="auth-error">{error}</div>}

                    <div className="input-grid">
                        <div className="input-group">
                            <label><User size={16} /> Full Name</label>
                            <input
                                name="fullName"
                                type="text"
                                placeholder="John Doe"
                                value={formData.fullName}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="input-group">
                            <label><User size={16} /> Username</label>
                            <input
                                name="username"
                                type="text"
                                placeholder="johndoe"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label><Mail size={16} /> Email Address</label>
                        <input
                            name="email"
                            type="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label><Lock size={16} /> Password</label>
                        <input
                            name="password"
                            type="password"
                            placeholder="Wait, don't tell me!"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="auth-submit" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : <>Sign Up <ArrowRight size={18} /></>}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Already have an account? <Link to="/login">Login</Link></p>
                </div>
            </motion.div>
        </div>
    );
};

export default Signup;
