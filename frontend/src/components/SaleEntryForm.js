import React, { useState } from 'react';
import { ShoppingCart, Plus, Trash2, Printer, CheckCircle, FileText, Camera, X } from 'lucide-react';
import { addTransaction } from '../services/api';
import ProductScanner from './ProductScanner';
import '../styles/SaleEntryForm.css';

const SaleEntryForm = ({ inventory, onSaleSuccess }) => {
    const [customerName, setCustomerName] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [lastBillTime, setLastBillTime] = useState(null);
    const [showScanner, setShowScanner] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);
    const [lastBillData, setLastBillData] = useState(null);
    const [isCredit, setIsCredit] = useState(false);

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
        const billTime = new Date().toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            dateStyle: 'medium',
            timeStyle: 'short'
        });

        try {
            // Process each item in the cart
            for (const item of cart) {
                await addTransaction({
                    product: item.product,
                    quantity: item.quantity,
                    amount: item.amount,
                    customer_name: customerName || 'Anonymous',
                    is_credit: isCredit
                });
            }

            setLastBillTime(billTime);
            setLastBillData({
                customer: customerName || 'Anonymous',
                items: [...cart],
                subtotal,
                cgst,
                sgst,
                total: totalWithGst,
                time: billTime,
                isCredit: isCredit,
                invoiceNo: `INV-${Math.floor(1000 + Math.random() * 9000)}`
            });
            setSuccess(true);
            setShowReceipt(true);
        } catch (error) {
            alert("Error recording sale: " + (error.response?.data?.detail || error.message));
        } finally {
            setLoading(false);
        }
    };

    const subtotal = cart.reduce((sum, item) => sum + item.amount, 0);
    const cgst = Math.round(subtotal * 0.09);
    const sgst = Math.round(subtotal * 0.09);
    const totalWithGst = subtotal + cgst + sgst;

    return (
        <section className={`sales-entry billing-form ${success ? 'sale-success' : ''}`}>
            {success && (
                <div className="paid-stamp-container">
                    <div className="paid-stamp" style={{ borderColor: isCredit ? '#f59e0b' : '#48bb78', color: isCredit ? '#f59e0b' : '#48bb78' }}>
                        <CheckCircle size={60} />
                        <span>{isCredit ? 'UDHAAR' : 'PAID'}</span>
                    </div>
                    <div className="success-receipt-info">
                        <p className="bill-time">Indian Live GST Time: {lastBillTime}</p>
                    </div>
                </div>
            )}

            <div className="receipt-header" style={{ borderBottom: '3px solid var(--secondary)', marginBottom: '1.5rem' }}>
                <div className="receipt-title">
                    <FileText size={24} className="icon-blue" style={{ color: 'var(--primary)' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ fontSize: '1.4rem', color: 'var(--text-main)', letterSpacing: '1px' }}>OFFICIAL TAX INVOICE</h3>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>GST COMPLIANT BILLING</span>
                    </div>
                </div>
                <div className="invoice-meta">
                    <span className="invoice-no" style={{ fontSize: '1rem', color: 'var(--secondary)' }}>#INV-{Math.floor(10000 + Math.random() * 90000)}</span>
                    <span className="gstin">GSTIN: 07PYTM1234ZC</span>
                </div>
            </div>

            <div className="billing-details">
                <div className="form-group ink-border">
                    <label style={{ color: 'var(--primary)', fontWeight: 700 }}>BILL TO (CUSTOMER NAME)</label>
                    <input
                        type="text"
                        placeholder="Enter customer name for Khata/Bill..."
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        disabled={loading || success}
                        style={{ border: '2px solid var(--glass-border)', fontSize: '1rem' }}
                    />
                </div>

                <div className="udhaar-premium-toggle" style={{
                    marginTop: '1.5rem',
                    marginBottom: '1.5rem',
                    padding: '16px',
                    background: isCredit ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.05) 100%)' : 'rgba(255,255,255,0.03)',
                    borderRadius: '16px',
                    border: isCredit ? '2px solid #f59e0b' : '2px dashed var(--glass-border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: isCredit ? '0 10px 20px rgba(245, 158, 11, 0.15)' : 'none'
                }} onClick={() => !loading && !success && setIsCredit(!isCredit)}>
                    <div className={`custom-checkbox ${isCredit ? 'active' : ''}`} style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        border: '2px solid ' + (isCredit ? '#f59e0b' : 'var(--text-muted)'),
                        background: isCredit ? '#f59e0b' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        flexShrink: 0
                    }}>
                        {isCredit && <CheckCircle size={18} strokeWidth={3} />}
                    </div>
                    <div style={{ flex: 1 }}>
                        <span style={{
                            display: 'block',
                            fontWeight: 800,
                            fontSize: '1.05rem',
                            color: isCredit ? '#f59e0b' : 'var(--text-main)'
                        }}>
                            Mark as Udhaar (Credit Sale)
                        </span>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            This will automatically add the amount to <strong>{customerName || 'Customer'}'s Khata Book</strong>
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleAddToCart} className="add-item-row">
                <div className="form-group ink-border flex-2">
                    <label>Item Selection</label>
                    <select
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        disabled={loading || success}
                    >
                        <option value="">Search Products...</option>
                        {inventory.map(item => (
                            <option key={item.product} value={item.product} disabled={item.quantity === 0}>
                                {item.product} (₹{item.price})
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        className="inline-scan-btn"
                        onClick={() => setShowScanner(true)}
                        disabled={loading || success}
                        title="Scan Product"
                        style={{ right: '10px' }}
                    >
                        <Camera size={18} />
                    </button>
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
                    <span className="col-desc">Details</span>
                    <span className="col-qty">#</span>
                    <span className="col-amt">Amt</span>
                    <span className="col-action"></span>
                </div>
                <div className="list-body">
                    {cart.map((item, index) => (
                        <div key={index} className="item-row">
                            <div className="col-desc">
                                <span className="p-name">{item.product}</span>
                                <span className="p-price">@ ₹{item.price}</span>
                            </div>
                            <span className="col-qty">{item.quantity}</span>
                            <span className="col-amt">₹{item.amount}</span>
                            <button className="remove-item-btn" onClick={() => handleRemoveFromCart(index)} disabled={loading || success}>
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                    {cart.length === 0 && (
                        <div className="empty-cart-msg">Add items to generate invoice.</div>
                    )}
                </div>
            </div>

            <div className="bill-separator"></div>

            <div className="billing-summary">
                <div className="summary-row ink">
                    <span className="label">Subtotal</span>
                    <span className="val">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="summary-row gst-row">
                    <span className="label">CGST (9%)</span>
                    <span className="val">₹{cgst.toLocaleString()}</span>
                </div>
                <div className="summary-row gst-row">
                    <span className="label">SGST (9%)</span>
                    <span className="val">₹{sgst.toLocaleString()}</span>
                </div>
                <div className="summary-row total ink-total">
                    <span className="label">Grand Total</span>
                    <span className="val highlight">₹{totalWithGst.toLocaleString()}</span>
                </div>
            </div>

            <button
                type="button"
                className="submit-btn billing-btn main-submit"
                onClick={handleFinalizeSale}
                disabled={loading || success || cart.length === 0}
            >
                {loading ? (
                    'Recording...'
                ) : (
                    <>
                        <Printer size={18} />
                        Finalize GST Bill
                    </>
                )}
            </button>

            <p className="billing-footer">Invoice generated at: {new Date().toLocaleDateString('en-IN')}</p>

            {
                showReceipt && lastBillData && (
                    <div className="receipt-modal-overlay">
                        <div className="receipt-modal glass">
                            <div className="receipt-modal-header" style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                                <div className="success-icon" style={{
                                    background: lastBillData.isCredit ? '#f59e0b' : '#10b981',
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1rem',
                                    color: 'white',
                                    boxShadow: '0 0 20px rgba(0,0,0,0.2)'
                                }}>
                                    <CheckCircle size={32} />
                                </div>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
                                    {lastBillData.isCredit ? 'UDHAAR RECORDED' : 'PAYMENT SUCCESS'}
                                </h2>
                                <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0' }}>Official Tax Invoice # {lastBillData.invoiceNo}</p>

                                <button className="close-receipt" style={{ position: 'absolute', right: '20px', top: '20px' }} onClick={() => {
                                    setShowReceipt(false);
                                    setSuccess(false);
                                    setCart([]);
                                    setCustomerName('');
                                    onSaleSuccess();
                                }}><X size={24} /></button>
                            </div>

                            <div id="printable-receipt" className="receipt-content">
                                <div className="receipt-biz-header">
                                    <h2>PAYTM MERCHANT</h2>
                                    <p>Digital Retail Solutions</p>
                                    <p>GSTIN: 07PYTM1234ZC</p>
                                </div>

                                <hr />

                                <div className="receipt-info">
                                    <p><strong>Invoice:</strong> {lastBillData.invoiceNo}</p>
                                    <p><strong>Date:</strong> {lastBillData.time}</p>
                                    <p><strong>Customer:</strong> {lastBillData.customer}</p>
                                </div>

                                <table className="receipt-table">
                                    <thead>
                                        <tr>
                                            <th>Item</th>
                                            <th>Qty</th>
                                            <th>Price</th>
                                            <th>Amt</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lastBillData.items.map((item, i) => (
                                            <tr key={i}>
                                                <td>{item.product}</td>
                                                <td>{item.quantity}</td>
                                                <td>₹{item.price}</td>
                                                <td>₹{item.amount}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <hr />

                                <div className="receipt-totals">
                                    <div className="total-row"><span>Subtotal</span><span>₹{lastBillData.subtotal}</span></div>
                                    <div className="total-row"><span>CGST (9%)</span><span>₹{lastBillData.cgst}</span></div>
                                    <div className="total-row"><span>SGST (9%)</span><span>₹{lastBillData.sgst}</span></div>
                                    <div className="total-row grand-total"><span>Total</span><span>₹{lastBillData.total}</span></div>
                                </div>

                                <div className="receipt-footer">
                                    <p>Thank you for shopping with us!</p>
                                    <p>This is a computer generated invoice.</p>
                                </div>
                            </div>

                            <button className="print-btn main-submit" onClick={() => window.print()}>
                                <Printer size={18} /> Print Invoice
                            </button>
                        </div>
                    </div>
                )
            }
        </section >
    );
};

export default SaleEntryForm;
