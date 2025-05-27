'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RequireAuth({ children, role }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.replace("/");
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      if (user.roleID !== role) {
        router.replace("/");
        return;
      }

      setIsAuthorized(true);
    } catch (err) {
      console.error("Invalid user in localStorage");
      router.replace("/");
    } finally {
      setIsChecking(false);
    }
  }, [router, role]);

  if (isChecking) {
    return null;
  }

  return <>{isAuthorized ? children : null}</>;
}
