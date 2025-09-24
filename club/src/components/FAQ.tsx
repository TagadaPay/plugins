"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { PluginConfig } from "@/types/plugin-config";
import { usePluginConfig } from "@tagadapay/plugin-sdk/react";

export function FAQ() {
  const { config } = usePluginConfig<PluginConfig>();
  const faq = config.faq;

  return (
    <section
      id="faq"
      className="w-full py-12 md:py-24 lg:py-32 bg-zinc-50 dark:bg-zinc-900"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <Badge className="text-white bg-[var(--primary-color)]">
              {faq.badge}
            </Badge>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              {faq.title}
            </h2>
            <p className="mx-auto max-w-[700px] text-zinc-500 dark:text-zinc-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              {faq.subtitle}
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-3xl py-12">
          <Accordion type="single" collapsible className="w-full">
            {faq.items.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-b border-zinc-200 dark:border-zinc-800"
              >
                <AccordionTrigger className="text-left text-base font-medium py-4 transition-colors hover:text-[var(--primary-color)]">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-zinc-500 dark:text-zinc-400 pb-4">
                  <p>{item.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
