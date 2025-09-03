import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SessionContextProvider, useSession } from "./context/SessionContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "./providers/ThemeProvider";
import { AccentColorProvider } from "./providers/AccentColorProvider";

import { AppLayout } from "./components/layout/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import PaychecksPage from "./pages/PaychecksPage";
import BudgetsPage from "./pages/BudgetsPage";
import TransactionsPage from "./pages/TransactionsPage";
import PaymentPlansPage from "./pages/PaymentPlansPage";
import PaymentPlanDetailPage from "./pages/PaymentPlanDetailPage";
import SettingsPage from "./pages/SettingsPage";
import Login from "./pages/Login";
import CreateProfile from "./pages/CreateProfile";
import NotFound from "./pages/NotFound";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicRoute from "./components/auth/PublicRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AccentColorProvider>
        <QueryClientProvider client={queryClient}>
          <SessionContextProvider>
            <AppContent /> {/* Render AppContent which contains BrowserRouter and AppRoutes */}
            <Toaster />
          </SessionContextProvider>
        </QueryClientProvider>
      </AccentColorProvider>
    </ThemeProvider>
  );
}

const AppContent = () => {
  const { isLoading } = useSession();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading application...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/create-profile" element={<CreateProfile />} />
        {/* Redirect any other unmatched public route to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="paychecks" element={<PaychecksPage />} />
          <Route path="budgets" element={<BudgetsPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="payment-plans" element={<PaymentPlansPage />} />
          <Route path="payment-plans/:planId" element={<PaymentPlanDetailPage />} />
          <Route path="settings" element={<SettingsPage />} />
          {/* Catch-all for protected routes that don't match */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;