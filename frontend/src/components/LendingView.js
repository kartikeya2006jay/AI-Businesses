import React, { useState, useEffect } from 'react';
import { BookOpen, User, IndianRupee, Clock, CheckCircle, Search, Filter, ArrowRight } from 'lucide-react';
import { getLending, payLending } from '../services/api';
import '../styles/LendingView.css';

const LendingView = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [payModal, setPayModal] = useState(null); // { customer_name, balance }
    const [payAmount, setPayAmount] = useState('');

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        try {
            const res = await getLending();
            setRecords(res.data);
        } catch (err) {
            console.error("Failed to fetch lending records", err);
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        try {
            await payLending({
                customer_name: payModal.customer_name,
                amount_paid: parseFloat(payAmount)
            });
            setPayModal(null);
            setPayAmount('');
            fetchRecords();
        } catch (err) {
            alert("Payment failed: " + err.message);
        }
    };

    const filteredRecords = records.filter(r =>
        r.customer_name.toLowerCase().includes(search.toLowerCase()) && r.balance > 0
    );

    const totalOutstanding = records.reduce((sum, r) => sum + (r.balance > 0 ? r.balance : 0), 0);

    return (
        <div className="lending-view">
            <div className="view-header">
                <div>
                    <h2>Khata Book (Udhaar)</h2>
                    <p>Track credit sales and customer balances</p>
                </div>
                <div className="stats-badge highlight">
                    <IndianRupee size={16} />
                    <span>Total Outstanding: ₹{totalOutstanding.toLocaleString()}</span>
                </div>
            </div>

            <div className="search-bar glass">
                <Search size={18} className="search-icon" />
                <input
                    type="text"
                    placeholder="Search customer by name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="loading-state">Loading records...</div>
            ) : filteredRecords.length === 0 ? (
                <div className="empty-state glass">
                    <BookOpen size={48} />
                    <p>No active credit records found.</p>
                </div>
            ) : (
                <div className="records-grid">
                    {filteredRecords.map((record, idx) => (
                        <div key={idx} className="record-card glass">
                            <div className="card-top">
                                <div className="user-icon">
                                    <User size={24} />
                                </div>
                                <div className="user-info">
                                    <h3>{record.customer_name}</h3>
                                    <span className="last-tx">Last Activity: {record.last_transaction}</span>
                                </div>
                            </div>
                            <div className="card-amount">
                                <span className="label">Balance Due</span>
                                <span className="value">₹{record.balance.toLocaleString()}</span>
                            </div>
                            <button
                                className="pay-btn"
                                onClick={() => setPayModal(record)}
                            >
                                <ArrowRight size={18} />
                                Record Payment
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {payModal && (
                <div className="modal-overlay">
                    <div className="modal glass shadow-bold">
                        <h3>Record Payment</h3>
                        <p>Customer: <strong>{payModal.customer_name}</strong></p>
                        <p>Outstanding: <strong>₹{payModal.balance}</strong></p>

                        <form onSubmit={handlePayment} style={{ marginTop: '1.5rem' }}>
                            <div className="form-group">
                                <label>Amount Paid (₹)</label>
                                <input
                                    type="number"
                                    required
                                    max={payModal.balance}
                                    value={payAmount}
                                    onChange={(e) => setPayAmount(e.target.value)}
                                    placeholder="Enter amount..."
                                    autoFocus
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="outline-btn" onClick={() => setPayModal(null)}>Cancel</button>
                                <button type="submit" className="save-btn">Confirm Payment</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LendingView;
