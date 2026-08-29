import { createFileRoute } from '@tanstack/react-router';

import { Hero } from '@/components/Hero';
import { CategorySection } from '@/components/categories/CategorySection';
import { FeaturedEventsSection } from '@/components/FeaturedEventsSection';
import { HowItWorksSection } from '@/components/HowItWorksSection';
import { HalfwayImage } from '@/components/HalfwayImage';
import { StatsSection } from '@/components/StatsSection';
import { FAQSection } from '@/components/FAQ';

export const Route = createFileRoute('/$locale/')({
  component: LandingPage,
});

function LandingPage() {
  return (
    <>
      <Hero />
      <CategorySection />
      <FeaturedEventsSection />
      <HowItWorksSection />
      <StatsSection />
      <HalfwayImage />
      <FAQSection />
    </>
  );
}
