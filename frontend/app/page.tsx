import { Navbar } from './_components/navbar'
import { ProposalList } from './_components/proposalList'

/**
 * Home Page
 * Public route - displays all proposals
 */
export default function Home() {
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8 pt-20">
        <section className="max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Voting Proposals</h1>
            <p className="text-muted-foreground">
              View and vote on community proposals
            </p>
          </header>
          <ProposalList />
        </section>
      </main>
    </>
  )
}
