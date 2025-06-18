import { EmailReturnPage } from "@/components/email-return-page"

interface PageProps {
  params: {
    id: string
  }
}

export default function TranscriptionPage({ params }: PageProps) {
  return <EmailReturnPage transcriptionId={params.id} />
}
