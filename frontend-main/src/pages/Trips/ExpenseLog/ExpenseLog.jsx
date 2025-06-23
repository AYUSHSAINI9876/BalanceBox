import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../../components/Sidebar/Sidebar';
import TripNavbar from '../../../components/Navbar/TripNavbar';
import fetchWithAuth from '../../../utils/fetchWihAuth';
import './ExpenseLog.css';

const API_BASE = 'https://splitmate-zqda.onrender.com';

const ExpenseLog = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [deleteId, setDeleteId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchExpenses();
    // eslint-disable-next-line
  }, [tripId]);

  async function fetchExpenses() {
    setLoading(true);
    setError('');
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/trips/${tripId}/expenses`);
      if (!res.ok) throw new Error('Could not fetch expenses');
      const data = await res.json();
      setExpenses(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  function handleDeleteClick(expenseId) {
    setDeleteId(expenseId);
    setShowModal(true);
  }

  async function confirmDelete() {
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/trips/${tripId}/expenses/${deleteId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Could not delete expense');
      setExpenses(expenses => expenses.filter(e => e._id !== deleteId));
    } catch (err) {
      alert(err.message);
    }
    setShowModal(false);
    setDeleteId(null);
  }

  function cancelDelete() {
    setShowModal(false);
    setDeleteId(null);
  }

  const filteredExpenses = filter === 'all' ? expenses : expenses.filter(e => e.category === filter);
  const categories = Array.from(new Set(expenses.map(e => e.category)));

  return (
    <div className="trips-layout">
      <Sidebar />
      <main className="trips-main-content">
        <TripNavbar />
        <div className="expense-log-header-row">
          <h2 className="expense-log-title">Expense Log</h2>
          <div className="expense-log-actions">
            <select className="expense-log-filter" value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="all">All Categories</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <button className="expense-log-add-btn" onClick={() => navigate(`/trips/${tripId}/addexpense`)}>
              <span className="expense-log-add-icon">+</span> Add Expense
            </button>
          </div>
        </div>
        <div className="expense-log-list-scroll">
          <div className="expense-log-list">
            {loading ? <div className="expense-log-loading">Loading...</div> :
              error ? <div className="expense-log-error">{error}</div> :
              filteredExpenses.length === 0 ? <div className="expense-log-empty">No expenses</div> :
              filteredExpenses.map(exp => (
                <div className="expense-log-card" key={exp._id}>
                  <div className="expense-log-main">
                    <div className="expense-log-desc">{exp.description}</div>
                    <div className="expense-log-amt">₹{exp.amount}</div>
                    <div className="expense-log-cat">{exp.category}</div>
                    <div className="expense-log-paidby">
                      Paid by: {exp.paidBy.map(p => p.user.name).join(', ')}
                    </div>
                    <div className="expense-log-split">
                      Split between: {exp.splitBetween.map(u => u.name).join(', ')}
                    </div>
                  </div>
                  <div className="expense-log-actions-row">
                    <button className="expense-log-edit-btn" title="Edit" onClick={() => navigate(`/trips/${tripId}/${exp._id}/editexpense`)}>
                      ✏️
                    </button>
                    <button className="expense-log-delete-btn" title="Delete" onClick={() => handleDeleteClick(exp._id)}>
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
        {showModal && (
          <div className="expense-log-modal-overlay">
            <div className="expense-log-modal">
              <div className="expense-log-modal-title">Delete this expense?</div>
              <div className="expense-log-modal-actions">
                <button className="expense-log-modal-btn delete" onClick={confirmDelete}>Delete</button>
                <button className="expense-log-modal-btn cancel" onClick={cancelDelete}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ExpenseLog;
