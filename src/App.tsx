import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SessionContextProvider, useSession } from "./context/SessionContext";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import CreateProfile from "./pages/CreateProfile";
import Dashboard from "./pages/Dashboard";
import { MadeWithDyad } from "./components/made-with-dyad";

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
          <>
            <Route path="/" element={<Dashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </>
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