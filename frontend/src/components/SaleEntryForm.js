import React, { useState } from 'react';
import { ShoppingCart, Plus, Trash2, Printer, CheckCircle } from 'lucide-react';
import { addTransaction } from '../services/api';
import '../styles/SaleEntryForm.css';

const SaleEntryForm = ({ inventory, onSaleSuccess }) => {
    const [customerName, setCustomerName] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleAddToCart = (e) => {
        e.preventDefault();
        if (!selectedProduct) return;

        const product = inventory.find(i => i.product === selectedProduct);
        if (!product) return;

        if (product.quantity < quantity) {
            alert(`Only ${product.quantity} units of ${product.product} available.`);
            return;
        }

        const existingItemIndex = cart.findIndex(item => item.product === selectedProduct);
        if (existingItemIndex > -1) {
            const newCart = [...cart];
            newCart[existingItemIndex].quantity += quantity;
            newCart[existingItemIndex].amount += product.price * quantity;
            setCart(newCart);
        } else {
            setCart([...cart, {
                product: selectedProduct,
                quantity: quantity,
                price: product.price,
                amount: product.price * quantity
            }]);
        }

        setSelectedProduct('');
        setQuantity(1);
    };

    const handleRemoveFromCart = (index) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
    };

    const handleFinalizeSale = async () => {
        if (cart.length === 0) return;
        setLoading(true);
        try {
            // Process each item in the cart
            // Since the current API only supports single transaction per call, we loop.
            // In a real scenario, a batch endpoint would be better.
            for (const item of cart) {
                await addTransaction({
                    product: item.product,
                    quantity: item.quantity,
                    amount: item.amount,
                    customerName: customerName || 'Anonymous'
                });
            }

            setSuccess(true);
            setTimeout(() => {
                setCart([]);
                setCustomerName('');
                setSuccess(false);
                onSaleSuccess();
            }, 3000);

        } catch (error) {
            alert("Error recording sale: " + (error.response?.data?.detail || error.message));
        } finally {
            setLoading(false);
        }
    };

    const totalAmount = cart.reduce((sum, item) => sum + item.amount, 0);

    return (
        <section className={`sales-entry billing-form ${success ? 'sale-success' : ''}`}>
            {success && (
                <div className="paid-stamp">
                    <CheckCircle size={80} />
                    <span>PAID</span>
                </div>
            )}

            <div className="receipt-header">
                <div className="receipt-title">
                    <ShoppingCart size={20} />
                    <h3>Billing Invoice</h3>
                </div>
                <span className="invoice-no">INV-{Math.floor(1000 + Math.random() * 9000)}</span>
            </div>

            <div className="billing-details">
                <div className="form-group ink-border">
                    <label>Bill To</label>
                    <input
                        type="text"
                        placeholder="Customer Name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        disabled={loading || success}
                    />
                </div>
            </div>

            <form onSubmit={handleAddToCart} className="add-item-row">
                <div className="form-group ink-border flex-2">
                    <label>Select Item</label>
                    <select
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        disabled={loading || success}
                    >
                        <option value="">Choose a product...</option>
                        {inventory.map(item => (
                            <option key={item.product} value={item.product} disabled={item.quantity === 0}>
                                {item.product} (₹{item.price})
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group ink-border flex-1">
                    <label>Qty</label>
                    <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        disabled={loading || success}
                    />
                </div>
                <button type="submit" className="add-to-bill-btn" disabled={!selectedProduct || loading || success}>
                    <Plus size={20} />
                </button>
            </form>

            <div className="bill-separator"></div>

            <div className="itemized-list">
                <div className="list-header-row">
                    <span className="col-desc">Description</span>
                    <span className="col-qty">Qty</span>
                    <span className="col-amt">Amount</span>
                    <span className="col-action"></span>
                </div>
                <div className="list-body">
                    {cart.map((item, index) => (
                        <div key={index} className="item-row">
                            <div className="col-desc">
                                <span className="p-name">{item.product}</span>
                                <span className="p-price">₹{item.price} per unit</span>
                            </div>
                            <span className="col-qty">{item.quantity}</span>
                            <span className="col-amt">₹{item.amount.toLocaleString()}</span>
                            <button className="remove-item-btn" onClick={() => handleRemoveFromCart(index)} disabled={loading || success}>
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                    {cart.length === 0 && (
                        <div className="empty-cart-msg">No items added to bill yet.</div>
                    )}
                </div>
            </div>

            <div className="bill-separator"></div>

            <div className="billing-summary">
                <div className="summary-row ink">
                    <span className="label">Subtotal</span>
                    <span className="val">₹{totalAmount.toLocaleString()}</span>
                </div>
                <div className="summary-row ink">
                    <span className="label">Tax (0%)</span>
                    <span className="val">₹0</span>
                </div>
                <div className="summary-row total ink-total">
                    <span className="label">Total Amount</span>
                    <span className="val highlight">₹{totalAmount.toLocaleString()}</span>
                </div>
            </div>

            <button
                type="button"
                className="submit-btn billing-btn main-submit"
                onClick={handleFinalizeSale}
                disabled={loading || success || cart.length === 0}
            >
                {loading ? (
                    'Processing...'
                ) : (
                    <>
                        <Printer size={18} />
                        Finalize & Generate Receipt
                    </>
                )}
            </button>

            <p className="billing-footer">Thank you for your business!</p>
        </section>
    );
};

export default SaleEntryForm;
