'use client'

import { useConnections } from 'wagmi'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface NavbarProps {
  showBackButton?: boolean
  hideCreateButton?: boolean
}

/**
 * Navbar Component
 * Displays app name and wallet connection button
 */
export function Navbar({ showBackButton = false, hideCreateButton = false }: NavbarProps) {
  const router = useRouter()
  const connections = useConnections()
  const isConnected = connections.length > 0
  const address = connections[0]?.accounts[0]

  // Format address: 0x1234...5678
  const formatAddress = (addr: string | undefined) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  // Generate avatar URL from address (using a service like DiceBear)
  const getAvatarUrl = (addr: string | undefined) => {
    if (!addr) return ''
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${addr}`
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <header className="container mx-auto flex flex-row items-center justify-between px-4 py-4">
        <section className="flex flex-row items-center gap-3">
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              aria-label="Go back"
            >
              <ArrowLeft className="size-5" />
            </Button>
          )}
          <Link href="/" className="text-xl font-bold">
            Votedapp
          </Link>
        </section>
        
        {isConnected && address ? (
          <nav className="flex flex-row items-center gap-3">
            {!hideCreateButton && (
              <Link href="/create">
                <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                  Create Proposal
                </Button>
              </Link>
            )}
            <p className="hidden text-sm text-muted-foreground lg:inline">
              {formatAddress(address)}
            </p>
            <Avatar className="size-8">
              <AvatarImage src={getAvatarUrl(address)} alt={formatAddress(address)} />
              <AvatarFallback>{address.slice(2, 4).toUpperCase()}</AvatarFallback>
            </Avatar>
          </nav>
        ) : (
          <appkit-button />
        )}
      </header>
    </nav>
  )
}

