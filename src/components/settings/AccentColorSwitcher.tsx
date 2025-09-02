"use client"

import { useAccentColor } from "@/hooks/use-accent-color";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const colors = [
  { name: 'blue', hex: '#2563eb' },
  { name: 'red', hex: '#dc2626' },
  { name: 'orange', hex: '#f97316' },
  { name: 'yellow', hex: '#eab308' },
  { name: 'green', hex: '#16a34a' },
  { name: 'indigo', hex: '#4f46e5' },
  { name: 'violet', hex: '#8b5cf6' },
] as const;

type AccentColor = typeof colors[number]['name'];

export const AccentColorSwitcher = () => {
  const { accentColor, setAccentColor } = useAccentColor();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accent Color</CardTitle>
        <CardDescription>Choose a color for buttons and highlights.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color.name}
              onClick={() => setAccentColor(color.name as AccentColor)}
              className={cn(
                "h-8 w-8 rounded-full border-2 flex items-center justify-center",
                accentColor === color.name ? "border-primary" : "border-transparent"
              )}
              style={{ backgroundColor: color.hex }}
              aria-label={`Set accent color to ${color.name}`}
            >
              {accentColor === color.name && <Check className="h-5 w-5 text-white mix-blend-difference" />}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};