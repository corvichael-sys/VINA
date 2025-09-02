"use client"

import { useAccentColor } from "@/hooks/use-accent-color";
import React from "react";

export const AccentColorProvider = ({ children }: { children: React.ReactNode }) => {
  useAccentColor(); // This initializes the hook and applies the class on mount
  return <>{children}</>;
};