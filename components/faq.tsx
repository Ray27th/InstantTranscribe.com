import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { HelpCircle } from "lucide-react"

const faqs = [
  {
    question: "How accurate are the transcriptions?",
    answer:
      "Our AI-powered transcription service achieves 90%+ accuracy for clear audio. Accuracy may vary based on audio quality, background noise, and speaker clarity. We continuously improve our models for better results.",
  },
  {
    question: "What file formats do you support?",
    answer:
      "We support all major video and audio formats including MP4, MOV, AVI, MP3, WAV, M4A, and many more. Maximum file size is 2GB per upload.",
  },
  {
    question: "How long does transcription take?",
    answer:
      "Most files are processed in 2-5 minutes regardless of length. Our advanced infrastructure ensures 5x faster processing compared to traditional services.",
  },
  {
    question: "Is my data secure and private?",
    answer:
      "Absolutely. All files are encrypted during upload and processing. We automatically delete your files after 24 hours and never store or share your content. We're GDPR compliant.",
  },
  {
    question: "Can I get refunds if I'm not satisfied?",
    answer:
      "Yes, we offer a satisfaction guarantee. If you're not happy with the transcription quality, contact us within 24 hours for a full refund.",
  },
  {
    question: "Do you offer volume discounts?",
    answer:
      "Yes! If you're processing more than 10 hours of content per month, contact our sales team for custom pricing and volume discounts.",
  },
  {
    question: "Can the service identify different speakers?",
    answer:
      "Yes, our AI automatically identifies and labels different speakers in your audio, making it easy to follow conversations and interviews.",
  },
  {
    question: "What export formats are available?",
    answer:
      "You can download your transcriptions in TXT (plain text), DOCX (Microsoft Word), or SRT (subtitle) formats to fit your workflow needs.",
  },
]

export function FAQ() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="outline" className="mb-4">
            <HelpCircle className="mr-2 h-4 w-4" />
            FAQ
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Frequently Asked Questions</h2>
          <p className="mt-4 text-lg text-gray-600">Everything you need to know about our transcription service.</p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="bg-white border rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
