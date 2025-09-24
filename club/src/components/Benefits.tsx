"use client";

import { Badge } from "@/components/ui/badge";
import { PluginConfig } from "@/types/plugin-config";
import { usePluginConfig } from "@tagadapay/plugin-sdk/react";
import { Gift, LucideIcon, Shield, Zap } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Zap,
  Gift,
  Shield,
};

interface BenefitItem {
  icon: string;
  title: string;
  description: string;
}

export function Benefits() {
  const { config } = usePluginConfig<PluginConfig>();

  return (
    <section
      id="benefits"
      className="w-full py-12 md:py-24 lg:py-32 bg-zinc-50 dark:bg-zinc-900"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <Badge className="bg-primary-500 text-white bg-[var(--primary-color)]">
              {config.benefits.badge}
            </Badge>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              {config.benefits.title}
            </h2>
            <p className="mx-auto max-w-[700px] text-zinc-500 dark:text-zinc-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              {config.benefits.subtitle}
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
          {config.benefits.items.map((benefit: BenefitItem, index: number) => {
            const Icon = ICON_MAP[benefit.icon] || Shield;
            return (
              <div
                key={index}
                className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800 text-center"
              >
                <div
                  className="rounded-full p-3"
                  style={{
                    backgroundColor: config.branding.colors.primary + "20",
                  }}
                >
                  <Icon className="h-8 w-8 text-[var(--primary-color)]" />
                </div>
                <h3 className="text-xl font-bold">{benefit.title}</h3>
                <p className="text-center text-zinc-500 dark:text-zinc-400">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
