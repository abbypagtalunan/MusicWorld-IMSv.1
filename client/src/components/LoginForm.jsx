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

export default function LoginForm({
  className,
  ...props
}){

  const router = useRouter();
  
  const handleLogin = (event) => {
    event.preventDefault();
    router.push("./dashboard");
  };

{
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
        <CardHeader>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input id="password" type="password" required />
              </div>
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
}
