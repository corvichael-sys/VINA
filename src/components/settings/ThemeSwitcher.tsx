"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Moon, Sun } from "lucide-react"

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme</CardTitle>
        <CardDescription>Select your preferred color theme.</CardDescription>
      </CardHeader>
      <CardContent className="flex space-x-2">
        <Button
          variant={theme === 'light' ? 'default' : 'outline'}
          onClick={() => setTheme('light')}
        >
          <Sun className="mr-2 h-4 w-4" /> Light
        </Button>
        <Button
          variant={theme === 'dark' ? 'default' : 'outline'}
          onClick={() => setTheme('dark')}
        >
          <Moon className="mr-2 h-4 w-4" /> Dark
        </Button>
      </CardContent>
    </Card>
  )
}