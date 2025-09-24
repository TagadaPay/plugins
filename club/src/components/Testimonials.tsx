"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { PluginConfig } from "@/types/plugin-config";
import { usePluginConfig } from "@tagadapay/plugin-sdk/react";
import { Star } from "lucide-react";

export function Testimonials() {
  const { config } = usePluginConfig<PluginConfig>();

  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <Badge className="text-white bg-[var(--primary-color)]">
              {config.testimonials.badge}
            </Badge>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              {config.testimonials.title}
            </h2>
            <p className="mx-auto max-w-[700px] text-zinc-500 dark:text-zinc-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              {config.testimonials.subtitle}
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
          {config.testimonials.items.map((testimonial, index) => (
            <Card
              key={index}
              className="text-center transition-all duration-200 hover:shadow-md"
            >
              <CardHeader>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full overflow-hidden">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-current text-[var(--primary-color)]"
                    />
                  ))}
                </div>
                <p className="text-zinc-500 dark:text-zinc-400">
                  "{testimonial.quote}"
                </p>
              </CardContent>
              <CardFooter className="flex flex-col">
                <p className="font-semibold">{testimonial.name}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {testimonial.title}
                </p>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
