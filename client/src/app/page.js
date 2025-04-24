// Landing page
'use client'
import Link from 'next/link';
import LoginForm from "@/components/LoginForm";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { Users, Shield } from 'lucide-react';


export default function Home() {
  const router = useRouter();
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
    <div className="w-full max-w-sm">
      <Button variant="outline" size="lg" onClick={() => router.push("./admin/products")}> <Shield />Login as Admin</Button>
      <Button variant="outline" size="lg"  onClick={() => router.push("./staff/orders")}><Users />Login as Staff</Button>
    </div>
  </div>
  );
}
