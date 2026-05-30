import LoginForm from "@/components/auth/LoginForm"
import GoogleSignInButton from "@/components/auth/GoogleSignInButton"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF8F4] px-4">
      <div className="w-full max-w-sm rounded-xl border border-stone-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-2xl font-semibold text-[#1C1C1E]">
            Welcome Back
          </h1>
          <p className="mt-1 text-sm text-[#6B6B6B]">Sign in to your account</p>
        </div>

        <div className="flex flex-col gap-4">
          <GoogleSignInButton />
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-stone-200" />
            <span className="text-xs text-[#6B6B6B]">or</span>
            <div className="h-px flex-1 bg-stone-200" />
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
