import Navbar from "@/components/layout/Navbar"
import HistorySidebar from "@/components/layout/HistorySidebar"
import Footer from "@/components/layout/Footer"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1">
        <HistorySidebar />
        <div className="flex flex-1 flex-col">
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </div>
    </div>
  )
}
