import { Button } from "@/components/ui/button";
import { useSession } from "@/context/SessionContext";

const Dashboard = () => {
  const { profile, logout } = useSession();

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">
          Welcome, {profile?.username || 'User'}
        </h1>
        <Button onClick={logout} variant="outline">Sign Out</Button>
      </header>
      <main>
        <p className="text-muted-foreground">Your dashboard is coming soon. This is where you'll see an overview of your debts, budget, and progress.</p>
      </main>
    </div>
  );
};

export default Dashboard;