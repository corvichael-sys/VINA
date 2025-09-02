import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { UserPlus } from "lucide-react";

const CreateProfile = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <UserPlus className="mx-auto h-10 w-10 text-primary mb-4" />
          <CardTitle>Create Profile</CardTitle>
          <CardDescription>Set up your profile to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" placeholder="e.g., john_doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pin">PIN (4-6 digits)</Label>
              <Input id="pin" type="password" placeholder="****" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pin-confirm">Confirm PIN</Label>
              <Input id="pin-confirm" type="password" placeholder="****" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avatar">Profile Picture</Label>
              <Input id="avatar" type="file" accept="image/png, image/jpeg" />
            </div>

            <Button type="submit" className="w-full h-11 text-md bg-primary hover:bg-primary/90 mt-6">
              Create Profile
            </Button>
          </form>
          <div className="mt-4 text-center">
              <Button asChild variant="link" className="text-muted-foreground">
                  <Link to="/">Back to Lock Screen</Link>
              </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateProfile;