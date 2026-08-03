import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { getValidToken } from "../utils/auth";
import RouteFallback from "../components/RouteFallback/RouteFallback";

// Route-level code splitting: the login screen no longer ships the whole dashboard.
const Login = lazy(() => import("../pages/Login/Login"));
const Register = lazy(() => import("../pages/Register/Register"));
const Home = lazy(() => import("../pages/Home/Home"));
const Trips = lazy(() => import("../pages/Trips/trips"));
const CreateTrip = lazy(() => import("../pages/Trips/create/createTrip"));
const TripOverview = lazy(() => import("../pages/Trips/Overview/tripOverview"));
const TripUser = lazy(() => import("../pages/Trips/User/TripUser"));
const SplitMatrix = lazy(() => import("../pages/Trips/SplitMatrix/SplitMatrix"));
const ExpenseLog = lazy(() => import("../pages/Trips/ExpenseLog/ExpenseLog"));
const AddExpense = lazy(() => import("../pages/Trips/ExpenseLog/create/addExpense"));
const EditExpense = lazy(() => import("../pages/Trips/ExpenseLog/edit/editExpense"));
const FriendsList = lazy(() => import("../pages/friends/friends/friendsList"));
const IncomingRequests = lazy(() => import("../pages/friends/incoming/incoming_req"));
const OutgoingRequests = lazy(() => import("../pages/friends/outgoing/outgoing_req"));
const Page404 = lazy(() => import("../pages/page404"));

function ProtectedRoute({ children }) {
  const location = useLocation();
  if (!getValidToken()) {
    // Remember where they were headed so login can send them back.
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}

function PublicOnlyRoute({ children }) {
  if (getValidToken()) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function AppRouter() {
  return (
    <Router>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />

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
      </Suspense>
    </Router>
  );
}

export default AppRouter;
