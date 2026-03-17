import React, { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { addTransaction } from '../services/api';
import '../styles/SaleEntryForm.css';

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
            <h3><ShoppingCart size={18} style={{ marginRight: '8px' }} /> Record New Sale</h3>
            <form onSubmit={handleSaleSubmit}>
                <div className="form-group">
                    <label>What are you selling?</label>
                    <select
                        value={saleData.product}
                        onChange={(e) => {
                            const prod = inventory.find(i => i.product === e.target.value);
                            setSaleData({ ...saleData, product: e.target.value, amount: prod ? prod.price * saleData.quantity : 0 });
                        }}
                        required
                    >
                        <option value="">Select a product...</option>
                        {inventory.map(item => (
                            <option key={item.product} value={item.product}>
                                {item.product} (Stock: {item.quantity})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>How many?</label>
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
                </div>

                <div className="sale-summary-card">
                    <div className="summary-row">
                        <span className="label">Unit Price</span>
                        <span className="val">₹{inventory.find(i => i.product === saleData.product)?.price || 0}</span>
                    </div>
                    <div className="summary-row total">
                        <span className="label">Total to collect</span>
                        <span className="val highlight">₹{saleData.amount}</span>
                    </div>
                </div>

                <button type="submit" className="submit-btn main-action" disabled={loading || !saleData.product}>
                    {loading ? 'Processing...' : 'Record Sale & Update Stock'}
                </button>
            </form>

        </section>
    );
};

export default SaleEntryForm;
