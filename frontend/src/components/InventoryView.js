import React, { useState } from 'react';
import { Package, Trash2, Edit3, Plus, X } from 'lucide-react';
import { updateInventory, deleteInventory } from '../services/api';
import '../styles/Inventory.css';

const InventoryView = ({ inventory, fetchData }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newProduct, setNewProduct] = useState({ product: '', price: '', quantity: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateInventory({
        product: newProduct.product,
        price: parseFloat(newProduct.price),
        quantity: parseInt(newProduct.quantity)
      });
      setNewProduct({ product: '', price: '', quantity: '' });
      setIsAdding(false);
      fetchData();
    } catch (error) {
      console.error("Error updating inventory:", error);
      alert("Failed to update inventory");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await deleteInventory(name);
      fetchData();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <div className="inventory-view">
      <div className="view-header">
        <h2>Inventory Management</h2>
        <button className="add-btn glass" onClick={() => setIsAdding(true)}>
          <Plus size={18} />
          <span>Add Product</span>
        </button>
      </div>

      {isAdding && (
        <div className="modal-overlay">
          <div className="modal glass">
            <div className="modal-header">
              <h3>Add New Product</h3>
              <button onClick={() => setIsAdding(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  required
                  value={newProduct.product}
                  onChange={e => setNewProduct({ ...newProduct, product: e.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newProduct.price}
                    onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Initial Stock</label>
                  <input
                    type="number"
                    required
                    value={newProduct.quantity}
                    onChange={e => setNewProduct({ ...newProduct, quantity: e.target.value })}
                  />
                </div>
              </div>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Adding...' : 'Save Product'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="inventory-grid">
        {inventory.map(item => {
          const isLow = item.quantity < 20;
          const isOut = item.quantity === 0;
          return (
            <div key={item.product} className={`inventory-card glass ${isOut ? 'out-of-stock' : ''}`}>
              <div className="card-top">
                <div className={`status-badge ${isOut ? 'out' : isLow ? 'low' : 'good'}`}>
                  {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                </div>
                <div className="card-actions">
                  <button className="action-btn" title="Edit Product" onClick={() => {
                    setNewProduct({ product: item.product, price: item.price, quantity: item.quantity });
                    setIsAdding(true);
                  }}><Edit3 size={16} /></button>
                  <button className="action-btn delete" title="Delete Product" onClick={() => handleDelete(item.product)}><Trash2 size={16} /></button>
                </div>
              </div>

              <div className="card-body">
                <div className="product-icon">
                  <Package size={28} />
                </div>
                <h3 className="product-name">{item.product}</h3>
                <div className="product-price">₹{item.price} <span className="un">/ unit</span></div>
              </div>

              <div className="card-footer-stats">
                <div className="stat-pill">
                  <span className="label">Available Stock</span>
                  <span className={`value ${isLow ? 'warning' : ''}`}>{item.quantity}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default InventoryView;
