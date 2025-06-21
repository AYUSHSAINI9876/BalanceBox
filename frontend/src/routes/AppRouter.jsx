import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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

function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route path="/" element={<Home />} />

        {/* Trips */}
        <Route path="/trips" element={<Trips />} />
        <Route path="/trips/create" element={<CreateTrip />} />
        <Route path="/trips/:tripId" element={<TripOverview />} />
        <Route path="/trips/:tripId/user" element={<TripUser />} />
        <Route path="/trips/:tripId/split-matrix" element={<SplitMatrix />} />
        <Route path="/trips/:tripId/expense-log" element={<ExpenseLog />} />
        <Route path="/trips/:tripId/addexpense" element={<AddExpense />} />
        <Route path="/trips/:tripId/:expenseId/editexpense" element={<EditExpense />} />
       

        {/* Friends */}
        <Route path="/friends" element={<FriendsList />} />
        <Route path="/friends/requests-incoming" element={<IncomingRequests />} />
        <Route path="/friends/requests-pending" element={<OutgoingRequests />} />

        {/* Catch-All */}
        {/* <Route path="*" element={<h2>404 Not Found</h2>} /> */}
      </Routes>
    </Router>
  );
}

export default AppRouter;
