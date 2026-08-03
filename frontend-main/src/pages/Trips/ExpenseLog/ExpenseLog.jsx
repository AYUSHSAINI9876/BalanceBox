import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../../components/Sidebar/Sidebar';
import TripNavbar from '../../../components/Navbar/TripNavbar';
import fetchWithAuth, { API_BASE } from '../../../utils/fetchWihAuth';
import './ExpenseLog.css';


const ExpenseLog = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [deleteId, setDeleteId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function fetchExpenses() {
      setLoading(true);
      setError('');
      try {
        const res = await fetchWithAuth(`${API_BASE}/api/trips/${tripId}/expenses`);
        if (!res.ok) throw new Error('Could not fetch expenses');
        const data = await res.json();
        if (!cancelled) setExpenses(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchExpenses();
    return () => { cancelled = true; };
  }, [tripId]);

  // Let Escape dismiss the confirmation dialog.
  useEffect(() => {
    if (!showModal) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && !deleting) cancelDelete();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showModal, deleting]);

  function handleDeleteClick(expenseId) {
    setActionError('');
    setDeleteId(expenseId);
    setShowModal(true);
  }

  async function confirmDelete() {
    setDeleting(true);
    setActionError('');
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/trips/${tripId}/expenses/${deleteId}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Could not delete expense');
      }
      setExpenses(expenses => expenses.filter(e => e._id !== deleteId));
      setShowModal(false);
      setDeleteId(null);
    } catch (err) {
      setActionError(err.message);
    }
    setDeleting(false);
  }

  function cancelDelete() {
    setShowModal(false);
    setDeleteId(null);
    setActionError('');
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
            <select
              className="expense-log-filter"
              aria-label="Filter expenses by category"
              value={filter}
              onChange={e => setFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <button className="expense-log-add-btn" onClick={() => navigate(`/trips/${tripId}/addexpense`)}>
              <span className="expense-log-add-icon" aria-hidden="true">+</span> Add Expense
            </button>
          </div>
        </div>
        <div className="expense-log-list-scroll">
          <div className="expense-log-list">
            {loading ? <div className="expense-log-loading">Loading…</div> :
              error ? <div className="expense-log-error" role="alert">{error}</div> :
              filteredExpenses.length === 0 ? (
                <div className="expense-log-empty">
                  {expenses.length === 0 ? 'No expenses yet — add your first one.' : 'No expenses in this category.'}
                </div>
              ) :
              filteredExpenses.map(exp => (
                <div className="expense-log-card" key={exp._id}>
                  <div className="expense-log-main">
                    <div className="expense-log-desc">{exp.description}</div>
                    <div className="expense-log-amt">₹{Number(exp.amount).toLocaleString('en-IN')}</div>
                    <div className="expense-log-cat">{exp.category}</div>
                    <div className="expense-log-paidby">
                      Paid by: {exp.paidBy.map(p => p.user?.name || 'Unknown').join(', ')}
                    </div>
                    <div className="expense-log-split">
                      Split between: {exp.splitBetween.map(u => u?.name || 'Unknown').join(', ')}
                    </div>
                  </div>
                  <div className="expense-log-actions-row">
                    <button
                      className="expense-log-edit-btn"
                      title="Edit expense"
                      aria-label={`Edit expense: ${exp.description}`}
                      onClick={() => navigate(`/trips/${tripId}/${exp._id}/editexpense`)}
                    >
                      <span aria-hidden="true">✏️</span>
                    </button>
                    <button
                      className="expense-log-delete-btn"
                      title="Delete expense"
                      aria-label={`Delete expense: ${exp.description}`}
                      onClick={() => handleDeleteClick(exp._id)}
                    >
                      <span aria-hidden="true">🗑️</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
        {showModal && (
          <div
            className="expense-log-modal-overlay"
            onClick={() => { if (!deleting) cancelDelete(); }}
          >
            <div
              className="expense-log-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-expense-title"
              onClick={e => e.stopPropagation()}
            >
              <div className="expense-log-modal-title" id="delete-expense-title">Delete this expense?</div>
              {actionError && <div className="expense-log-error" role="alert">{actionError}</div>}
              <div className="expense-log-modal-actions">
                <button className="expense-log-modal-btn delete" onClick={confirmDelete} disabled={deleting} autoFocus>
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
                <button className="expense-log-modal-btn cancel" onClick={cancelDelete} disabled={deleting}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ExpenseLog;
