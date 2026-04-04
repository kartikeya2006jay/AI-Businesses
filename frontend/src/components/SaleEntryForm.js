import React, { useState } from 'react';
import { ShoppingCart, Plus, Trash2, Printer, CheckCircle, FileText, Camera, X, Receipt } from 'lucide-react';
import { addTransaction, addBulkTransaction } from '../services/api';
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
    const [staticInvNo] = useState(`INV-${Math.floor(10000 + Math.random() * 90000)}`);

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
                quantity,
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

    const subtotal = cart.reduce((sum, item) => sum + item.amount, 0);
    const cgst = Math.round(subtotal * 0.09);
    const sgst = Math.round(subtotal * 0.09);
    const totalWithGst = subtotal + cgst + sgst;

    const handleFinalizeSale = async () => {
        if (cart.length === 0) return;
        setLoading(true);
        const billTime = new Date().toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            dateStyle: 'long',
            timeStyle: 'short'
        });
        try {
            await addBulkTransaction({
                items: cart,
                customer_name: customerName || 'Anonymous',
                is_credit: isCredit
            });
            setLastBillTime(billTime);
            setLastBillData({
                customer: customerName || 'Anonymous',
                items: [...cart],
                subtotal,
                cgst,
                sgst,
                total: totalWithGst,
                time: billTime,
                isCredit,
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

    const handleCloseReceipt = () => {
        setShowReceipt(false);
        setSuccess(false);
        setCart([]);
        setCustomerName('');
        setIsCredit(false);
        onSaleSuccess();
    };

    return (
        <section className={`sales-entry billing-form ${success ? 'sale-success' : ''}`}>

            {/* ── PAID Stamp Overlay ── */}
            {success && (
                <div className="paid-stamp-container">
                    <div className="paid-stamp" style={{
                        borderColor: isCredit ? '#f59e0b' : '#16a34a',
                        color: isCredit ? '#f59e0b' : '#16a34a'
                    }}>
                        <CheckCircle size={48} />
                        <span>{isCredit ? 'UDHAAR' : 'PAID'}</span>
                    </div>
                    <p className="bill-time">🕐 {lastBillTime}</p>
                </div>
            )}

            {/* ════════════════════════════════
                HEADER BAND
            ════════════════════════════════ */}
            <div className="receipt-header">
                <div className="receipt-title">
                    <div className="invoice-icon-wrap">
                        <FileText size={20} />
                    </div>
                    <div className="invoice-title-text">
                        <h3>Official Tax Invoice</h3>
                        <span>GST Compliant Billing</span>
                    </div>
                </div>
                <div className="invoice-meta">
                    <span className="invoice-no">{staticInvNo}</span>
                    <span className="gstin">GSTIN: 07PYTM1234ZC</span>
                </div>
            </div>

            {/* ════════════════════════════════
                SECTION 1 — BILL TO
            ════════════════════════════════ */}
            <div className="invoice-section">
                <p className="invoice-section-label">
                    <ShoppingCart size={11} />
                    Bill To
                </p>

                <div className="billing-details">
                    <div className="form-group ink-border">
                        <label>Customer Name</label>
                        <input
                            type="text"
                            placeholder="Enter customer name for Khata / Bill…"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            disabled={loading || success}
                        />
                    </div>

                    <div
                        className={`udhaar-premium-toggle ${isCredit ? 'active' : ''}`}
                        onClick={() => !loading && !success && setIsCredit(!isCredit)}
                    >
                        <div className={`custom-checkbox ${isCredit ? 'active' : ''}`}>
                            {isCredit && <CheckCircle size={14} strokeWidth={3} />}
                        </div>
                        <div style={{ flex: 1 }}>
                            <span className={`udhaar-label-main ${isCredit ? 'credit-active' : ''}`}>
                                Mark as Udhaar (Credit Sale)
                            </span>
                            <p className="udhaar-label-sub">
                                Adds to&nbsp;<strong>{customerName || 'Customer'}'s</strong>&nbsp;Khata Book automatically
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ════════════════════════════════
                SECTION 2 — ADD ITEMS
            ════════════════════════════════ */}
            <div className="invoice-section">
                <p className="invoice-section-label">
                    <Plus size={11} />
                    Add Items
                </p>
                <form onSubmit={handleAddToCart} className="add-item-row">
                    <div className="form-group ink-border flex-2">
                        <label>Product</label>
                        <select
                            value={selectedProduct}
                            onChange={(e) => setSelectedProduct(e.target.value)}
                            disabled={loading || success}
                        >
                            <option value="">Search Products…</option>
                            {inventory.map(item => (
                                <option key={item.product} value={item.product} disabled={item.quantity === 0}>
                                    {item.product} — ₹{item.price}
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            className="inline-scan-btn"
                            onClick={() => setShowScanner(true)}
                            disabled={loading || success}
                            title="Scan Barcode"
                        >
                            <Camera size={16} />
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
                    <button
                        type="submit"
                        className="add-to-bill-btn"
                        disabled={!selectedProduct || loading || success}
                        title="Add to Bill"
                    >
                        <Plus size={20} />
                    </button>
                </form>
            </div>

            <div className="bill-separator" />

            {/* ════════════════════════════════
                SECTION 3 — ITEMIZED LIST
            ════════════════════════════════ */}
            <div className="invoice-section">
                <div className="itemized-list">
                    <div className="list-header-row">
                        <span className="col-desc">Item Details</span>
                        <span className="col-qty" style={{ textAlign: 'center' }}>Qty</span>
                        <span className="col-amt">Amount</span>
                        <span></span>
                    </div>
                    <div className="list-body">
                        {cart.length === 0 ? (
                            <div className="empty-cart-msg">
                                <Receipt size={26} style={{ opacity: 0.25 }} />
                                Add items to generate invoice
                            </div>
                        ) : (
                            cart.map((item, index) => (
                                <div key={index} className="item-row">
                                    <div className="col-desc">
                                        <span className="p-name">{item.product}</span>
                                        <span className="p-price">@ ₹{item.price} per unit</span>
                                    </div>
                                    <div className="col-qty">
                                        <span className="qty-badge">{item.quantity}</span>
                                    </div>
                                    <span className="col-amt">₹{item.amount.toLocaleString()}</span>
                                    <button
                                        className="remove-item-btn"
                                        onClick={() => handleRemoveFromCart(index)}
                                        disabled={loading || success}
                                        title="Remove item"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="bill-separator" />

            {/* ════════════════════════════════
                SECTION 4 — TAX SUMMARY
            ════════════════════════════════ */}
            <div className="invoice-section">
                <div className="billing-summary">
                    <div className="summary-row ink">
                        <span className="label">Subtotal</span>
                        <span className="val">₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="summary-row gst-row">
                        <span className="label">CGST @ 9%</span>
                        <span className="val">₹{cgst.toLocaleString()}</span>
                    </div>
                    <div className="summary-row gst-row">
                        <span className="label">SGST @ 9%</span>
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
                    {loading ? 'Recording Sale…' : (
                        <>
                            <Printer size={17} />
                            Finalize GST Bill
                        </>
                    )}
                </button>
            </div>

            <p className="billing-footer">
                Invoice date: {new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}
            </p>

            {/* ════════════════════════════════
                RECEIPT MODAL
            ════════════════════════════════ */}
            {showReceipt && lastBillData && (
                <div className="receipt-modal-overlay">
                    <div className="receipt-modal glass">

                        <div className="receipt-modal-header">
                            <div
                                className="receipt-success-icon"
                                style={{
                                    background: lastBillData.isCredit
                                        ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                                        : 'linear-gradient(135deg, #10b981, #059669)',
                                    boxShadow: lastBillData.isCredit
                                        ? '0 8px 28px rgba(245,158,11,0.4)'
                                        : '0 8px 28px rgba(16,185,129,0.4)'
                                }}
                            >
                                <CheckCircle size={28} />
                            </div>
                            <h2>{lastBillData.isCredit ? 'UDHAAR RECORDED' : 'PAYMENT SUCCESS'}</h2>
                            <p>{lastBillData.invoiceNo} · {lastBillData.time}</p>

                            <button className="close-receipt" onClick={handleCloseReceipt}>
                                <X size={16} />
                            </button>
                        </div>

                        <div id="printable-receipt" className="receipt-content">
                            <div className="receipt-biz-header">
                                <h2>PAYTM MERCHANT</h2>
                                <p>Digital Retail Solutions</p>
                                <p>GSTIN: 07PYTM1234ZC</p>
                            </div>

                            <div className="receipt-info">
                                <p><strong>Invoice No.</strong>{lastBillData.invoiceNo}</p>
                                <p><strong>Date & Time</strong>{lastBillData.time}</p>
                                <p><strong>Customer</strong>{lastBillData.customer}</p>
                                <p><strong>Type</strong>{lastBillData.isCredit ? 'Credit / Udhaar' : 'Cash / Paid'}</p>
                            </div>

                            <table className="receipt-table">
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th>Qty</th>
                                        <th>Rate</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lastBillData.items.map((item, i) => (
                                        <tr key={i}>
                                            <td>{item.product}</td>
                                            <td>{item.quantity}</td>
                                            <td>₹{item.price}</td>
                                            <td>₹{item.amount.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="receipt-totals">
                                <div className="total-row"><span>Subtotal</span><span>₹{lastBillData.subtotal.toLocaleString()}</span></div>
                                <div className="total-row"><span>CGST (9%)</span><span>₹{lastBillData.cgst.toLocaleString()}</span></div>
                                <div className="total-row"><span>SGST (9%)</span><span>₹{lastBillData.sgst.toLocaleString()}</span></div>
                                <div className="total-row grand-total">
                                    <span>Total Amount</span>
                                    <span>₹{lastBillData.total.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="receipt-footer">
                                <p>Thank you for your business! 🙏</p>
                                <p>Computer generated invoice — no signature required.</p>
                            </div>
                        </div>

                        <button className="print-btn main-submit" onClick={() => window.print()}>
                            <Printer size={17} /> Print / Download Invoice
                        </button>

                    </div>
                </div>
            )}

            {/* Product Scanner Modal */}
            {showScanner && (
                <ProductScanner
                    inventory={inventory}
                    onScanSuccess={(productName) => {
                        setSelectedProduct(productName);
                        setShowScanner(false);
                    }}
                    onClose={() => setShowScanner(false)}
                />
            )}

        </section>
    );
};

export default SaleEntryForm;
