import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './AddExpenseForm.css';
import fetchWithAuth, { API_BASE } from '../../utils/fetchWihAuth';

const defaultCategories = ['food', 'travel', 'stay', 'shopping', 'custom'];

const AddExpenseForm = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [paidBy, setPaidBy] = useState([{ user: '', amount: '' }]);
  const [splitBetween, setSplitBetween] = useState([]); // [userId]
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await fetchWithAuth(`${API_BASE}/api/trips/${tripId}`);
        const data = await res.json();
        setMembers(data.members || []);
      } catch {
        setMembers([]);
      }
    }
    fetchMembers();
  }, [tripId]);

  function handlePaidByChange(idx, field, value) {
    setPaidBy(prev => {
      const updated = [...prev];
      updated[idx][field] = value;
      return updated;
    });
  }

  function addPaidByRow() {
    setPaidBy(prev => [...prev, { user: '', amount: '' }]);
  }

  function removePaidByRow(idx) {
    setPaidBy(prev => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev);
  }

  function handleSplitBetweenCheckbox(userId) {
    setSplitBetween(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  }

  function handleSplitAllCheckbox() {
    if (splitBetween.length === members.length) {
      setSplitBetween([]);
    } else {
      setSplitBetween(members.map(m => m._id));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const finalCategory = (category === 'custom' ? customCategory : category).trim();
    if (!description.trim() || !amount || !finalCategory || paidBy.length === 0 || splitBetween.length === 0) {
      setError('Please fill all fields and select at least one payer and one split member.');
      return;
    }
    if (!(Number(amount) > 0)) {
      setError('Amount must be greater than 0.');
      return;
    }
    setLoading(true);
    try {
      const paidByClean = paidBy.filter(p => p.user && Number(p.amount) > 0).map(p => ({ user: p.user, amount: Number(p.amount) }));
      if (paidByClean.length === 0) {
        setError('Add at least one payer with an amount greater than 0.');
        setLoading(false);
        return;
      }
      const totalPaid = paidByClean.reduce((sum, p) => sum + p.amount, 0);
      // Tolerance avoids false rejections from floating-point rounding.
      if (Math.abs(totalPaid - Number(amount)) > 0.01) {
        setError(`Total paid (₹${totalPaid}) must equal the expense amount (₹${Number(amount)}).`);
        setLoading(false);
        return;
      }
      const res = await fetchWithAuth(`${API_BASE}/api/trips/${tripId}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: description.trim(),
          amount: Number(amount),
          category: finalCategory,
          paidBy: paidByClean,
          splitBetween
        })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to add expense');
      }
      navigate(`/trips/${tripId}/expense-log`);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <form className="add-expense-form" onSubmit={handleSubmit}>
      <h2>Add Expense</h2>
      <label htmlFor="expense-description">Description</label>
      <input id="expense-description" name="description" type="text" value={description} onChange={e => setDescription(e.target.value)} required />
      <label htmlFor="expense-amount">Amount</label>
      <input id="expense-amount" name="amount" type="number" inputMode="decimal" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required min="0.01" />
      <label htmlFor="expense-category">Category</label>
      <select id="expense-category" name="category" value={category} onChange={e => setCategory(e.target.value)} required>
        <option value="">Select category</option>
        {defaultCategories.map(cat => <option key={cat} value={cat}>{cat === 'custom' ? 'Custom' : cat}</option>)}
      </select>
      {category === 'custom' && (
        <input
          type="text"
          className="add-expense-custom-category"
          placeholder="Enter custom category"
          value={customCategory}
          onChange={e => setCustomCategory(e.target.value)}
          required
        />
      )}
      <span className="add-expense-group-label" id="paidby-label">Paid By</span>
      {paidBy.map((row, idx) => (
        <div key={idx} className="add-expense-paidby-row">
          <select
            value={row.user}
            onChange={e => handlePaidByChange(idx, 'user', e.target.value)}
            required
            aria-label={`Payer ${idx + 1}`}
          >
            <option value="">Select member</option>
            {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
          </select>
          <input
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            placeholder="0"
            value={row.amount}
            onChange={e => handlePaidByChange(idx, 'amount', e.target.value)}
            required
            aria-label={`Amount paid by payer ${idx + 1}`}
          />
          {paidBy.length > 1 && <button type="button" className="remove-paidby-btn" onClick={() => removePaidByRow(idx)} title="Remove payer" aria-label={`Remove payer ${idx + 1}`}>×</button>}
        </div>
      ))}
      <button type="button" className="add-paidby-btn" onClick={addPaidByRow}>+ Add Payer</button>
      <span className="add-expense-group-label">Split Between</span>
      <div className="add-expense-split-checkboxes">
        <label>
          <input type="checkbox" checked={splitBetween.length === members.length && members.length > 0} onChange={handleSplitAllCheckbox} />
          All
        </label>
        {members.map(m => (
          <label key={m._id}>
            <input type="checkbox" checked={splitBetween.includes(m._id)} onChange={() => handleSplitBetweenCheckbox(m._id)} />
            {m.name}
          </label>
        ))}
      </div>
      {error && <div className="add-expense-error" role="alert">{error}</div>}
      <button className="add-expense-btn" type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Expense'}</button>
    </form>
  );
};

export default AddExpenseForm;
