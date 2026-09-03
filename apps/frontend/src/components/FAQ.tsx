import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import * as m from '@/@generated/paraglide/messages';

const faqItems = [
  {
    question: m.faq_question_1,
    answer: m.faq_answer_1,
  },
  {
    question: m.faq_question_2,
    answer: m.faq_answer_2,
  },
  {
    question: m.faq_question_3,
    answer: m.faq_answer_3,
  },
  {
    question: m.faq_question_4,
    answer: m.faq_answer_4,
  },
  {
    question: m.faq_question_5,
    answer: m.faq_answer_5,
  },
  {
    question: m.faq_question_6,
    answer: m.faq_answer_6,
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
            {m.faq_title()}
          </h2>

          <p
            className="
								mt-4
								text-lg
								text-text-muted
								2xl:text-xl
								"
          >
            {m.faq_subtitle()}
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
                {item.question()}
              </AccordionTrigger>

              <AccordionContent
                className="
										text-text-primary
										2xl:text-lg
										"
              >
                {item.answer()}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
