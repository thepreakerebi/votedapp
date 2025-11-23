import { ProtectedRoute } from '@/components/protectedRoute'
import { Navbar } from '../_components/navbar'
import { ProposalForm } from '../_components/proposalForm'

/**
 * Create Proposal Page
 * Protected route - requires wallet connection
 */
export default function CreateProposalPage() {
  return (
    <ProtectedRoute>
      <Navbar showBackButton={true} hideCreateButton={true} />
      <main className="container mx-auto py-8 px-4">
        <section className="max-w-[450px] mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Create New Proposal</h1>
            <p className="text-muted-foreground">
              Submit a proposal for the community to vote on
            </p>
          </header>
          <ProposalForm />
        </section>
      </main>
    </ProtectedRoute>
  )
}

