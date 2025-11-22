import { sepolia } from 'wagmi/chains'

/**
 * Network Configuration
 * Sepolia Testnet settings for the voting DApp
 */
export const CHAIN_CONFIG = {
  chain: sepolia,
  chainId: 11155111,
  name: 'Sepolia',
  rpcUrls: {
    default: {
      http: ['https://rpc.sepolia.org'],
    },
    public: {
      http: ['https://rpc.sepolia.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Etherscan',
      url: 'https://sepolia.etherscan.io',
    },
  },
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
} as const

/**
 * Supported chains for the application
 */
export const SUPPORTED_CHAINS = [sepolia]

/**
 * Default chain ID
 */
export const DEFAULT_CHAIN_ID = 11155111

/**
 * Block explorer URLs
 */
export const BLOCK_EXPLORER_URLS = {
  sepolia: 'https://sepolia.etherscan.io',
} as const

