'use client'

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { contractConfig, CONTRACT_FUNCTIONS } from '@/lib/contract'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { toast } from 'sonner'
import { useState, useEffect, useRef, useCallback, startTransition } from 'react'

const proposalSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(2000, 'Description must be 2000 characters or less'),
})

type ProposalFormValues = z.infer<typeof proposalSchema>

/**
 * ProposalForm Component
 * Form for creating new proposals
 */
export function ProposalForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const hasNavigated = useRef(false)

  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  })

  const { writeContract, data: hash, isPending } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const onSubmit = useCallback((values: ProposalFormValues) => {
    setIsSubmitting(true)
    hasNavigated.current = false
    writeContract(
      {
        address: contractConfig.address,
        abi: contractConfig.abi,
        functionName: CONTRACT_FUNCTIONS.createProposal,
        args: [values.title, values.description],
      },
      {
        onError: (error: Error) => {
          toast.error(error.message || 'Failed to create proposal. Please try again.')
          setIsSubmitting(false)
        },
      }
    )
  }, [writeContract])

  // Handle successful transaction
  useEffect(() => {
    if (isSuccess && isSubmitting && !hasNavigated.current) {
      hasNavigated.current = true
      toast.success('Proposal created successfully!')
      startTransition(() => {
        setIsSubmitting(false)
        router.push('/')
      })
    }
  }, [isSuccess, isSubmitting, router])

  const isLoading = isPending || isConfirming || isSubmitting

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit(onSubmit)(e)
        }}
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Proposal Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter a clear and concise title"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                A brief title that summarizes your proposal (max 200 characters)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Proposal Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your proposal in detail..."
                  className="min-h-32"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                Provide detailed information about your proposal (max 2000 characters)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <section className="flex flex-row items-center gap-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 sm:flex-initial"
          >
            {isLoading ? 'Creating Proposal...' : 'Create Proposal'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </section>
      </form>
    </Form>
  )
}

