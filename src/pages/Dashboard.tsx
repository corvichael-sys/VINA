import { Button } from "@/components/ui/button";
import { useSession } from "@/context/SessionContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { AddDebtForm } from "@/components/debts/AddDebtForm";
import { DebtList } from "@/components/debts/DebtList";

const Dashboard = () => {
  const { profile, logout } = useSession();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex justify-between items-center p-4 md:p-6 border-b">
        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10">
            <AvatarFallback><User /></AvatarFallback>
          </Avatar>
          <h1 className="text-xl md:text-2xl font-bold">
            Welcome, {profile?.username || 'User'}
          </h1>
        </div>
        <Button onClick={logout} variant="outline">Sign Out</Button>
      </header>
      <main className="p-4 md:p-6">
        <div className="flex justify-end mb-6">
          <AddDebtForm />
        </div>
        <DebtList />
      </main>
    </div>
  );
};

export default Dashboard;