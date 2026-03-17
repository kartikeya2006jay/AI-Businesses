import React, { useState } from 'react';
import { Package, Trash2, Edit3, Plus, X } from 'lucide-react';
import { updateInventory, deleteInventory } from '../services/api';

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
        {inventory.map(item => (
          <div key={item.product} className="inventory-card glass">
            <div className="card-icon">
              <Package size={24} />
            </div>
            <div className="card-info">
              <h3>{item.product}</h3>
              <div className="stock-badge" data-low={item.quantity < 20}>
                {item.quantity} in stock
              </div>
              <div className="price-tag">₹{item.price} per unit</div>
            </div>
            <div className="card-actions">
              <button className="action-btn" onClick={() => {
                setNewProduct({ product: item.product, price: item.price, quantity: item.quantity });
                setIsAdding(true);
              }}><Edit3 size={16} /></button>
              <button className="action-btn delete" onClick={() => handleDelete(item.product)}><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .inventory-view { padding: 1rem; }
        .view-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        .add-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.2rem;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 12px;
          cursor: pointer;
        }
        .inventory-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }
        .inventory-card {
          padding: 1.5rem;
          display: flex;
          align-items: flex-start;
          gap: 1.2rem;
          transition: transform 0.2s;
        }
        .inventory-card:hover { transform: translateY(-5px); }
        .card-icon {
          width: 48px;
          height: 48px;
          background: rgba(0, 186, 242, 0.1);
          color: var(--primary);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .card-info { flex: 1; }
        .card-info h3 { margin: 0 0 0.5rem; font-size: 1.1rem; }
        .stock-badge {
          display: inline-block;
          padding: 0.2rem 0.6rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
          margin-bottom: 0.5rem;
        }
        .stock-badge[data-low="true"] {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }
        .price-tag { font-size: 0.9rem; color: #666; font-weight: 500; }
        .card-actions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .action-btn {
          padding: 0.4rem;
          border: none;
          background: transparent;
          color: #999;
          cursor: pointer;
          border-radius: 6px;
        }
        .action-btn:hover { background: #f5f5f5; color: var(--primary); }
        .action-btn.delete:hover { color: var(--error); }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          backdrop-filter: blur(4px);
        }
        .modal {
          width: 400px;
          padding: 2rem;
          background: white;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .modal-header h3 { margin: 0; color: var(--secondary); }
        .modal-header button { background: transparent; border: none; color: #888; cursor: pointer; }
        .form-group { margin-bottom: 1.2rem; }
        .form-group label { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.4rem; color: #666; }
        .form-group input {
          width: 100%;
          padding: 0.8rem;
          border: 1px solid #eee;
          border-radius: 10px;
          background: #f8fafc;
        }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .submit-btn {
          width: 100%;
          padding: 1rem;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          margin-top: 1rem;
        }
      `}</style>
    </div>
  );
};

export default InventoryView;
