import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { KeyRound, Delete } from "lucide-react";
import React from "react";

const LockScreen = () => {
  const [pin, setPin] = React.useState("");

  const handleKeyClick = (key: string) => {
    if (pin.length < 6) {
      setPin(pin + key);
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xs text-center">
        <KeyRound className="mx-auto h-12 w-12 text-primary mb-4" />
        <h1 className="text-3xl font-bold mb-2">Enter PIN</h1>
        <p className="text-muted-foreground mb-8">Unlock your profile to continue.</p>
        
        <div className="mb-6">
          <Input 
            type="password"
            value={pin}
            readOnly
            placeholder="••••••"
            className="text-center text-4xl tracking-[0.5em] bg-secondary border-border h-16"
          />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {'123456789'.split('').map(key => (
            <Button key={key} variant="outline" className="h-16 text-2xl" onClick={() => handleKeyClick(key)}>{key}</Button>
          ))}
          <Button variant="outline" className="h-16 text-2xl" onClick={handleDelete}><Delete /></Button>
          <Button variant="outline" className="h-16 text-2xl" onClick={() => handleKeyClick('0')}>0</Button>
          <Button variant="link" className="text-muted-foreground text-xs h-16">Switch Profile</Button>
        </div>

        <Button className="w-full h-12 text-lg bg-primary hover:bg-primary/90 mb-4">Unlock</Button>
        
        <Button asChild variant="link" className="text-primary">
            <Link to="/create-profile">Create New Profile</Link>
        </Button>
      </div>
    </div>
  );
};

export default LockScreen;