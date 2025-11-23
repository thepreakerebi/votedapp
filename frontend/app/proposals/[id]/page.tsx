import { Navbar } from '../../_components/navbar'
import { ProposalDetails } from '../../_components/proposalDetails'
import { parseProposalId } from '@/lib/proposalUtils'
import { notFound } from 'next/navigation'

interface ProposalPageProps {
  params: Promise<{ id: string }>
}

export default async function ProposalPage({ params }: ProposalPageProps) {
  const { id } = await params
  
  // Next.js automatically URL-decodes route parameters
  // Parse the unique ID to get the numeric proposal ID
  const proposalId = parseProposalId(id)

  if (proposalId === null) {
    notFound()
  }

  return (
    <>
      <Navbar showBackButton={true} />
      <main className="container mx-auto px-4 py-8">
        <section className="max-w-4xl mx-auto">
          <ProposalDetails proposalId={proposalId} />
        </section>
      </main>
    </>
  )
}

