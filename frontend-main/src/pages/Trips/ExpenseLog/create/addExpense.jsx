import React from 'react';
import Sidebar from '../../../../components/Sidebar/Sidebar';
import AddExpenseForm from '../../../../components/Forms/AddExpenseForm';
import './addExpense.css';

const AddExpense = () => (
  <div className="trips-layout">
    <Sidebar />
    <main className="trips-main-content">
      <AddExpenseForm />
    </main>
  </div>
);

export default AddExpense;
