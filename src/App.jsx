import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import Login from "./pages/Login";
import Leads from "./pages/Leads";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {

  const isAuth = localStorage.getItem("auth") === "true";

  return (
    <Router>
      <Routes>

        {/* LOGIN PAGE */}
        <Route path="/login" element={<Login />} />

        {/* CRM LAYOUT */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="leads" />} />
          <Route path="leads" element={<Leads />} />

        </Route>

        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </Router>
  );
}

export default App;