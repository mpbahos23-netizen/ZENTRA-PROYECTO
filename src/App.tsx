// Synced with Antigravity
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CarrierDashboard from "./pages/CarrierDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import QuoteCalculator from "./pages/QuoteCalculator";
import BookShipment from "./pages/BookShipment";
import Invoices from "./pages/Invoices";
import NotFound from "./pages/NotFound";
import CarrierJobs from "./pages/CarrierJobs";
import ShipmentStatus from "./pages/ShipmentStatus";
import ShipmentTracking from "./pages/ShipmentTracking";
import AdminOperations from "./pages/AdminOperations";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/carrier" element={<CarrierDashboard />} />
          <Route path="/carrier/jobs" element={<CarrierJobs />} />
          <Route path="/client" element={<ClientDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/operations" element={<AdminOperations />} />
          <Route path="/quote" element={<QuoteCalculator />} />
          <Route path="/client/book" element={<BookShipment />} />
          <Route path="/client/invoices" element={<Invoices />} />
          <Route path="/shipment/:id/status" element={<ShipmentStatus />} />
          <Route path="/shipment/:id/tracking" element={<ShipmentTracking />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
