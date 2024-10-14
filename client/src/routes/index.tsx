import { WhyChooseUdrive } from '@/components/home/why-choose-u-drive'
import { LandingPage } from '@/components/home/landing'
import { createFileRoute } from '@tanstack/react-router'
import { ServiceCards } from '@/components/home/service'
import { TestimonialSection } from '@/components/home/testimonials'
import { Footer } from '@/components/footer'

export const Route = createFileRoute('/')({
  component: HomeComponent,
})

function HomeComponent() {
  return (
    <>
      <LandingPage />
      <WhyChooseUdrive />
      <ServiceCards />
      <TestimonialSection />
      <Footer />
    </>
  )
}
