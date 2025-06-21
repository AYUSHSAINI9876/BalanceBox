import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../../../components/Sidebar/Sidebar';
import TripNavbar from '../../../components/Navbar/TripNavbar';
import fetchWithAuth from '../../../utils/fetchWihAuth';
import './SplitMatrix.css';

const API_BASE = 'https://splitmate-zqda.onrender.com';

const SplitMatrix = () => {
  const { tripId } = useParams();
  const [matrix, setMatrix] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError('');
      try {
        const [matrixRes, membersRes] = await Promise.all([
          fetchWithAuth(`${API_BASE}/api/trips/${tripId}/balanceMatrix`),
          fetchWithAuth(`${API_BASE}/api/trips/${tripId}`)
        ]);
        if (!matrixRes.ok || !membersRes.ok) throw new Error('Could not fetch data');
        const matrixJson = await matrixRes.json();
        const membersJson = await membersRes.json();
        setMatrix(matrixJson.balanceMatrix || []);
        setMembers(membersJson.members || []);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    }
    fetchData();
  }, [tripId]);

  return (
    <div className="trips-layout">
      <Sidebar />
      <main className="trips-main-content">
        <TripNavbar />
        <h2 className="split-matrix-title">Split Matrix</h2>
        <div className="split-matrix-table-container">
          {loading ? <div className="split-matrix-loading">Loading...</div> :
            error ? <div className="split-matrix-error">{error}</div> :
            (matrix.length === 0 || members.length === 0) ? <div className="split-matrix-empty">No data</div> :
            <table className="split-matrix-table">
              <thead>
                <tr>
                  <th></th>
                  {members.map(m => <th key={m._id}>{m.name}</th>)}
                </tr>
              </thead>
              <tbody>
                {members.map((rowMember, i) => (
                  <tr key={rowMember._id}>
                    <th>{rowMember.name}</th>
                    {members.map((colMember, j) => (
                      <td key={colMember._id} className={i === j ? 'self' : matrix[i][j] > 0 ? 'owe' : matrix[i][j] < 0 ? 'get' : 'settled'}>
                        {i === j ? '--' : matrix[i][j] === 0 ? '' : matrix[i][j] > 0 ? `Owes ₹${matrix[i][j].toFixed(2)}` : `Gets ₹${Math.abs(matrix[i][j]).toFixed(2)}`}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          }
        </div>
      </main>
    </div>
  );
};

export default SplitMatrix;
