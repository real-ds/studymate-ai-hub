"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ErrorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  onRetry?: () => void
}

export default function ErrorModal({
  open,
  onOpenChange,
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again.",
  onRetry,
}: ErrorModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {onRetry && <Button onClick={onRetry}>Retry</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
