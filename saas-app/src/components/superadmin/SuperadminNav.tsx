"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number | string | null;
  badgeColor?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

interface SuperadminNavProps {
  attentionCount?: number;
  unclaimedCount?: number;
}

export function SuperadminNav({ attentionCount = 0, unclaimedCount = 0 }: SuperadminNavProps) {
  const pathname = usePathname();

  const groups: NavGroup[] = [
    {
      title: "OVERVIEW",
      items: [
        { label: "Dashboard", href: "/superadmin", icon: "dashboard" },
        {
          label: "Attention Center",
          href: "/superadmin/attention",
          icon: "warning",
          badge: attentionCount > 0 ? attentionCount : null,
          badgeColor: "bg-red-500 text-white",
        },
        { label: "SaaS Metrics", href: "/superadmin/metrics", icon: "monitoring" },
      ],
    },
    {
      title: "CUSTOMERS",
      items: [
        { label: "Organizations", href: "/superadmin/organizations", icon: "account_balance" },
        { label: "Users & Membership", href: "/superadmin/users", icon: "badge" },
        { label: "Customer Health", href: "/superadmin/customer-health", icon: "vital_signs" },
        { label: "Customer Lifecycle", href: "/superadmin/customer-lifecycle", icon: "conversion_path" },
        { label: "Support", href: "/superadmin/support", icon: "support_agent" },
        { label: "Feedback & Requests", href: "/superadmin/feedback", icon: "chat_bubble" },
      ],
    },
    {
      title: "BILLING & SUBSCRIPTION",
      items: [
        { label: "Subscriptions", href: "/superadmin/subscriptions", icon: "verified" },
        { label: "Transactions", href: "/superadmin/transactions", icon: "payments" },
        {
          label: "Unclaimed Payments",
          href: "/superadmin/unclaimed-payments",
          icon: "contact_support",
          badge: unclaimedCount > 0 ? unclaimedCount : null,
          badgeColor: "bg-amber-500 text-slate-900 font-bold",
        },
        { label: "Webhook Events", href: "/superadmin/webhooks", icon: "sync_alt" },
        { label: "Reconciliation", href: "/superadmin/reconciliation", icon: "rule" },
        { label: "Renewal Operations", href: "/superadmin/renewals", icon: "event_repeat" },
      ],
    },
    {
      title: "PRODUCT",
      items: [
        { label: "Usage & Adoption", href: "/superadmin/usage", icon: "analytics" },
        { label: "Feature Usage", href: "/superadmin/usage/features", icon: "featured_play_list" },
        { label: "Plans & Entitlements", href: "/superadmin/plans", icon: "inventory_2" },
      ],
    },
    {
      title: "SYSTEM",
      items: [
        { label: "System Health", href: "/superadmin/system", icon: "dns" },
        { label: "Errors & Incidents", href: "/superadmin/errors", icon: "error" },
        { label: "Storage Usage", href: "/superadmin/storage", icon: "cloud_upload" },
        { label: "Audit Logs", href: "/superadmin/audit", icon: "history" },
      ],
    },
    {
      title: "SETTINGS",
      items: [
        { label: "Payment Provider", href: "/superadmin/settings/payment-provider", icon: "hub" },
        { label: "Platform Settings", href: "/superadmin/settings/platform", icon: "tune" },
      ],
    },
  ];

  return (
    <nav className="space-y-6 text-xs select-none">
      {groups.map((group) => (
        <div key={group.title} className="space-y-1">
          <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            {group.title}
          </div>
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const isActive =
                item.href === "/superadmin"
                  ? pathname === "/superadmin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-all ${
                    isActive
                      ? "bg-[#E89A0C] text-[#07152F] font-bold shadow-sm"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span
                      className={`material-symbols-outlined text-[17px] ${
                        isActive ? "text-[#07152F]" : "text-slate-400"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold tracking-tight ${
                        item.badgeColor || "bg-slate-700 text-white"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
