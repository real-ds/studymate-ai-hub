"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
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
          placeholder="••••••••"
          required
          className="h-10 rounded-lg border border-stone-200 bg-white px-3 text-sm text-[#1C1C1E] outline-none transition-colors focus:border-[#C8A96E] focus:ring-1 focus:ring-[#C8A96E]"
        />
      </div>

      <div className="flex justify-end">
        <Link
          href="/forgot-password"
          className="text-xs text-[#6B6B6B] underline-offset-2 hover:text-[#C8A96E] hover:underline"
        >
          Forgot password?
        </Link>
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
        {loading ? "Signing in..." : "Sign In"}
      </Button>

      <p className="text-center text-xs text-[#6B6B6B]">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-[#1C1C1E] underline-offset-2 hover:text-[#C8A96E] hover:underline"
        >
          Create one
        </Link>
      </p>
    </form>
  )
}
