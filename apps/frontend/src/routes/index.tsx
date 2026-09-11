import { createFileRoute } from '@tanstack/react-router';

import { Hero } from '@/components/Hero';
import { CategorySection } from '@/components/categories/CategorySection';
import { FeaturedEventsSection } from '@/components/FeaturedEventsSection';
import { HowItWorksSection } from '@/components/HowItWorksSection';
import { HalfwayImage } from '@/components/HalfwayImage';
import { StatsSection } from '@/components/StatsSection';
import { FAQSection } from '@/components/FAQ';

export const Route = createFileRoute('/')({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.query({
        ...context.trpc.events.getFeaturedEvents.queryOptions(),
        staleTime: 'static',
      }),
      context.queryClient.query({
        ...context.trpc.events.getEventStats.queryOptions(),
        staleTime: 'static',
      }),
    ]);
  },
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
