"use client";

import { useEffect, useRef, useState } from "react";

import MyAccountTab from "@/components/portal/MyAccountTab";
import MyOrdersTab from "@/components/portal/MyOrdersTab";
import MySubscriptionsTab from "@/components/portal/MySubscriptionsTab";
import { DialogProvider } from "@/context/DialogProvider";
import { useCustomer } from "@tagadapay/plugin-sdk/react";
import {
  ChevronDown,
  CreditCard,
  LogOut,
  Menu,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { Link, useLocation } from "wouter";

type Tab = {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
  component?: React.ReactNode;
  href?: string;
};

// Internal tabs defined in component
const internalTabs: Tab[] = [
  {
    id: "orders",
    label: "My Orders",
    icon: ShoppingBag,
    description: "View and track your order history",
    component: <MyOrdersTab />,
  },
  {
    id: "account",
    label: "My Account",
    icon: User,
    description: "Manage your personal information and preferences",
    component: <MyAccountTab />,
  },
  {
    id: "subscriptions",
    label: "My Subscriptions",
    icon: CreditCard,
    description: "Manage your active subscriptions",
    component: (
      <DialogProvider>
        <MySubscriptionsTab />
      </DialogProvider>
    ),
  },
];

// Combine internal tabs with external tabs from config
const tabs: Tab[] = [
  ...internalTabs,
  // ...portalConfig.tabs
];

export default function CustomerPortal() {
  const [location, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    if (location === "/portal/orders") return "orders";
    return "orders"; // default tab
  });
  const { customer } = useCustomer();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close sidebar on screen resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("cms_token");
    navigate("~/enter", { replace: true });
    window.dispatchEvent(new Event("storage"));
  };

  const TabButton = ({ tab }: { tab: Tab }) => {
    const isActive = activeTab === tab.id;
    const baseClasses = `
      group relative flex w-full items-center gap-2 rounded-lg border p-3 text-left transition-all
      ${
        isActive
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm"
          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
      }
    `;

    if (tab.href) {
      return (
        <Link
          href={tab.href}
          className={`group relative flex w-full items-center gap-2 rounded-lg border border-emerald-100 bg-gradient-to-r from-white to-emerald-50/30 p-3 text-left transition-all hover:border-emerald-300 hover:from-emerald-50/50 hover:to-emerald-100/50`}
          onClick={() => setSidebarOpen(false)}
        >
          <div className="flex flex-1 items-center gap-2">
            <div className="rounded-lg bg-white p-2 shadow-sm ring-1 ring-emerald-100 transition-all group-hover:ring-emerald-200">
              <tab.icon className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-medium text-emerald-900">
                {tab.label}
                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs text-emerald-700">
                  external
                </span>
              </div>
              <div className="text-xs text-emerald-600">{tab.description}</div>
            </div>
          </div>
          <div className="flex items-center text-emerald-500">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </div>
        </Link>
      );
    }

    return (
      <button
        onClick={() => {
          setActiveTab(tab.id);
          setSidebarOpen(false);
        }}
        className={baseClasses}
      >
        <div
          className={`rounded-lg p-2 ${
            isActive ? "bg-emerald-100" : "bg-gray-100 group-hover:bg-gray-200"
          } `}
        >
          <tab.icon
            className={`h-5 w-5 ${
              isActive ? "text-emerald-600" : "text-gray-600"
            }`}
          />
        </div>
        <div>
          <div className="font-medium">{tab.label}</div>
          <div className="text-xs text-gray-500">{tab.description}</div>
        </div>
        {isActive && (
          <div className="absolute inset-y-0 -right-px flex items-center">
            <div className="h-8 w-2 rounded-l-full bg-emerald-500" />
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-4">
          <nav className="space-y-3" aria-label="Tabs">
            {tabs.map((tab) => (
              <TabButton key={tab.id} tab={tab} />
            ))}
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="mr-2 rounded-md p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                Customer Portal
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {customer?.firstName} {customer?.lastName}
                </p>
                <p className="text-xs text-gray-500">{customer?.email}</p>
              </div>

              {/* User dropdown menu */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 rounded-full bg-emerald-100 p-1 transition-colors hover:bg-emerald-200"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                    <User className="h-4 w-4 text-emerald-600" />
                  </div>
                  <ChevronDown className="mr-1 h-4 w-4 text-emerald-600 hidden sm:block" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 z-10 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <nav className="space-y-3" aria-label="Tabs">
              {tabs.map((tab) => (
                <TabButton key={tab.id} tab={tab} />
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
              {tabs.find((tab) => tab.id === activeTab)?.component}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
