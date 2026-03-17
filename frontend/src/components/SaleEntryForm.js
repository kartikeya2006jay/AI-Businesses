import React, { useState } from 'react';
import { addTransaction } from '../services/api';

const SaleEntryForm = ({ inventory, onSaleSuccess }) => {
    const [saleData, setSaleData] = useState({ product: '', quantity: 1, amount: 0 });
    const [loading, setLoading] = useState(false);

    const handleSaleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addTransaction(saleData);
            setSaleData({ product: '', quantity: 1, amount: 0 });
            onSaleSuccess();
            alert("Sale recorded successfully!");
        } catch (error) {
            alert("Error recording sale: " + (error.response?.data?.detail || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="sales-entry glass">
            <h3>Quick Sale Entry</h3>
            <form onSubmit={handleSaleSubmit}>
                <div className="form-group">
                    <label>Product</label>
                    <select
                        value={saleData.product}
                        onChange={(e) => {
                            const prod = inventory.find(i => i.product === e.target.value);
                            setSaleData({ ...saleData, product: e.target.value, amount: prod ? prod.price * saleData.quantity : 0 });
                        }}
                        required
                    >
                        <option value="">Select Product</option>
                        {inventory.map(item => (
                            <option key={item.product} value={item.product}>{item.product} (Stock: {item.quantity})</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Quantity</label>
                    <input
                        type="number"
                        value={saleData.quantity}
                        onChange={(e) => {
                            const qty = parseInt(e.target.value);
                            const prod = inventory.find(i => i.product === saleData.product);
                            setSaleData({ ...saleData, quantity: qty, amount: prod ? prod.price * qty : 0 });
                        }}
                        min="1"
                        required
                    />
                </div>

                <div className="sale-summary">
                    <div className="summary-row">
                        <span>Price per unit</span>
                        <span>₹{inventory.find(i => i.product === saleData.product)?.price || 0}</span>
                    </div>
                    <div className="summary-row total">
                        <span>Total Amount</span>
                        <span>₹{saleData.amount}</span>
                    </div>
                </div>

                <button type="submit" className="submit-btn" disabled={loading || !saleData.product}>
                    {loading ? 'Processing...' : 'Complete Sale'}
                </button>
            </form>

            <style jsx>{`
        .sales-entry { padding: 1.5rem; }
        .sales-entry h3 { margin-top: 0; margin-bottom: 1.5rem; font-size: 1.1rem; }
        form { display: flex; flex-direction: column; gap: 1.2rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group label { font-size: 0.8rem; font-weight: 600; color: #666; }
        select, input {
          background: rgba(255,255,255,0.5);
          border: 1px solid rgba(0,0,0,0.05);
          padding: 0.8rem;
          border-radius: 10px;
          outline: none;
          transition: border 0.2s;
        }
        select:focus, input:focus { border-color: var(--primary); }
        .sale-summary {
          background: rgba(0, 186, 242, 0.05);
          padding: 1rem;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .summary-row { display: flex; justify-content: space-between; font-size: 0.85rem; color: #666; }
        .summary-row.total { 
          margin-top: 5px;
          border-top: 1px solid rgba(0,0,0,0.05);
          padding-top: 5px;
          color: var(--secondary);
          font-weight: 700;
          font-size: 1rem;
        }
        .submit-btn {
          margin-top: 0.5rem;
          padding: 1rem;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .submit-btn:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.1); }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
        </section>
    );
};

export default SaleEntryForm;
