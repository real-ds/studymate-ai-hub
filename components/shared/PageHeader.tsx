interface PageHeaderProps {
  title: string
  description?: string
}

export default function PageHeader({
  title,
  description,
}: PageHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="font-heading text-3xl font-semibold text-darkPrimary">
        {title}
      </h1>
      {description && (
        <p className="mt-2 text-mutedText">{description}</p>
      )}
    </div>
  )
}
