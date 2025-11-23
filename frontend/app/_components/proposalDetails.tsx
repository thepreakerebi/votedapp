'use client'

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useConnections } from 'wagmi'
import { useAppKit } from '@reown/appkit/react'
import { contractConfig, CONTRACT_FUNCTIONS } from '@/lib/contract'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { useState, useEffect, useRef, startTransition } from 'react'
import { VoteConfirmationModal } from './voteConfirmationModal'
import { TransactionStatusModal } from './transactionStatusModal'
import { useQueryClient } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'
import { ExternalLink } from 'lucide-react'

interface Proposal {
  id: bigint
  title: string
  description: string
  creator: `0x${string}`
  createdAt: bigint
  voteCount: bigint
}

interface Vote {
  voter: `0x${string}`
  timestamp: bigint
}

// Type for vote data returned from wagmi (can be object or array)
type VoteData = 
  | { voter: `0x${string}`; timestamp: bigint }
  | [`0x${string}`, bigint]
  | undefined

interface ProposalDetailsProps {
  proposalId: bigint
}

/**
 * ProposalDetails Component
 * Displays full proposal details including voters list
 */
export function ProposalDetails({ proposalId }: ProposalDetailsProps) {
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

  // Fetch proposal details
  // Note: wagmi returns tuple data as an array: [id, title, description, creator, createdAt, voteCount]
  const { data: proposalData, isLoading: isLoadingProposal } = useReadContract({
    address: contractConfig.address,
    abi: contractConfig.abi,
    functionName: CONTRACT_FUNCTIONS.getProposal,
    args: [proposalId],
  })

  // Transform tuple array to Proposal object
  const proposal: Proposal | undefined = proposalData && Array.isArray(proposalData) && proposalData.length === 6
    ? {
        id: proposalData[0] as bigint,
        title: proposalData[1] as string,
        description: proposalData[2] as string,
        creator: proposalData[3] as `0x${string}`,
        createdAt: proposalData[4] as bigint,
        voteCount: proposalData[5] as bigint,
      }
    : undefined

  // Fetch voters list with timestamps
  // Note: wagmi returns array of Vote structs as array of objects
  const { data: votesData, isLoading: isLoadingVotes } = useReadContract({
    address: contractConfig.address,
    abi: contractConfig.abi,
    functionName: CONTRACT_FUNCTIONS.getProposalVotes,
    args: [proposalId],
    query: {
      enabled: !!proposal,
    },
  })

  // Ensure votes are properly formatted
  const votes: Vote[] | undefined = votesData && Array.isArray(votesData)
    ? votesData.map((vote: VoteData) => {
        if (!vote) return null
        // Handle object format { voter, timestamp }
        if (typeof vote === 'object' && !Array.isArray(vote) && 'voter' in vote) {
          return {
            voter: vote.voter,
            timestamp: vote.timestamp,
          }
        }
        // Handle array format [voter, timestamp]
        if (Array.isArray(vote) && vote.length === 2) {
          return {
            voter: vote[0] as `0x${string}`,
            timestamp: vote[1] as bigint,
          }
        }
        return null
      }).filter((vote): vote is Vote => vote !== null)
    : undefined

  // Check if user has voted
  const { data: hasVoted, isLoading: isLoadingVoteStatus } = useReadContract({
    address: contractConfig.address,
    abi: contractConfig.abi,
    functionName: CONTRACT_FUNCTIONS.hasUserVoted,
    args: [proposalId, address as `0x${string}`],
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
        args: [proposalId],
      },
      {
        onSuccess: () => {
          startTransition(() => {
            setTransactionStatus('confirming')
          })
        },
        onError: (error: Error) => {
          startTransition(() => {
            setTransactionStatus('error')
            setErrorMessage(error.message || 'Transaction failed. Please try again.')
            setIsVoting(false)
          })
          toast.error(error.message || 'Transaction failed. Please try again.')
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
      
      setTimeout(() => {
        startTransition(() => {
          setIsVoting(false)
          setTransactionStatus(null)
        })
      }, 1500)
    }
  }, [isSuccess, isVoting, queryClient, proposalId])

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
  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Format address: 0x1234...5678
  const formatAddress = (addr: string | undefined | null) => {
    if (!addr) return '0x0000...0000'
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  // Get full address link to Etherscan
  const getEtherscanLink = (addr: string | undefined | null) => {
    if (!addr) return '#'
    return `https://sepolia.etherscan.io/address/${addr}`
  }

  // Get avatar URL
  const getAvatarUrl = (addr: string | undefined | null) => {
    if (!addr) return 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${addr}`
  }

  if (isLoadingProposal) {
    return (
      <section className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </section>
    )
  }

  if (!proposal) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Proposal not found.</p>
      </Card>
    )
  }

  return (
    <section className="space-y-6">
      {/* Proposal Details Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{proposal.title}</CardTitle>
          <CardDescription className="flex flex-row items-center gap-2 flex-wrap">
            <span>Created by {formatAddress(proposal.creator)}</span>
            <span>•</span>
            <span>{formatDate(proposal.createdAt)}</span>
            <span>•</span>
            <span>
              <strong className="font-semibold">{proposal.voteCount.toString()}</strong> votes
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">{proposal.description}</p>
          </section>
          
          <section>
            <h2 className="text-lg font-semibold mb-2">Creator</h2>
            <section className="flex flex-row items-center gap-3">
              <Avatar className="size-10">
                <AvatarImage src={getAvatarUrl(proposal.creator)} alt={formatAddress(proposal.creator)} />
                <AvatarFallback>{proposal.creator ? proposal.creator.slice(2, 4).toUpperCase() : 'XX'}</AvatarFallback>
              </Avatar>
              <section className="flex flex-col">
                <p className="text-sm font-medium">{formatAddress(proposal.creator)}</p>
                <a
                  href={getEtherscanLink(proposal.creator)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-primary flex flex-row items-center gap-1"
                >
                  View on Etherscan
                  <ExternalLink className="size-3" />
                </a>
              </section>
            </section>
          </section>
        </CardContent>
        <CardFooter className="flex flex-row items-center justify-between">
          {!isConnected ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => open()}
            >
              Connect wallet to vote
            </Button>
          ) : hasVoted ? (
            <p className="text-sm text-muted-foreground">You have voted on this proposal</p>
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

      {/* Voters List Card */}
      <Card>
        <CardHeader>
          <CardTitle>Voters</CardTitle>
          <CardDescription>
            {isLoadingVotes ? (
              'Loading voters...'
            ) : votes && votes.length > 0 ? (
              `${votes.length} ${votes.length === 1 ? 'person has' : 'people have'} voted`
            ) : (
              'No votes yet'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingVotes ? (
            <section className="space-y-4">
              {[1, 2, 3].map((i) => (
                <section key={i} className="flex flex-row items-center gap-3">
                  <Skeleton className="size-10 rounded-full" />
                  <section className="flex-1">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </section>
                </section>
              ))}
            </section>
          ) : votes && votes.length > 0 ? (
            <section className="space-y-4">
              {votes.map((vote, index) => (
                <section
                  key={`${vote.voter}-${index}`}
                  className="flex flex-row items-center justify-between p-3 rounded-lg border"
                >
                  <section className="flex flex-row items-center gap-3">
                    <Avatar className="size-10">
                      <AvatarImage src={getAvatarUrl(vote.voter)} alt={formatAddress(vote.voter)} />
                      <AvatarFallback>{vote.voter ? vote.voter.slice(2, 4).toUpperCase() : 'XX'}</AvatarFallback>
                    </Avatar>
                    <section className="flex flex-col">
                      <p className="text-sm font-medium">{formatAddress(vote.voter)}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(vote.timestamp)}</p>
                    </section>
                  </section>
                  <a
                    href={getEtherscanLink(vote.voter)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-primary flex flex-row items-center gap-1"
                  >
                    View
                    <ExternalLink className="size-3" />
                  </a>
                </section>
              ))}
            </section>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Be the first to vote on this proposal!
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  )
}

