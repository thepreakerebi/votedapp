/**
 * Contract Address
 * Deployed Voting contract on Sepolia testnet
 */
export const CONTRACT_ADDRESS = '0x17e094aaa69e5E5f5Ef5579702E2E4f8DF87F20a' as const

/**
 * Contract ABI
 * Application Binary Interface for the Voting contract
 * Imported from votingAbi.json
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const VotingABI = require('./votingAbi.json')
export const CONTRACT_ABI = VotingABI

/**
 * Contract Configuration
 * Used by wagmi hooks for contract interactions
 */
export const contractConfig = {
  address: CONTRACT_ADDRESS,
  abi: CONTRACT_ABI,
} as const

/**
 * Contract Function Names (for type safety)
 */
export const CONTRACT_FUNCTIONS = {
  // Read functions
  getProposalCount: 'getProposalCount',
  getAllProposals: 'getAllProposals',
  getProposal: 'getProposal',
  getProposals: 'getProposals',
  getProposalVoters: 'getProposalVoters',
  getProposalVotes: 'getProposalVotes',
  hasUserVoted: 'hasUserVoted',
  getWinningProposal: 'getWinningProposal',
  
  // Write functions
  createProposal: 'createProposal',
  vote: 'vote',
} as const

/**
 * Contract Events
 */
export const CONTRACT_EVENTS = {
  ProposalCreated: 'ProposalCreated',
  VoteCast: 'VoteCast',
} as const

