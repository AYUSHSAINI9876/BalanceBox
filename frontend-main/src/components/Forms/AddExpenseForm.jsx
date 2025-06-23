import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './AddExpenseForm.css';
import fetchWithAuth from '../../utils/fetchWihAuth';

const API_BASE = 'https://splitmate-zqda.onrender.com';
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
    const finalCategory = category === 'custom' ? customCategory : category;
    if (!description || !amount || !finalCategory || paidBy.length === 0 || splitBetween.length === 0) {
      setError('Please fill all fields and select at least one payer and one split member.');
      return;
    }
    setLoading(true);
    try {
      const paidByClean = paidBy.filter(p => p.user && Number(p.amount) > 0).map(p => ({ user: p.user, amount: Number(p.amount) }));
      const totalPaid = paidByClean.reduce((sum, p) => sum + p.amount, 0);
      if (totalPaid !== Number(amount)) {
        setError('Total paid must equal the expense amount.');
        setLoading(false);
        return;
      }
      const res = await fetchWithAuth(`${API_BASE}/api/trips/${tripId}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          amount: Number(amount),
          category: finalCategory,
          paidBy: paidByClean,
          splitBetween
        })
      });
      if (!res.ok) throw new Error('Failed to add expense');
      navigate(`/trips/${tripId}/expense-log`);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <form className="add-expense-form" onSubmit={handleSubmit}>
      <h2>Add Expense</h2>
      <label>Description</label>
      <input type="text" value={description} onChange={e => setDescription(e.target.value)} required />
      <label>Amount</label>
      <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required min="1" />
      <label>Category</label>
      <select value={category} onChange={e => setCategory(e.target.value)} required>
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
      <label>Paid By</label>
      {paidBy.map((row, idx) => (
        <div key={idx} className="add-expense-paidby-row">
          <select value={row.user} onChange={e => handlePaidByChange(idx, 'user', e.target.value)} required>
            <option value="">Select member</option>
            {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
          </select>
          <input type="number" min="0" placeholder="0" value={row.amount} onChange={e => handlePaidByChange(idx, 'amount', e.target.value)} required />
          {paidBy.length > 1 && <button type="button" className="remove-paidby-btn" onClick={() => removePaidByRow(idx)} title="Remove">×</button>}
        </div>
      ))}
      <button type="button" className="add-paidby-btn" onClick={addPaidByRow}>+ Add Payer</button>
      <label>Split Between</label>
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
      {error && <div className="add-expense-error">{error}</div>}
      <button className="add-expense-btn" type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Expense'}</button>
    </form>
  );
};

export default AddExpenseForm;
