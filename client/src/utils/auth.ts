// utils/auth.ts
export const handleSignOut = async () => {
    try {
      // Optional: Call backend /api/logout if you have one
      // await fetch("/api/logout", { method: "POST" });
    } finally {
      localStorage.removeItem("user");
      window.location.href = "http://localhost:3000";
    }
  };