import React, { useState, useEffect } from 'react';
import { BookOpen, UserCheck, IndianRupee, Clock, ArrowRight, CheckCircle } from 'lucide-react';
import axios from 'axios';
import '../styles/KhataView.css';

const KhataView = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLending = async () => {
        try {
            const response = await axios.get('http://localhost:8000/lending');
            setCustomers(response.data);
        } catch (error) {
            console.error("Error fetching lending data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLending();
    }, []);

    const totalOutstanding = customers.reduce((sum, c) => sum + c.balance, 0);

    const handleSettle = async (name) => {
        const amount = prompt(`Enter amount paid by ${name}:`);
        if (!amount || isNaN(amount)) return;

        try {
            await axios.post('http://localhost:8000/lending/pay', {
                customer_name: name,
                amount_paid: parseFloat(amount)
            });
            fetchLending(); // Refresh
            alert(`Payment recorded for ${name}`);
        } catch (error) {
            alert("Error settling amount: " + error.message);
        }
    };

    if (loading) return <div className="khata-view">Loading Khata Book...</div>;

    return (
        <div className="khata-view">
            <div className="khata-header">
                <h2><BookOpen size={32} /> Digital Khata Book</h2>
            </div>

            <div className="khata-stats">
                <div className="stat-card alert">
                    <h4>Total Outstanding</h4>
                    <div className="amount">₹{totalOutstanding.toLocaleString()}</div>
                </div>
                <div className="stat-card">
                    <h4>Active Debtors</h4>
                    <div className="amount">{customers.filter(c => c.balance > 0).length}</div>
                </div>
            </div>

            <div className="customer-list">
                <div className="customer-row header">
                    <span>Customer Name</span>
                    <span>Pending Balance</span>
                    <span>Last Transaction</span>
                    <span>Action</span>
                </div>

                {customers.length === 0 ? (
                    <div className="empty-khata">
                        <UserCheck size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                        <p>No credit transactions found. All accounts settled!</p>
                    </div>
                ) : (
                    customers.map((customer, index) => (
                        <div key={index} className="customer-row">
                            <div className="cust-name">
                                <div style={{
                                    width: 32, height: 32, borderRadius: 8,
                                    background: 'rgba(0,186,242,0.1)', color: 'var(--primary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {customer.customer_name[0].toUpperCase()}
                                </div>
                                {customer.customer_name}
                            </div>
                            <div className="cust-balance">₹{customer.balance.toLocaleString()}</div>
                            <div className="cust-date">
                                <Clock size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                                {customer.last_transaction}
                            </div>
                            <div>
                                <button
                                    className="settle-btn"
                                    onClick={() => handleSettle(customer.customer_name)}
                                    disabled={customer.balance <= 0}
                                >
                                    <IndianRupee size={14} /> Settle
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default KhataView;
