'use client'

import { wagmiAdapter, projectId } from '@/lib/wagmi.config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import { sepolia } from '@reown/appkit/networks'
import React, { type ReactNode } from 'react'
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi'
import { Toaster } from '@/components/ui/sonner'

// Set up queryClient
const queryClient = new QueryClient()

if (!projectId) {
  console.warn('Project ID is not defined. WalletConnect features may not work properly.')
}

// Set up metadata
const metadata = {
  name: 'Voting DApp',
  description: 'Decentralized Voting Platform',
  url: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
}

// Create the modal
const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [sepolia],
  defaultNetwork: sepolia,
  metadata: metadata,
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
  },
})

/**
 * Context Provider Component
 * Wraps the app with wagmi and React Query providers
 * Includes Reown AppKit modal for wallet connections
 */
export function Providers({ 
  children, 
  cookies 
}: { 
  children: ReactNode
  cookies: string | null 
}) {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
