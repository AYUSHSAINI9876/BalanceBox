import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Home from "../pages/Home/Home";
import Trips from "../pages/Trips/trips";
import CreateTrip from "../pages/Trips/create/createTrip";
import TripOverview from "../pages/Trips/Overview/tripOverview";
import TripUser from "../pages/Trips/User/TripUser";
import SplitMatrix from "../pages/Trips/SplitMatrix/SplitMatrix";
import ExpenseLog from "../pages/Trips/ExpenseLog/ExpenseLog";
import AddExpense from "../pages/Trips/ExpenseLog/create/addExpense";
import EditExpense from "../pages/Trips/ExpenseLog/edit/editExpense";
import FriendsList from "../pages/friends/friends/friendsList";
import IncomingRequests from "../pages/friends/incoming/incoming_req";
import OutgoingRequests from "../pages/friends/outgoing/outgoing_req";
import Page404 from "../pages/page404";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  // if (!token) {
  //   return <Navigate to="/login" replace />;
  // }
  return children;
}

function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        {/* Trips */}
        <Route path="/trips" element={<ProtectedRoute><Trips /></ProtectedRoute>} />
        <Route path="/trips/create" element={<ProtectedRoute><CreateTrip /></ProtectedRoute>} />
        <Route path="/trips/:tripId" element={<ProtectedRoute><TripOverview /></ProtectedRoute>} />
        <Route path="/trips/:tripId/user" element={<ProtectedRoute><TripUser /></ProtectedRoute>} />
        <Route path="/trips/:tripId/split-matrix" element={<ProtectedRoute><SplitMatrix /></ProtectedRoute>} />
        <Route path="/trips/:tripId/expense-log" element={<ProtectedRoute><ExpenseLog /></ProtectedRoute>} />
        <Route path="/trips/:tripId/addexpense" element={<ProtectedRoute><AddExpense /></ProtectedRoute>} />
        <Route path="/trips/:tripId/:expenseId/editexpense" element={<ProtectedRoute><EditExpense /></ProtectedRoute>} />
        {/* Friends */}
        <Route path="/friends" element={<ProtectedRoute><FriendsList /></ProtectedRoute>} />
        <Route path="/friends/requests-incoming" element={<ProtectedRoute><IncomingRequests /></ProtectedRoute>} />
        <Route path="/friends/requests-pending" element={<ProtectedRoute><OutgoingRequests /></ProtectedRoute>} />
        {/* 404 */}
        <Route path="/404" element={<Page404 />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;
