import { cookieStorage, createStorage } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { sepolia } from '@reown/appkit/networks'

/**
 * Wagmi Configuration using Reown AppKit
 * Sets up WagmiAdapter with Sepolia network
 */

// Get projectId from environment variable
// Should be set in .env.local as NEXT_PUBLIC_PROJECT_ID
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''

if (!projectId) {
  console.warn('Project ID is not defined. WalletConnect features may not work properly.')
}

export const networks = [sepolia]

// Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks,
})

export const config = wagmiAdapter.wagmiConfig
