import React from 'react';
import Sidebar from '../../../../components/Sidebar/Sidebar';
import EditExpenseForm from '../../../../components/Forms/EditExpenseForm';
import './editExpense.css';

const EditExpense = () => (
  <div className="trips-layout">
    <Sidebar />
    <main className="trips-main-content">
      <EditExpenseForm />
    </main>
  </div>
);

export default EditExpense;
