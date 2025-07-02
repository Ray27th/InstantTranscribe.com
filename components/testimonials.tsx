import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Content Creator",
    company: "YouTube Channel (500K subs)",
    content:
      "TranscribeFast has revolutionized my workflow. What used to take hours now takes minutes. The accuracy is incredible!",
    rating: 5,
    avatar: "SJ",
  },
  {
    name: "Michael Chen",
    role: "Podcast Producer",
    company: "Tech Talk Podcast",
    content:
      "The speaker identification feature is a game-changer. Perfect transcriptions every time, and the pricing is unbeatable.",
    rating: 5,
    avatar: "MC",
  },
  {
    name: "Dr. Emily Rodriguez",
    role: "Researcher",
    company: "Stanford University",
    content:
      "I use this for transcribing interviews and lectures. The timestamp accuracy and multiple export formats save me so much time.",
    rating: 5,
    avatar: "ER",
  },
]

export function Testimonials() {
  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="outline" className="mb-4">
            <Star className="mr-2 h-4 w-4" />
            Customer Reviews
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Loved by thousands of users</h2>
          <p className="mt-4 text-lg text-gray-600">See what our customers say about their transcription experience.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="relative overflow-hidden border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <Quote className="h-8 w-8 text-blue-600 mb-4" />

                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.content}"</p>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center font-semibold text-blue-600">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                    <p className="text-sm text-gray-500">{testimonial.company}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
