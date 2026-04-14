// Synced with Antigravity
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
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
import Inventory from "./pages/Inventory";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CarrierEarnings from "./pages/CarrierEarnings";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [status, setStatus] = useState<'loading' | 'auth' | 'unauth'>('loading');

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(currentSession);
          setStatus(currentSession ? 'auth' : 'unauth');
        }
      } catch (err) {
        if (mounted) setStatus('unauth');
      }
    }

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (mounted) {
        setSession(currentSession);
        setStatus(currentSession ? 'auth' : 'unauth');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen bg-[#060E20] w-full">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-2 border-white/5 border-t-blue-500 rounded-full animate-spin shadow-[0_0_20px_rgba(59,130,246,0.2)]" />
          <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em] animate-pulse">Autenticando Zentra...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauth') return <Navigate to="/login" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected routes */}
          <Route path="/carrier" element={<ProtectedRoute><CarrierDashboard /></ProtectedRoute>} />
          <Route path="/carrier/jobs" element={<ProtectedRoute><CarrierJobs /></ProtectedRoute>} />
          <Route path="/carrier/earnings" element={<ProtectedRoute><CarrierEarnings /></ProtectedRoute>} />
          <Route path="/client" element={<ProtectedRoute><ClientDashboard /></ProtectedRoute>} />
          <Route path="/client/quote" element={<ProtectedRoute><QuoteCalculator /></ProtectedRoute>} />
          <Route path="/client/track/:id" element={<ProtectedRoute><ShipmentTracking /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/operations" element={<ProtectedRoute><AdminOperations /></ProtectedRoute>} />
          <Route path="/admin/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
          <Route path="/client/book" element={<ProtectedRoute><BookShipment /></ProtectedRoute>} />
          <Route path="/client/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
          <Route path="/shipment/:id/status" element={<ProtectedRoute><ShipmentStatus /></ProtectedRoute>} />
          <Route path="/shipment/:id/tracking" element={<ProtectedRoute><ShipmentTracking /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
