"use client"

import { useState, FormEvent, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    if (!token) {
      setError("Missing reset token")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Something went wrong")
        return
      }

      setSuccess(true)
      setTimeout(() => router.push("/login"), 3000)
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF8F4] px-4">
        <div className="w-full max-w-sm rounded-xl border border-stone-200 bg-white p-8 shadow-sm text-center">
          <div className="mb-4 text-4xl">&#10003;</div>
          <h1 className="font-heading text-xl font-semibold text-[#1C1C1E]">
            Password reset successful
          </h1>
          <p className="mt-2 text-sm text-[#6B6B6B]">
            Redirecting you to login...
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block text-sm font-medium text-[#C8A96E] hover:underline"
          >
            Sign in now
          </Link>
        </div>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF8F4] px-4">
        <div className="w-full max-w-sm rounded-xl border border-stone-200 bg-white p-8 shadow-sm text-center">
          <h1 className="font-heading text-xl font-semibold text-[#1C1C1E]">
            Invalid reset link
          </h1>
          <p className="mt-2 text-sm text-[#6B6B6B]">
            This link is missing the reset token. Please request a new password reset.
          </p>
          <Link
            href="/forgot-password"
            className="mt-6 inline-block text-sm font-medium text-[#C8A96E] hover:underline"
          >
            Request new reset link
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF8F4] px-4">
      <div className="w-full max-w-sm rounded-xl border border-stone-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="font-heading text-2xl font-semibold text-[#1C1C1E]">
            Set new password
          </h1>
          <p className="mt-1 text-sm text-[#6B6B6B]">
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-[#6B6B6B]">
              New Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              required
              minLength={8}
              className="h-10 rounded-lg border border-stone-200 bg-white px-3 text-sm text-[#1C1C1E] outline-none transition-colors focus:border-[#C8A96E] focus:ring-1 focus:ring-[#C8A96E]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-[#6B6B6B]">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              required
              minLength={8}
              className="h-10 rounded-lg border border-stone-200 bg-white px-3 text-sm text-[#1C1C1E] outline-none transition-colors focus:border-[#C8A96E] focus:ring-1 focus:ring-[#C8A96E]"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-[#C0392B]">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="h-10 w-full rounded-lg bg-[#C8A96E] text-white hover:bg-[#b89750] disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </Button>

          <p className="text-center text-xs text-[#6B6B6B]">
            Remember your password?{" "}
            <Link
              href="/login"
              className="font-medium text-[#1C1C1E] underline-offset-2 hover:text-[#C8A96E] hover:underline"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#FAF8F4]">
        <p className="text-sm text-[#6B6B6B]">Loading...</p>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
