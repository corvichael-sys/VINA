import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
        </CardHeader>
        <CardContent className="pb-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            404 - Page Not Found
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Oops! The page you are looking for does not exist or has been moved.
          </p>
          <Button asChild className="mt-8">
            <Link to="/">Return to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;