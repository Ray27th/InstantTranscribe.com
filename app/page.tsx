import { Hero } from "@/components/hero"
import { VideoDemo } from "@/components/video-demo"
import { ProcessSteps } from "@/components/process-steps"
import { Features } from "@/components/features"
import { Pricing } from "@/components/pricing"
import { Testimonials } from "@/components/testimonials"
import { FAQ } from "@/components/faq"
import { CTA } from "@/components/cta"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <main role="main">
        <Hero />
        <VideoDemo />
        <section aria-labelledby="process-heading">
          <ProcessSteps />
        </section>
        <section aria-labelledby="features-heading">
          <Features />
        </section>
        <section aria-labelledby="pricing-heading">
          <Pricing />
        </section>
        <section aria-labelledby="testimonials-heading">
          <Testimonials />
        </section>
        <section aria-labelledby="faq-heading">
          <FAQ />
        </section>
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
