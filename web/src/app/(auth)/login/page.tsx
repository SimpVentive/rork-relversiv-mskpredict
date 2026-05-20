"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Login failed");
        return;
      }

      // Redirect to dashboard on success
      router.push("/dashboard");
    } catch (error) {
      setError("An error occurred during login");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

//const hash = await bcrypt.hash("Admin@123", 10);

//console.log(hash);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bgPrimary">
      <div className="w-full max-w-md bg-bgSecondary rounded border border-borderLight shadow-soft p-8">
        <h1 className="text-3xl font-bold text-center text-textPrimary mb-8">
          MSKPredict
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-textPrimary">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 border border-borderLight rounded bg-bgPrimary text-textPrimary focus:ring-2 focus:ring-infoPrimary focus:ring-offset-1 outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-textPrimary">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 border border-borderLight rounded bg-bgPrimary text-textPrimary focus:ring-2 focus:ring-infoPrimary focus:ring-offset-1 outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 bg-dangerLight border border-dangerPrimary text-dangerDark rounded text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-infoPrimary text-white font-semibold py-2 rounded hover:shadow-soft transition-shadow disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-textSecondary mt-6">
          Demo credentials: clinician@hospital.com / password123
        </p>
      </div>
    </div>
  );
}
