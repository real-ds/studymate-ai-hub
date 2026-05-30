"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, CheckCircle2 } from "lucide-react"
import { useFileUpload } from "@/hooks/useFileUpload"
import UploadProgress from "./UploadProgress"
import FileTypeIcon from "./FileTypeIcon"

interface FileDropzoneProps {
  feature: string
  onUploadComplete: (fileRecordId: string, fileUrl: string) => void
}

const MAX_SIZE = 25 * 1024 * 1024

export default function FileDropzone({ feature, onUploadComplete }: FileDropzoneProps) {
  const { upload, progress, status, error, reset } = useFileUpload()
  const [successFile, setSuccessFile] = useState<string | null>(null)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      reset()
      setSuccessFile(null)

      const result = await upload(file, feature)
      if (result) {
        setSuccessFile(file.name)
        onUploadComplete(result.fileRecordId, result.fileUrl)
      }
    },
    [feature, onUploadComplete, reset, upload]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/msword": [".doc"],
      "text/plain": [".txt"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxSize: MAX_SIZE,
    multiple: false,
  })

  return (
    <div className="flex flex-col gap-3">
      <div
        {...getRootProps()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          isDragActive
            ? "border-[#C8A96E] bg-[#C8A96E]/5"
            : "border-stone-300 bg-white hover:border-stone-400"
        }`}
      >
        <input {...getInputProps()} />
        {successFile ? (
          <CheckCircle2 className="h-10 w-10 text-[#27AE60]" />
        ) : (
          <Upload className="h-10 w-10 text-[#6B6B6B]" />
        )}

        {successFile ? (
          <div>
            <p className="text-sm font-medium text-[#27AE60]">{successFile} uploaded</p>
          </div>
        ) : isDragActive ? (
          <p className="text-sm text-[#1C1C1E]">Drop your file here</p>
        ) : (
          <div>
            <p className="text-sm font-medium text-[#1C1C1E]">
              Drag & drop your file here
            </p>
            <p className="mt-1 text-xs text-[#6B6B6B]">
              or click to browse
            </p>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-2 text-xs text-[#6B6B6B]">
          <span className="flex items-center gap-1">
            <FileTypeIcon fileType="pdf" className="h-3.5 w-3.5" /> PDF
          </span>
          <span className="flex items-center gap-1">
            <FileTypeIcon fileType="docx" className="h-3.5 w-3.5" /> DOC/DOCX
          </span>
          <span className="flex items-center gap-1">
            <FileTypeIcon fileType="pptx" className="h-3.5 w-3.5" /> PPTX
          </span>
          <span className="flex items-center gap-1">
            <FileTypeIcon fileType="txt" className="h-3.5 w-3.5" /> TXT
          </span>
          <span className="flex items-center gap-1">
            <FileTypeIcon fileType="image" className="h-3.5 w-3.5" /> JPG/PNG/WEBP
          </span>
        </div>
      </div>

      {(status === "uploading" || status === "done" || status === "error") && (
        <UploadProgress progress={progress} status={status} fileName={successFile || "file"} />
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-[#C0392B]">
          {error}
        </div>
      )}
    </div>
  )
}
