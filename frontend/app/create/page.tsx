import { ProtectedRoute } from '@/components/protectedRoute'

/**
 * Create Proposal Page
 * Protected route - requires wallet connection
 */
export default function CreateProposalPage() {
  return (
    <ProtectedRoute>
      <main className="container mx-auto py-8 px-4">
        <section className="max-w-2xl mx-auto">
          <header>
            <h1>Create New Proposal</h1>
            <p>Submit a proposal for voting</p>
          </header>
          {/* Proposal form will go here */}
          <p>Proposal form coming soon...</p>
        </section>
      </main>
    </ProtectedRoute>
  )
}

