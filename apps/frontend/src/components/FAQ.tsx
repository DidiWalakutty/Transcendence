import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqItems = [
  {
    question: 'What is Eventra?',
    answer: 'Eventra is a platform where you can discover, register and create events.',
  },
  {
    question: 'How can I find an event?',
    answer: 'You can use the category or search bar to find events by name, category or location.',
  },
  {
    question: 'Do I need an account to register for an event?',
    answer:
      'Yes, you need to create an account to register for events. This allows us to keep track of your registrations and provide a personalized experience.',
  },
  {
    question: 'Can I create my own event?',
    answer:
      "Yes, you can create your own event by clicking on the 'Create Event' button and filling out the necessary details.",
  },
  {
    question: 'Are there any fees for attending an event?',
    answer: 'No, Eventra and its events are completely free!',
  },
];

export function FAQSection() {
  return (
    <section className="py-24 2xl:py-32">
      <div
        className="
					mx-auto
					max-w-4xl 
					px-6
					"
      >
        {/* Header */}
        <div className="mb-12 text-center">
          <h2
            className="
								text-5xl 
								font-bold
								text-text-primary
								2xl:text-6xl
								"
          >
            Frequently Asked Questions
          </h2>

          <p
            className="
								mt-4
								text-lg
								text-text-muted
								2xl:text-xl
								"
          >
            Find answers to common questions about Eventra.
          </p>
        </div>

        {/* Accordion */}
        <Accordion
          className="
							w-full
							bg-surface-faq
							shadow-sm
							"
        >
          {faqItems.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-b">
              <AccordionTrigger
                className="
										text-lg
										text-text-muted
										2xl:text-xl
										"
              >
                {item.question}
              </AccordionTrigger>

              <AccordionContent
                className="
										text-text-primary
										2xl:text-lg
										"
              >
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
