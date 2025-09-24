"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PluginConfig } from "@/types/plugin-config";
import { usePluginConfig } from "@tagadapay/plugin-sdk/react";
import { Crown, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

export function Header() {
  const { config } = usePluginConfig<PluginConfig>();
  const [, navigate] = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsDrawerOpen(false); // Close drawer after navigation
  };

  // Get user status from config
  const {
    tier: userTier,
    points: userPoints,
    nextTier,
    pointsToNextTier,
  } = config.header.userStatus;

  const handlePortalNavigation = () => {
    navigate("~/portal");
    setIsDrawerOpen(false); // Close drawer after navigation
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <>
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-zinc-950 shadow-sm">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <Link href="#" className="flex items-center space-x-2">
            <Crown className="h-6 w-6 text-[var(--primary-color)]" />
            <span className="font-bold text-lg">{config.meta.title}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex flex-1 items-center justify-center space-x-8">
            <button
              onClick={() => scrollToSection("benefits")}
              className="text-sm font-medium transition-colors hover:text-primary-500"
            >
              {config.header.navigation.benefits}
            </button>
            <button
              onClick={() => scrollToSection("offers")}
              className="text-sm font-medium transition-colors hover:text-primary-500"
            >
              {config.header.navigation.deals}
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="text-sm font-medium transition-colors hover:text-primary-500"
            >
              {config.header.navigation.faq}
            </button>
          </nav>

          {/* Desktop Account Button */}
          <Button
            size="sm"
            variant="outline"
            className="hidden md:flex border-primary-200 hover:bg-primary-50 hover:text-primary-600"
            onClick={handlePortalNavigation}
          >
            <Crown className="mr-2 h-4 w-4 text-[var(--primary-color)]" />
            {config.header.navigation.account}
          </Button>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleDrawer}
            className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
          isDrawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
            isDrawerOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={toggleDrawer}
        />

        {/* Drawer Content */}
        <div
          className={`absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white dark:bg-zinc-900 shadow-xl transform transition-transform duration-300 ease-in-out ${
            isDrawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Crown className="h-6 w-6 text-[var(--primary-color)]" />
                <span className="font-bold text-lg">{config.meta.title}</span>
              </div>
              <button
                onClick={toggleDrawer}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* User Status Section */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="bg-primary-50 dark:bg-primary-950/30 rounded-lg p-4 border border-primary-100 dark:border-primary-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Crown className="h-5 w-5 text-[var(--primary-color)]" />
                    <span className="font-medium">{userTier} Member</span>
                  </div>
                  <span className="text-sm">{userPoints} points</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full"
                    style={{
                      backgroundColor: config.branding.colors.primary,
                      width: `${
                        (userPoints / (userPoints + pointsToNextTier)) * 100
                      }%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                  {pointsToNextTier} more points until {nextTier} status
                </p>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 p-4 space-y-2">
              <button
                onClick={() => scrollToSection("benefits")}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
              >
                {config.header.navigation.benefits}
              </button>
              <button
                onClick={() => scrollToSection("offers")}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
              >
                {config.header.navigation.deals}
              </button>
              <button
                onClick={() => scrollToSection("faq")}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
              >
                {config.header.navigation.faq}
              </button>
            </nav>

            {/* Account Button */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                size="lg"
                variant="outline"
                className="w-full border-primary-200 hover:bg-primary-50 hover:text-primary-600"
                onClick={handlePortalNavigation}
              >
                <Crown className="mr-2 h-4 w-4 text-[var(--primary-color)]" />
                {config.header.navigation.account}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-zinc-900 to-zinc-800 text-white">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="flex flex-col space-y-4 text-center md:text-left">
              <Badge
                className="w-fit mx-auto md:mx-0"
                style={{ backgroundColor: config.branding.colors.primary }}
              >
                {config.header.hero.badge}
              </Badge>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                {config.header.hero.title}
              </h1>
              <p className="max-w-[600px] text-zinc-200 md:text-xl mx-auto md:mx-0">
                {config.header.hero.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center md:justify-start">
                <Button
                  size="lg"
                  className="text-white transition-colors"
                  style={{ backgroundColor: config.branding.colors.primary }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor =
                      config.branding.colors.primary + "dd";
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor =
                      config.branding.colors.primary;
                  }}
                  onClick={() => scrollToSection("benefits")}
                >
                  {config.header.hero.cta.primary}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-white border-white hover:bg-white/10 bg-transparent hover:text-white"
                  onClick={() => scrollToSection("offers")}
                >
                  {config.header.hero.cta.secondary}
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative rounded-lg overflow-hidden shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-tr from-black/60 to-black/20 z-10"></div>
                <img
                  src={config.header.hero.image}
                  alt="Club members exclusive content"
                  className="w-full object-cover aspect-video"
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                  <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Crown className="h-5 w-5" />
                        <span className="font-medium">{userTier} Member</span>
                      </div>
                      <span className="text-sm">{userPoints} points</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div
                        className="h-2.5 rounded-full bg-[var(--primary-color)]"
                        style={{
                          width: `${
                            (userPoints / (userPoints + pointsToNextTier)) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-zinc-300 mt-2">
                      {pointsToNextTier} more points until {nextTier} status
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Membership Status Card (Mobile) */}
      <section className="md:hidden w-full py-6 bg-white dark:bg-zinc-900">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="bg-primary-50 dark:bg-primary-950/30 rounded-lg p-4 border border-primary-100 dark:border-primary-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Crown className="h-5 w-5 text-[var(--primary-color)]" />
                <span className="font-medium">{userTier} Member</span>
              </div>
              <span className="text-sm">{userPoints} points</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className="h-2.5 rounded-full bg-[var(--primary-color)]"
                style={{
                  width: `${
                    (userPoints / (userPoints + pointsToNextTier)) * 100
                  }%`,
                }}
              ></div>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 text-center">
              {pointsToNextTier} more points until {nextTier} status
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
