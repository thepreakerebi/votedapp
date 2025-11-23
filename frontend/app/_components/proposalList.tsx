'use client'

import { useReadContract } from 'wagmi'
import { contractConfig, CONTRACT_FUNCTIONS } from '@/lib/contract'
import { ProposalCard } from './proposalCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

/**
 * ProposalList Component
 * Fetches and displays all proposals
 */
export function ProposalList() {
  // Get proposal count
  const { data: proposalCount, isLoading: isLoadingCount } = useReadContract({
    address: contractConfig.address,
    abi: contractConfig.abi,
    functionName: CONTRACT_FUNCTIONS.getProposalCount,
  })

  // Get all proposals
  const { data: proposals, isLoading: isLoadingProposals } = useReadContract({
    address: contractConfig.address,
    abi: contractConfig.abi,
    functionName: CONTRACT_FUNCTIONS.getAllProposals,
    query: {
      enabled: !!proposalCount && Number(proposalCount) > 0,
    },
  })

  if (isLoadingCount || isLoadingProposals) {
    return (
      <section className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-6 w-3/4 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </Card>
        ))}
      </section>
    )
  }

  if (!proposalCount || Number(proposalCount) === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No proposals yet. Be the first to create one!</p>
      </Card>
    )
  }

  if (!proposals || !Array.isArray(proposals)) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Unable to load proposals. Please try again later.</p>
      </Card>
    )
  }

  // Reverse array to show newest proposals first
  const reversedProposals = [...proposals].reverse()

  return (
    <section className="space-y-4">
      {reversedProposals.map((proposal: {
        id?: bigint
        title?: string
        description?: string
        creator?: `0x${string}`
        createdAt?: bigint
        voteCount?: bigint
      }, index: number) => {
        // Capitalize title
        const capitalizeTitle = (title: string) => {
          if (!title) return 'Untitled Proposal'
          return title.charAt(0).toUpperCase() + title.slice(1)
        }

        return (
          <ProposalCard
            key={proposal.id?.toString() || `proposal-${index}`}
            proposal={{
              id: proposal.id || BigInt(0),
              title: capitalizeTitle(proposal.title || 'Untitled Proposal'),
              description: proposal.description || '',
              creator: proposal.creator || ('0x0000000000000000000000000000000000000000' as `0x${string}`),
              createdAt: proposal.createdAt || BigInt(0),
              voteCount: proposal.voteCount || BigInt(0),
            }}
          />
        )
      })}
    </section>
  )
}

