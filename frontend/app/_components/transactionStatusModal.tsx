'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2 } from 'lucide-react'

interface TransactionStatusModalProps {
  isOpen: boolean
  status: 'pending' | 'confirming' | 'success' | 'error' | null
  errorMessage?: string
}

/**
 * TransactionStatusModal Component
 * Shows transaction status while user confirms in wallet and transaction processes
 */
export function TransactionStatusModal({
  isOpen,
  status,
  errorMessage,
}: TransactionStatusModalProps) {
  const getStatusContent = () => {
    switch (status) {
      case 'pending':
        return {
          title: 'Confirm Transaction',
          description: 'Please confirm the transaction in your wallet. The wallet window should appear shortly.',
          showLoader: true,
        }
      case 'confirming':
        return {
          title: 'Transaction Submitted',
          description: 'Your transaction has been submitted and is being confirmed on the blockchain. This may take a few moments...',
          showLoader: true,
        }
      case 'success':
        return {
          title: 'Transaction Confirmed',
          description: 'Your proposal has been successfully created!',
          showLoader: false,
        }
      case 'error':
        return {
          title: 'Transaction Failed',
          description: errorMessage || 'The transaction failed. Please try again.',
          showLoader: false,
        }
      default:
        return {
          title: 'Processing',
          description: 'Please wait...',
          showLoader: true,
        }
    }
  }

  const content = getStatusContent()

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" aria-describedby="transaction-status-description">
        <DialogHeader>
          <DialogTitle>{content.title}</DialogTitle>
          <DialogDescription id="transaction-status-description">
            {content.description}
          </DialogDescription>
        </DialogHeader>
        <section className="flex flex-col items-center justify-center py-6">
          {content.showLoader ? (
            <Loader2 className="size-8 animate-spin text-primary" />
          ) : status === 'success' ? (
            <p className="text-sm text-muted-foreground">✓ Success</p>
          ) : status === 'error' ? (
            <p className="text-sm text-destructive">✗ Error</p>
          ) : null}
        </section>
      </DialogContent>
    </Dialog>
  )
}

