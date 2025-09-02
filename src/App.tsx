import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SessionContextProvider, useSession } from "./context/SessionContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/providers/ThemeProvider"; // Changed to use path alias

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

const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <SessionContextProvider>
          <BrowserRouter>
            <AppRoutes />
            <Toaster />
          </BrowserRouter>
        </SessionContextProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

const AppRoutes = () => {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      {session ? (
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="paychecks" element={<PaychecksPage />} />
          <Route path="budgets" element={<BudgetsPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="payment-plans" element={<PaymentPlansPage />} />
          <Route path="payment-plans/:planId" element={<PaymentPlanDetailPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      ) : (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="/create-profile" element={<CreateProfile />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      )}
    </Routes>
  );
};

export default App;