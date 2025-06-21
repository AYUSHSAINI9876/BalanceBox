import React from 'react';
import Sidebar from '../../../components/Sidebar/Sidebar';
import CreateTripForm from '../../../components/Forms/CreateTripForm';
import './createTrip.css';

const CreateTrip = () => {
  return (
    <div className="trips-layout">
      <Sidebar />
      <main className="trips-main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '100vh' }}>
        <CreateTripForm />
      </main>
    </div>
  );
};

export default CreateTrip;
