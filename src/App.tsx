import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SessionContextProvider, useSession } from "./context/SessionContext";

import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import CreateProfile from "./pages/CreateProfile";
import { MadeWithDyad } from "./components/made-with-dyad";
import { AppLayout } from "./components/layout/AppLayout";
import DebtsPage from "./pages/DebtsPage";
import PaychecksPage from "./pages/PaychecksPage";
import BudgetsPage from "./pages/BudgetsPage";
import TransactionsPage from "./pages/TransactionsPage";
import PaymentPlansPage from "./pages/PaymentPlansPage";
import SettingsPage from "./pages/SettingsPage"; // Import the new SettingsPage

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {!session ? (
          <>
            <Route path="/create-profile" element={<CreateProfile />} />
            <Route path="*" element={<Login />} />
          </>
        ) : (
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/debts" replace />} />
            <Route path="/debts" element={<DebtsPage />} />
            <Route path="/paychecks" element={<PaychecksPage />} />
            <Route path="/budgets" element={<BudgetsPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/payment-plans" element={<PaymentPlansPage />} />
            <Route path="/settings" element={<SettingsPage />} /> {/* New Settings route */}
            <Route path="*" element={<NotFound />} />
          </Route>
        )}
      </Routes>
      <MadeWithDyad />
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SessionContextProvider>
        <AppRoutes />
      </SessionContextProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;