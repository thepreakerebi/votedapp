'use client'

import { createConfig, http } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'

/**
 * Wagmi Configuration
 * Sets up wallet connectors and network configuration
 */

// Get project ID from environment variable (for WalletConnect)
// If not set, WalletConnect will still work but with limited features
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''

export const config = createConfig({
  chains: [sepolia],
  connectors: [
    // MetaMask connector (most common)
    injected({
      target: 'metaMask',
    }),
    // MetaMask as explicit connector
    metaMask({
      dappMetadata: {
        name: 'Voting DApp',
        url: typeof window !== 'undefined' ? window.location.origin : '',
      },
    }),
    // WalletConnect connector (for mobile wallets)
    ...(projectId
      ? [
          walletConnect({
            projectId,
            showQrModal: true,
          }),
        ]
      : []),
  ],
  transports: {
    [sepolia.id]: http('https://rpc.sepolia.org'),
  },
  ssr: true, // Enable SSR support for Next.js
})

/**
 * Query Client Configuration
 * Used by React Query for caching and data fetching
 */
export const queryClientConfig = {
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
}

