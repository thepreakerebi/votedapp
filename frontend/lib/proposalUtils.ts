/**
 * Utility functions for proposal handling
 */

/**
 * Generate a unique identifier for a proposal from blockchain data
 * Uses creator address, creation timestamp, and proposal ID to create a unique string
 */
export function generateProposalId(creator: string, createdAt: bigint, proposalId: bigint): string {
  // Create a unique identifier from blockchain data
  // Format: creator (lowercase, no 0x) + createdAt + proposalId
  const creatorPart = creator.toLowerCase().replace('0x', '')
  const timestampPart = createdAt.toString()
  const idPart = proposalId.toString()
  
  // Combine and create a hash-like identifier
  return `${creatorPart}-${timestampPart}-${idPart}`
}

/**
 * Parse proposal ID from unique string identifier
 * Returns the numeric proposal ID (bigint) if valid, otherwise null
 * Also handles legacy numeric IDs for backward compatibility
 */
export function parseProposalId(uniqueId: string): bigint | null {
  try {
    // Check if it's a legacy numeric ID (just a number)
    if (/^\d+$/.test(uniqueId)) {
      return BigInt(uniqueId)
    }
    
    // Extract the proposal ID (last part after last hyphen)
    const parts = uniqueId.split('-')
    if (parts.length < 3) return null
    
    const proposalIdStr = parts[parts.length - 1]
    const proposalId = BigInt(proposalIdStr)
    
    return proposalId
  } catch {
    return null
  }
}

/**
 * Generate proposal ID from proposal object
 */
export function getProposalUniqueId(proposal: {
  creator: string
  createdAt: bigint
  id: bigint
}): string {
  return generateProposalId(proposal.creator, proposal.createdAt, proposal.id)
}

