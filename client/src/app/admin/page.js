//Admin Login
'use client'
import Link from 'next/link';
import LoginForm from "@/components/LoginForm";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
    <div className="w-full max-w-sm">
      <LoginForm></LoginForm>
    </div>
  </div>
  );
}
