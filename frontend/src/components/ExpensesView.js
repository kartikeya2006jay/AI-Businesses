import React, { useState, useEffect } from 'react';
import { IndianRupee, Plus, History, Tag, FileText, Calendar } from 'lucide-react';
import axios from 'axios';
import '../styles/ExpensesView.css';

const ExpensesView = () => {
    const [expenses, setExpenses] = useState([]);
    const [category, setCategory] = useState('Misc');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const categories = ['Rent', 'Inventory', 'Salary', 'Electricity', 'Misc', 'Tax'];

    const fetchExpenses = async () => {
        try {
            const response = await axios.get('http://localhost:8000/expenses');
            setExpenses(response.data.reverse());
        } catch (error) {
            console.error("Error fetching expenses:", error);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!amount || amount <= 0) return;

        setLoading(true);
        try {
            await axios.post('http://localhost:8000/expenses', {
                category,
                amount: parseFloat(amount),
                description
            });
            setAmount('');
            setDescription('');
            fetchExpenses();
            alert("Expense recorded successfully!");
        } catch (error) {
            alert("Error recording expense: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const categoryTotals = expenses.reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
        return acc;
    }, {});

    const totalAmount = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

    const categoryColors = {
        'Rent': '#ef4444',
        'Inventory': '#3b82f6',
        'Salary': '#10b981',
        'Electricity': '#f59e0b',
        'Misc': '#6366f1',
        'Tax': '#ec4899'
    };

    const getGradientStr = () => {
        let currentPerc = 0;
        const parts = [];
        Object.entries(categoryTotals).forEach(([cat, amt]) => {
            const perc = (amt / totalAmount) * 100;
            parts.push(`${categoryColors[cat] || '#ccc'} ${currentPerc}% ${(currentPerc + perc)}%`);
            currentPerc += perc;
        });
        return parts.length > 0 ? `conic-gradient(${parts.join(', ')})` : 'rgba(255,255,255,0.05)';
    };

    return (
        <div className="expenses-view">
            <div className="khata-header">
                <h2><FileText size={32} /> Expense Tracker</h2>
            </div>

            <div className="expenses-main-layout">
                {/* ── TOP SECTION: Visualization ── */}
                <div className="expense-viz-card glass">
                    <div className="viz-header">
                        <h3>Expense Distribution</h3>
                        <div className="total-badge">Total: ₹{totalAmount.toLocaleString()}</div>
                    </div>
                    <div className="viz-content">
                        <div className="pie-chart-container">
                            <div className="custom-pie" style={{ background: getGradientStr() }}>
                                <div className="pie-center">
                                    <span>Expenses</span>
                                </div>
                            </div>
                        </div>
                        <div className="pie-legend">
                            {Object.entries(categoryTotals).map(([cat, amt]) => (
                                <div key={cat} className="legend-item">
                                    <span className="dot" style={{ backgroundColor: categoryColors[cat] }}></span>
                                    <span className="label">{cat}</span>
                                    <span className="perc">{((amt / totalAmount) * 100).toFixed(1)}%</span>
                                </div>
                            ))}
                            {Object.entries(categoryTotals).length === 0 && (
                                <p className="empty-hint">Add expenses to see distribution</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="expenses-grid">
                    <div className="expense-form-container glass">
                        <h3>Record New Expense</h3>
                        <form className="expense-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label><Tag size={12} /> Category</label>
                                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label><IndianRupee size={12} /> Amount</label>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label><FileText size={12} /> Description</label>
                                <textarea
                                    placeholder="Details about this expense..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows="3"
                                />
                            </div>
                            <button type="submit" className="add-expense-btn" disabled={loading}>
                                {loading ? 'Recording...' : 'Add Expense'}
                            </button>
                        </form>
                    </div>

                    <div className="expense-history-container glass">
                        <div className="khata-header" style={{ marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1.2rem' }}><History size={20} /> Recent Expenses</h3>
                        </div>
                        <div className="expense-history">
                            {expenses.length === 0 ? (
                                <div className="empty-expenses">No expenses recorded yet.</div>
                            ) : (
                                expenses.map((exp, idx) => (
                                    <div key={idx} className="expense-item">
                                        <div className="expense-info">
                                            <span className="cat" style={{ borderLeft: `3px solid ${categoryColors[exp.category] || '#ccc'}` }}>
                                                {exp.category}
                                            </span>
                                            <div className="desc">{exp.description || 'No description'}</div>
                                            <div className="date"><Calendar size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} /> {exp.date}</div>
                                        </div>
                                        <div className="expense-amount">-₹{exp.amount.toLocaleString()}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpensesView;
