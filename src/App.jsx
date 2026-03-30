import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import Login from "./pages/Login";

import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import Customer from "./pages/Customer";
import Leads from "./pages/Leads";
import Opportunities from "./pages/sales/Opportunities";
import Quotes from "./pages/sales/Quotes";
import ProtectedRoute from "./components/ProtectedRoute";

import Activities from "./pages/sales/Activities";
import Invoices from "./pages/sales/Invoices";
import Deals from "./pages/Deals";
import Settings from "./pages/Settings";
import Products from "./pages/Products";
import Contact from "./pages/administration/Contact";
import Users from "./pages/administration/Users";
import RolesPermissions from "./pages/administration/RolesPermissions";
import Tasks from "./pages/Tasks";
import Payments from "./pages/Payments";
import Tickets from "./pages/Tickets";
import Notes from "./pages/Notes";
import AuditLogs from "./pages/administration/AuditLogs";
import LeadAutomation from "./pages/administration/LeadAutomation";
//marketing
import MarketingDashboard from "./pages/marketing/MarketingDashboard";
import CampaignsList from "./pages/marketing/CampaignsList";
import WhatsAppCampaign from "./pages/marketing/WhatsAppCampaign";

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
  <Route index element={<Navigate to="dashboard" />} />

          <Route path="dashboard" element={<Dashboard />} />
          <Route path="leads" element={<Leads />} />
          <Route path="customer" element={<Customer />} />
          <Route path="reports" element={<Reports />} />
          <Route path="opportunities" element={<Opportunities />} />
          <Route path="activities" element={<Activities />} />
          <Route path="quotes" element={<Quotes />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="deals" element={<Deals />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="payments" element={<Payments />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="notes" element={<Notes />} />
          <Route path="products" element={<Products />} />
          <Route path="contact" element={<Contact />} />
          <Route path="users" element={<Users />} />
          <Route path="roles" element={<RolesPermissions />} />
          <Route path="audit-logs" element={<AuditLogs />} />
          <Route path="lead-automation" element={<LeadAutomation />} />
          <Route path="marketing-dashboard" element={<MarketingDashboard />} />
          <Route path="campaigns" element={<CampaignsList />} />
          <Route path="whatsapp-campaign" element={<WhatsAppCampaign />} />
          <Route path="settings" element={<Settings />} />

        </Route>

        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </Router>
  );
}

export default App;