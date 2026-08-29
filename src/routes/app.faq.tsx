import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { PageHeader } from "@/components/farmer/AppShell";
import { Surface } from "@/components/farmer/bits";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FAQS } from "@/lib/farmer/data";

export const Route = createFileRoute("/app/faq")({
  component: FaqPage,
});

/** Farmer-focused FAQ. */
function FaqPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Help"
        title="Questions we hear"
        accent="most often."
        description="Short answers about tokens, documents, weighing and payments."
      />

      <Surface className="py-2">
        <Accordion type="single" collapsible>
          {FAQS.map((f, i) => (
            <AccordionItem key={f.q} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-sm font-semibold">{f.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Surface>

      <Surface className="mt-4">
        <p className="text-sm font-semibold">Still stuck?</p>
        <p className="mt-1 text-sm text-muted-foreground">Raise a complaint and our support team replies within 24 hours.</p>
        <Link
          to="/app/complaint"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Raise a complaint <ArrowRight className="size-4" />
        </Link>
      </Surface>
    </div>
  );
}
