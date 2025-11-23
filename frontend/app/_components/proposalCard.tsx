'use client'

import { useConnections, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useAppKit } from '@reown/appkit/react'
import { contractConfig, CONTRACT_FUNCTIONS } from '@/lib/contract'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { useState, useEffect, useRef, startTransition } from 'react'
import { VoteConfirmationModal } from './voteConfirmationModal'
import { TransactionStatusModal } from './transactionStatusModal'
import { useQueryClient } from '@tanstack/react-query'

interface Proposal {
  id: bigint
  title: string
  description: string
  creator: `0x${string}`
  createdAt: bigint
  voteCount: bigint
}

interface ProposalCardProps {
  proposal: Proposal
}

/**
 * ProposalCard Component
 * Displays a single proposal with voting functionality
 */
export function ProposalCard({ proposal }: ProposalCardProps) {
  const connections = useConnections()
  const isConnected = connections.length > 0
  const address = connections[0]?.accounts[0]
  const { open } = useAppKit()
  const queryClient = useQueryClient()

  const [isVoting, setIsVoting] = useState(false)
  const [showVoteModal, setShowVoteModal] = useState(false)
  const [transactionStatus, setTransactionStatus] = useState<'pending' | 'confirming' | 'success' | 'error' | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const hasShownSuccessToast = useRef(false)
  const hasShownErrorToast = useRef(false)

  // Check if user has voted on this proposal
  const { data: hasVoted, isLoading: isLoadingVoteStatus } = useReadContract({
    address: contractConfig.address,
    abi: contractConfig.abi,
    functionName: CONTRACT_FUNCTIONS.hasUserVoted,
    args: [proposal.id, address as `0x${string}`],
    query: {
      enabled: isConnected && !!address,
    },
  })


  // Write function for voting
  const { writeContract, data: hash, isPending } = useWriteContract()

  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess, isError } = useWaitForTransactionReceipt({
    hash,
  })

  const handleVoteClick = () => {
    if (!isConnected) {
      // This shouldn't happen as button should be disabled, but just in case
      return
    }
    setShowVoteModal(true)
  }

  const handleConfirmVote = () => {
    setIsVoting(true)
    setTransactionStatus('pending')
    hasShownSuccessToast.current = false
    hasShownErrorToast.current = false
    setShowVoteModal(false)
    writeContract(
      {
        address: contractConfig.address,
        abi: contractConfig.abi,
        functionName: CONTRACT_FUNCTIONS.vote,
        args: [proposal.id],
      },
      {
        onSuccess: () => {
          // Transaction submitted, now waiting for confirmation
          setTransactionStatus('confirming')
        },
        onError: (error: Error) => {
          setTransactionStatus('error')
          setErrorMessage(error.message || 'Transaction failed. Please try again.')
          toast.error(error.message || 'Transaction failed. Please try again.')
          setIsVoting(false)
        },
      }
    )
  }

  // Handle transaction confirmation success
  useEffect(() => {
    if (isSuccess && isVoting && !hasShownSuccessToast.current) {
      hasShownSuccessToast.current = true
      startTransition(() => {
        setTransactionStatus('success')
      })
      toast.success('Vote submitted successfully!')
      
      // Refetch proposal data and vote status to update UI
      // Invalidate all queries for this contract address to ensure fresh data
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey
          return (
            Array.isArray(queryKey) &&
            queryKey[0] === 'readContract' &&
            typeof queryKey[1] === 'object' &&
            queryKey[1] !== null &&
            'address' in queryKey[1] &&
            queryKey[1].address === contractConfig.address
          )
        },
      })
      
      // Close modal after a brief delay
      setTimeout(() => {
        startTransition(() => {
          setIsVoting(false)
          setTransactionStatus(null)
        })
      }, 1500)
    }
  }, [isSuccess, isVoting, queryClient, proposal.id, address])

  // Handle transaction confirmation error
  useEffect(() => {
    if (isError && isVoting && !hasShownErrorToast.current) {
      hasShownErrorToast.current = true
      startTransition(() => {
        setTransactionStatus('error')
        setErrorMessage('Transaction failed. Please try again.')
        setIsVoting(false)
      })
      toast.error('Transaction failed. Please try again.')
    }
  }, [isError, isVoting])

  // Update status when transaction is pending confirmation
  useEffect(() => {
    if (isPending && transactionStatus === 'pending') {
      startTransition(() => {
        setTransactionStatus('confirming')
      })
    }
  }, [isPending, transactionStatus])

  const isLoading = isLoadingVoteStatus || isPending || isConfirming || isVoting

  // Format timestamp to readable date
  const formatDate = (createdAt: bigint) => {
    const date = new Date(Number(createdAt) * 1000)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Format address: 0x1234...5678
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{proposal.title}</CardTitle>
        <CardDescription>
          Created by {formatAddress(proposal.creator)} • {formatDate(proposal.createdAt)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{proposal.description}</p>
      </CardContent>
      <CardFooter className="flex flex-row items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <strong className="font-semibold">{proposal.voteCount.toString()}</strong> votes
        </p>
        
        {!isConnected ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => open()}
          >
            Connect wallet to vote
          </Button>
        ) : hasVoted ? (
          <p className="text-sm text-muted-foreground">You have voted</p>
        ) : (
          <>
            <Button
              variant="default"
              size="sm"
              onClick={handleVoteClick}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Vote'}
            </Button>
            <VoteConfirmationModal
              isOpen={showVoteModal}
              onClose={() => {
                setShowVoteModal(false)
                setTransactionStatus(null)
                setErrorMessage(undefined)
              }}
              onConfirm={handleConfirmVote}
              proposalTitle={proposal.title}
              proposalDescription={proposal.description}
              isLoading={isLoading}
            />
            <TransactionStatusModal
              isOpen={transactionStatus !== null}
              status={transactionStatus}
              errorMessage={errorMessage}
            />
          </>
        )}
      </CardFooter>
    </Card>
  )
}

