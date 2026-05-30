"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function RegisterForm() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function validate(): string | null {
    if (!email.includes("@") || !email.includes(".")) {
      return "Please enter a valid email address"
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters"
    }
    if (password !== confirmPassword) {
      return "Passwords do not match"
    }
    return null
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Registration failed")
        return
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Account created but sign-in failed. Please log in.")
        return
      }

      router.push("/feature/notes")
      router.refresh()
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium text-[#6B6B6B]">
          Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          required
          className="h-10 rounded-lg border border-stone-200 bg-white px-3 text-sm text-[#1C1C1E] outline-none transition-colors focus:border-[#C8A96E] focus:ring-1 focus:ring-[#C8A96E]"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-[#6B6B6B]">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="h-10 rounded-lg border border-stone-200 bg-white px-3 text-sm text-[#1C1C1E] outline-none transition-colors focus:border-[#C8A96E] focus:ring-1 focus:ring-[#C8A96E]"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-[#6B6B6B]">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          required
          minLength={8}
          className="h-10 rounded-lg border border-stone-200 bg-white px-3 text-sm text-[#1C1C1E] outline-none transition-colors focus:border-[#C8A96E] focus:ring-1 focus:ring-[#C8A96E]"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-[#6B6B6B]">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repeat your password"
          required
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
        {loading ? "Creating account..." : "Create Account"}
      </Button>

      <p className="text-center text-xs text-[#6B6B6B]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-[#1C1C1E] underline-offset-2 hover:text-[#C8A96E] hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  )
}
