import PageHeader from "@/components/shared/PageHeader"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Brain, Shield, Zap } from "lucide-react"

const team = [
  {
    name: "D",
    initials: "D",
    role: "Product Owner & Lead Developer",
    description:
      "Architecture, backend systems, AI integration, and database design.",
  },
  {
    name: "Krishna Yadav",
    initials: "KY",
    role: "Co-Developer",
    description:
      "Frontend development, component library, UI/UX implementation, and testing.",
  },
]

const techStack = [
  {
    category: "Frontend",
    items: "Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Lucide Icons",
  },
  {
    category: "Backend",
    items: "Next.js API Routes, NextAuth.js, Drizzle ORM, Neon PostgreSQL",
  },
  {
    category: "AI",
    items: "Google Gemini API, Vercel AI SDK, custom LLM abstraction layer",
  },
  {
    category: "Storage",
    items: "Vercel Blob (file storage), Neon (database)",
  },
]

const values = [
  {
    icon: Brain,
    title: "AI-Powered Learning",
    description:
      "Leveraging state-of-the-art LLMs to transform raw material into structured knowledge.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "Your API key stays encrypted. Files are processed server-side and never shared.",
  },
  {
    icon: Zap,
    title: "Fast & Focused",
    description:
      "Designed for students who need results quickly — no clutter, no distractions.",
  },
  {
    icon: BookOpen,
    title: "Study Smarter",
    description:
      "Five complementary formats that target different cognitive pathways for deeper retention.",
  },
]

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <PageHeader
        title="About Us"
        description="Built by students, for students."
      />

      <section className="mb-16">
        <h2 className="font-heading text-2xl font-semibold text-darkPrimary">
          Our Mission
        </h2>
        <p className="mt-4 leading-relaxed text-mutedText">
          StudyMate AI HUB was born from a simple observation: students
          spend too much time organizing their study materials and not
          enough time actually studying. We set out to build a unified
          platform that does the heavy lifting — extracting, structuring,
          and transforming raw content into the formats that help you
          learn best.
        </p>
        <p className="mt-4 leading-relaxed text-mutedText">
          Whether you&apos;re preparing for an exam, reviewing lecture
          notes, or building a knowledge base, StudyMate gives you five
          powerful tools in one place. No more juggling between apps. No
          more manual note reformatting. Just upload, generate, and learn.
        </p>
      </section>

      <section className="mb-16">
        <h2 className="font-heading text-2xl font-semibold text-darkPrimary">
          Our Team
        </h2>
        <p className="mt-2 text-mutedText">
          Built at{" "}
          <span className="font-medium text-darkPrimary">
            VIT Chennai
          </span>{" "}
          as part of an academic project.
        </p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {team.map((member) => (
            <Card key={member.name}>
              <CardContent className="flex items-start gap-4 p-6">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-warmAmber text-sm font-semibold text-white">
                  {member.initials}
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-darkPrimary">
                    {member.name}
                  </h3>
                  <p className="mt-0.5 text-sm font-medium text-warmAmber">
                    {member.role}
                  </p>
                  <p className="mt-2 text-sm text-mutedText">
                    {member.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="font-heading text-2xl font-semibold text-darkPrimary">
          Tech Stack
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {techStack.map((item) => (
            <div
              key={item.category}
              className="rounded-lg border border-stone-200 bg-white p-4"
            >
              <h3 className="font-heading text-sm font-semibold text-warmAmber uppercase tracking-wide">
                {item.category}
              </h3>
              <p className="mt-1 text-sm text-mutedText">{item.items}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-heading text-2xl font-semibold text-darkPrimary">
          Our Values
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {values.map((value) => {
            const Icon = value.icon
            return (
              <div
                key={value.title}
                className="flex items-start gap-4 rounded-lg border border-stone-200 bg-white p-5"
              >
                <Icon className="mt-1 size-5 shrink-0 text-warmAmber" />
                <div>
                  <h3 className="font-heading text-base font-semibold text-darkPrimary">
                    {value.title}
                  </h3>
                  <p className="mt-1 text-sm text-mutedText">
                    {value.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
