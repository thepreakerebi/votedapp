'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

interface ProposalConfirmationCardProps {
  title: string
  description: string
  onBack: () => void
  onConfirm: () => void
  isLoading: boolean
}

/**
 * ProposalConfirmationCard Component
 * Displays proposal details for final confirmation before submission
 */
export function ProposalConfirmationCard({
  title,
  description,
  onBack,
  onConfirm,
  isLoading,
}: ProposalConfirmationCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Confirm Proposal</CardTitle>
        <CardDescription>
          Please review your proposal before submitting. Once submitted, it cannot be changed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <section>
          <h3 className="text-sm font-semibold mb-2">Title</h3>
          <p className="text-sm text-muted-foreground">{title}</p>
        </section>
        <section>
          <h3 className="text-sm font-semibold mb-2">Description</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{description}</p>
        </section>
      </CardContent>
      <CardFooter className="flex flex-row items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
          className="flex-1 sm:flex-initial"
        >
          <ArrowLeft className="size-4 mr-2" />
          Back to Edit
        </Button>
        <Button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className="flex-1 sm:flex-initial"
        >
          {isLoading ? 'Creating Proposal...' : 'Create Proposal'}
        </Button>
      </CardFooter>
    </Card>
  )
}

