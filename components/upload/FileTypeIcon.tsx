import {
  FileText,
  FileImage,
  File,
  type LucideIcon,
} from "lucide-react"

const iconMap: Record<string, LucideIcon> = {
  pdf: FileText,
  docx: FileText,
  txt: FileText,
  pptx: File,
  image: FileImage,
  jpg: FileImage,
  jpeg: FileImage,
  png: FileImage,
  webp: FileImage,
}

interface FileTypeIconProps {
  fileType: string
  className?: string
}

export default function FileTypeIcon({ fileType, className }: FileTypeIconProps) {
  const Icon = iconMap[fileType.toLowerCase()] || File
  return <Icon className={className || "h-8 w-8 text-[#6B6B6B]"} aria-hidden="true" />
}
