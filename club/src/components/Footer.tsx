"use client";

import { Link } from "wouter";

import { PluginConfig } from "@/types/plugin-config";
import { usePluginConfig } from "@tagadapay/plugin-sdk/react";
import { Crown, Facebook, Instagram, LucideIcon, Twitter } from "lucide-react";

const SOCIAL_ICONS: Record<string, LucideIcon> = {
  Twitter,
  Facebook,
  Instagram,
};

export function Footer() {
  const { config } = usePluginConfig<PluginConfig>();

  // Get current year for copyright
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t py-12 bg-zinc-50 dark:bg-zinc-900">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Crown
                className="h-6 w-6"
                style={{ color: config.branding.colors.primary }}
              />
              <span className="font-bold text-lg">{config.meta.title}</span>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {config.meta.description}
            </p>
            {/* Social Links */}
            <div className="pt-2">
              <h4 className="font-medium text-sm mb-3">
                {config.footer.social.title}
              </h4>
              <div className="flex space-x-4">
                {config.footer.social.items.map((social, index) => {
                  const Icon = SOCIAL_ICONS[social.icon] || Twitter;
                  return (
                    <Link
                      key={index}
                      href={social.url}
                      className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
                      aria-label={social.title}
                    >
                      <Icon className="h-5 w-5" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Sections */}
          {config.footer.sections.map((section, index) => (
            <div key={index} className="space-y-4">
              <h4 className="font-medium text-sm">{section.title}</h4>
              <ul className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <Link
                      href={item.url}
                      className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter/Additional Column */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm">{config.meta.tagline}</h4>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {config.footer.poweredBy}
            </p>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800">
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            {config.footer.copyright
              .replace("{year}", currentYear.toString())
              .replace("{title}", config.meta.title)}
          </p>
        </div>
      </div>
    </footer>
  );
}
