"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signIn, signOut } from "next-auth/react"
import { BookOpen, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useState } from "react"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/about", label: "About Us" },
]

export default function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-stone-200 bg-warmOffWhite/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <BookOpen className="size-6 text-warmAmber" />
          <span className="font-heading text-xl font-semibold text-darkPrimary">
            StudyMate AI HUB
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative text-sm font-medium transition-colors hover:text-warmAmber",
                pathname === link.href
                  ? "text-warmAmber after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:bg-warmAmber"
                  : "text-mutedText"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-4 md:flex">
          {session ? (
            <Link href="/profile" className="flex items-center gap-3">
              <span className="text-sm text-mutedText hover:text-warmAmber">
                {session.user?.name}
              </span>
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt=""
                  className="size-8 rounded-full object-cover"
                />
              ) : (
                <div className="flex size-8 items-center justify-center rounded-full bg-warmAmber text-xs font-medium text-white">
                  {session.user?.name?.charAt(0) || "U"}
                </div>
              )}
            </Link>
          ) : (
            <Button variant="outline" size="sm" onClick={() => signIn()}>
              Sign In
            </Button>
          )}
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="size-5" />
              </Button>
            }
          />
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="mt-8 flex flex-col gap-4 px-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "text-lg font-medium transition-colors",
                    pathname === link.href
                      ? "text-warmAmber"
                      : "text-darkPrimary"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-4 border-t border-stone-200 pt-4">
                {session ? (
                  <div className="flex flex-col gap-3">
                    <Link
                      href="/profile"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-stone-100"
                    >
                      {session.user?.image ? (
                        <img
                          src={session.user.image}
                          alt=""
                          className="size-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex size-10 items-center justify-center rounded-full bg-warmAmber text-sm font-medium text-white">
                          {session.user?.name?.charAt(0) || "U"}
                        </div>
                      )}
                      <span className="text-sm font-medium text-darkPrimary">
                        {session.user?.name}
                      </span>
                    </Link>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setOpen(false)
                        signOut()
                      }}
                    >
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => {
                      setOpen(false)
                      signIn()
                    }}
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}
