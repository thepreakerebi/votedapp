'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface VoteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  proposalTitle: string
  proposalDescription: string
  isLoading: boolean
}

/**
 * VoteConfirmationModal Component
 * Confirmation dialog before voting on a proposal
 */
export function VoteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  proposalTitle,
  proposalDescription,
  isLoading,
}: VoteConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Your Vote</DialogTitle>
          <DialogDescription>
            Please review the proposal before voting. Once submitted, your vote cannot be changed.
          </DialogDescription>
        </DialogHeader>
        
        <section className="space-y-4 py-4">
          <section>
            <h3 className="text-sm font-semibold mb-2">Proposal</h3>
            <p className="text-sm font-medium mb-1">{proposalTitle}</p>
            <p className="text-sm text-muted-foreground line-clamp-3">{proposalDescription}</p>
          </section>
          
          <section className="bg-muted/50 rounded-md p-3">
            <p className="text-xs text-muted-foreground">
              <strong>Note:</strong> Your vote will be recorded on the blockchain and cannot be reversed. Make sure you agree with this proposal before confirming.
            </p>
          </section>
        </section>

        <DialogFooter className="flex flex-row items-center gap-3 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 sm:flex-initial"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 sm:flex-initial"
          >
            {isLoading ? 'Processing...' : 'Confirm Vote'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

