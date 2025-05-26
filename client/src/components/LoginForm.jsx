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
import { Eye, EyeOff } from "lucide-react"

export default function LoginForm({
  className,
  ...props
}) {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    username: false,
    password: false
  });

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    // Check for empty fields
    const usernameEmpty = username.trim() === '';
    const passwordEmpty = password.trim() === '';
    
    if (usernameEmpty || passwordEmpty) {
      setFieldErrors({
        username: usernameEmpty,
        password: passwordEmpty
      });
      setError('Please fill out all required fields');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/accounts/login", {
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
        setFieldErrors({
          username: true,
          password: true
        });
        setError(data.message || "Invalid credentials");
        return;
      }

      const user = data.user;
      localStorage.setItem("user", JSON.stringify(user));

      if (user.roleID === 1) {
        router.push("/admin/products"); // admin dashboard
      } else if (user.roleID === 2) {
        router.push("/staff/OrderDashboard"); // staff dashboard
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
      setFieldErrors({
        username: true,
        password: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    if (fieldErrors.username || fieldErrors.password) {
      setFieldErrors({ username: false, password: false });
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (fieldErrors.username || fieldErrors.password) {
      setFieldErrors({ username: false, password: false });
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
                  placeholder="Enter your User Code"
                  value={username}
                  onChange={handleUsernameChange}
                  className={cn(
                    fieldErrors.username && "border-red-500 focus:border-red-500 focus:ring-red-500"
                  )}
                />
              </div>
              <div className="grid gap-2 relative">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Enter your password"
                    value={password}
                    onChange={handlePasswordChange}
                    className={cn(
                      "pr-10", // space for the icon
                      fieldErrors.password && "border-red-500 focus:border-red-500 focus:ring-red-500"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-2.5 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging In..." : "LOG IN TO SYSTEM"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}