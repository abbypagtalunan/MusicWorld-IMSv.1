// File: components/LoginForm.tsx
'use client'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState } from "react"

// Mock credentials for demo purposes
const validUsers = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'staff', password: 'staff123', role: 'staff' },
];

export default function LoginForm({
  className,
  ...props
}) {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();
  
    try {
      const response = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountID: username,
          password,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        setError(data.message || "Invalid credentials");
        return;
      }
  
      // Save user info to localStorage or context if needed
      const user = data.user;
  
      // Redirect based on roleID
      if (user.roleID === 1) {
        router.push("./admin/products");
      } else if (user.roleID === 2) {
        router.push("./staff/OrderDashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex justify-center mb-4">
        <img
          src="/logo.png" 
          alt="Music World IMS Logo"
          className="w-full max-w-md h-auto"
        />
      </div>
      
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Login to Your Account</CardTitle>
          <CardDescription>Enter your credentials below</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="username">User Code</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Enter your password"
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* Show error message */}
              {error && <p className="text-red-500 text-sm">{error}</p>}

              <Button type="submit" className="w-full">
                LOG IN TO SYSTEM
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}