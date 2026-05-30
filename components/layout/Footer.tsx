export default function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-white py-6">
      <div className="mx-auto max-w-7xl px-4 text-center text-sm text-mutedText sm:px-6 lg:px-8">
        &copy; {new Date().getFullYear()} StudyMate AI HUB. All rights
        reserved.
      </div>
    </footer>
  )
}
