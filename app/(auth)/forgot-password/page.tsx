"use client"

import { useState, FormEvent, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [otpValue, setOtpValue] = useState(["", "", "", "", "", ""])
  const [step, setStep] = useState<"email" | "otp">("email")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  async function handleSendOtp(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Something went wrong")
        return
      }

      setStep("otp")
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp(e: FormEvent) {
    e.preventDefault()
    setError(null)

    const otp = otpValue.join("")
    if (otp.length !== 6) {
      setError("Please enter the full 6-digit OTP")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Invalid OTP")
        return
      }

      router.push(`/reset-password?token=${data.resetToken}`)
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  function handleOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return

    const next = [...otpValue]
    next[index] = value.slice(-1)
    setOtpValue(next)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otpValue[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData("text")
    if (!/^\d{6}$/.test(text)) return
    e.preventDefault()
    const digits = text.split("")
    setOtpValue(digits)
    inputRefs.current[5]?.focus()
  }

  function resendOtp() {
    setOtpValue(["", "", "", "", "", ""])
    handleSendOtp(new Event("submit") as unknown as FormEvent)
  }

  if (step === "otp") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF8F4] px-4">
        <div className="w-full max-w-sm rounded-xl border border-stone-200 bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="font-heading text-2xl font-semibold text-[#1C1C1E]">
              Enter OTP
            </h1>
            <p className="mt-1 text-sm text-[#6B6B6B]">
              A 6-digit code was sent to {email}
            </p>
          </div>

          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6">
            <div className="flex justify-center gap-2">
              {otpValue.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  onPaste={i === 0 ? handleOtpPaste : undefined}
                  className="size-10 rounded-lg border border-stone-200 bg-white text-center text-lg font-semibold text-[#1C1C1E] outline-none transition-colors focus:border-[#C8A96E] focus:ring-1 focus:ring-[#C8A96E]"
                />
              ))}
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
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={resendOtp}
                disabled={loading}
                className="text-sm font-medium text-[#C8A96E] hover:underline disabled:opacity-50"
              >
                Resend OTP
              </button>
            </div>

            <p className="text-center text-xs text-[#6B6B6B]">
              <button
                type="button"
                onClick={() => { setStep("email"); setError(null) }}
                className="font-medium text-[#1C1C1E] underline-offset-2 hover:text-[#C8A96E] hover:underline"
              >
                Use a different email
              </button>
            </p>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF8F4] px-4">
      <div className="w-full max-w-sm rounded-xl border border-stone-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="font-heading text-2xl font-semibold text-[#1C1C1E]">
            Reset Password
          </h1>
          <p className="mt-1 text-sm text-[#6B6B6B]">
            Enter your email to receive a one-time code
          </p>
        </div>

        <form onSubmit={handleSendOtp} className="flex flex-col gap-5">
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
            {loading ? "Sending..." : "Send OTP"}
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
