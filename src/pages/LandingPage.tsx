import Navbar from '../components/landing/Navbar'
import Hero from '../components/landing/Hero'
import Industries from '../components/landing/Industries'
import ProductFacts from '../components/landing/ProductFacts'
import OnboardingJourney from '../components/landing/OnboardingJourney'
import FeatureBento from '../components/landing/FeatureBento'
import HowItWorks from '../components/landing/HowItWorks'
import RolloutScenarios from '../components/landing/RolloutScenarios'
import Pricing from '../components/landing/Pricing'
import FAQ from '../components/landing/FAQ'
import FinalCTA from '../components/landing/FinalCTA'
import Footer from '../components/landing/Footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas font-sans text-slate-900 antialiased">
      <Navbar />
      <main>
        <Hero />
        <Industries />
        <ProductFacts />
        <OnboardingJourney />
        <FeatureBento />
        <HowItWorks />
        <RolloutScenarios />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}
