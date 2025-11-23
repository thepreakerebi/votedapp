'use client'

import { useConnections, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useAppKit } from '@reown/appkit/react'
import { contractConfig, CONTRACT_FUNCTIONS } from '@/lib/contract'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { useState, useEffect, useRef, startTransition } from 'react'

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

  const [isVoting, setIsVoting] = useState(false)
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

  const handleVote = () => {
    if (!isConnected) {
      // This shouldn't happen as button should be disabled, but just in case
      return
    }

    setIsVoting(true)
    hasShownSuccessToast.current = false
    hasShownErrorToast.current = false
    writeContract(
      {
        address: contractConfig.address,
        abi: contractConfig.abi,
        functionName: CONTRACT_FUNCTIONS.vote,
        args: [proposal.id],
      },
      {
        onError: (error: Error) => {
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
      toast.success('Vote submitted successfully!')
      startTransition(() => {
        setIsVoting(false)
      })
    }
  }, [isSuccess, isVoting])

  // Handle transaction confirmation error
  useEffect(() => {
    if (isError && isVoting && !hasShownErrorToast.current) {
      hasShownErrorToast.current = true
      toast.error('Transaction failed. Please try again.')
      startTransition(() => {
        setIsVoting(false)
      })
    }
  }, [isError, isVoting])

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
          <Button
            variant="default"
            size="sm"
            onClick={handleVote}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Vote'}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

