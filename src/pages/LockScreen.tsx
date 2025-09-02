import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { KeyRound, Delete, User, Users } from "lucide-react";
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Profile {
  username: string;
  avatar_url?: string;
}

const LockScreen = () => {
  const [pin, setPin] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const storedProfiles = JSON.parse(localStorage.getItem('profiles') || '[]');
    setProfiles(storedProfiles);
    const lastUsername = localStorage.getItem('lastUsername');
    if (lastUsername) {
      const lastProfile = storedProfiles.find((p: Profile) => p.username === lastUsername);
      if (lastProfile) {
        setSelectedProfile(lastProfile);
      } else if (storedProfiles.length > 0) {
        setSelectedProfile(storedProfiles[0]);
      }
    } else if (storedProfiles.length > 0) {
      setSelectedProfile(storedProfiles[0]);
    }
  }, []);

  const handleKeyClick = (key: string) => {
    setError(null);
    if (pin.length < 6) {
      setPin(pin + key);
    }
  };

  const handleDelete = () => {
    setError(null);
    setPin(pin.slice(0, -1));
  };

  const handleUnlock = async () => {
    if (!selectedProfile || !pin) return;
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: `${selectedProfile.username}@debt-tracker.local`,
      password: pin,
    });

    setIsLoading(false);
    if (error) {
      setError("Invalid PIN. Please try again.");
      setPin("");
      toast({ variant: "destructive", title: "Login Failed", description: "Invalid PIN provided." });
    } else {
      localStorage.setItem('lastUsername', selectedProfile.username);
      // The SessionContext will detect the sign-in and App.tsx will handle the redirect.
      // No need to navigate() here.
    }
  };
  
  const switchProfile = () => {
      setSelectedProfile(null);
      setPin("");
      setError(null);
  }

  if (!selectedProfile) {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm text-center">
                <Users className="mx-auto h-12 w-12 text-primary mb-4" />
                <h1 className="text-3xl font-bold mb-2">Select Profile</h1>
                <p className="text-muted-foreground mb-8">Choose a profile to unlock.</p>
                <div className="space-y-3 mb-6">
                    {profiles.length > 0 ? profiles.map(profile => (
                        <button key={profile.username} onClick={() => setSelectedProfile(profile)} className="w-full flex items-center gap-4 p-4 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-left">
                            <Avatar>
                                <AvatarImage src={profile.avatar_url} />
                                <AvatarFallback><User /></AvatarFallback>
                            </Avatar>
                            <span className="text-lg font-medium">{profile.username}</span>
                        </button>
                    )) : (
                        <p className="text-muted-foreground">No profiles found.</p>
                    )}
                </div>
                <Button asChild variant="link" className="text-primary">
                    <Link to="/create-profile">Create New Profile</Link>
                </Button>
            </div>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xs text-center">
        <Avatar className="mx-auto h-20 w-20 mb-4">
            <AvatarImage src={selectedProfile.avatar_url} />
            <AvatarFallback className="text-3xl"><User /></AvatarFallback>
        </Avatar>
        <h1 className="text-3xl font-bold mb-2">Welcome, {selectedProfile.username}</h1>
        <p className="text-muted-foreground mb-8">Enter your PIN to unlock.</p>
        
        <div className="mb-4">
          <Input 
            type="password"
            value={pin}
            readOnly
            placeholder="••••••"
            className={`text-center text-4xl tracking-[0.5em] bg-secondary border-border h-16 ${error ? 'border-destructive' : ''}`}
          />
          {error && <p className="text-destructive text-sm mt-2">{error}</p>}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {'123456789'.split('').map(key => (
            <Button key={key} variant="outline" className="h-16 text-2xl" onClick={() => handleKeyClick(key)}>{key}</Button>
          ))}
          <Button variant="outline" className="h-16 text-2xl" onClick={handleDelete}><Delete /></Button>
          <Button variant="outline" className="h-16 text-2xl" onClick={() => handleKeyClick('0')}>0</Button>
          <Button variant="ghost" className="h-16 text-sm text-muted-foreground" onClick={switchProfile}>Switch Profile</Button>
        </div>

        <Button onClick={handleUnlock} className="w-full h-12 text-lg bg-primary hover:bg-primary/90 mb-4" disabled={isLoading}>
            {isLoading ? "Unlocking..." : "Unlock"}
        </Button>
        
        <Button asChild variant="link" className="text-primary">
            <Link to="/create-profile">Create New Profile</Link>
        </Button>
      </div>
    </div>
  );
};

export default LockScreen;