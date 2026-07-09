"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, PencilSimple, SquaresFour, type Icon } from "@phosphor-icons/react";

import { CreatePanel } from "@/components/bucket/CreatePanel";
import { DashboardPanel } from "@/components/dashboard/DashboardPanel";

export type NavLinkItem = { href: string; icon: Icon; label: string };
export type NavButtonItem = { onClick: () => void; icon: Icon; label: string; active?: boolean };
export type NavItem = NavLinkItem | NavButtonItem;

type Props = {
  items?: NavItem[];
};

export function BottomNav({ items }: Props) {
  const pathname = usePathname();
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const navItems: NavItem[] =
    items ?? [
      {
        icon: SquaresFour,
        label: "대시보드",
        onClick: () => {
          setIsDashboardOpen((prev) => !prev);
          setIsCreateOpen(false);
        },
        active: isDashboardOpen,
      },
      { href: "/main", icon: Globe, label: "메인" },
      {
        icon: PencilSimple,
        label: "작성",
        onClick: () => {
          setIsCreateOpen((prev) => !prev);
          setIsDashboardOpen(false);
        },
        active: isCreateOpen,
      },
    ];

  return (
    <>
      <nav className={`fixed bottom-[calc(env(safe-area-inset-bottom)+1.5rem)] left-1/2 z-50 -translate-x-1/2 transition-all duration-200 ${
        isDashboardOpen || isCreateOpen ? "opacity-0 pointer-events-none lg:opacity-100 lg:pointer-events-auto" : ""
      }`}>
        <ul className="flex gap-1 rounded-full border border-gray-200 bg-white/90 px-2 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl">
          {navItems.map((item) => {
            const { icon: Icon, label } = item;
            const active =
              "href" in item
                ? pathname === item.href && !isDashboardOpen && !isCreateOpen
                : !!item.active;
            const className = `flex cursor-pointer items-center justify-center rounded-full p-3 transition-all duration-200 ${
              active
                ? "bg-gray-100 text-gray-900"
                : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            }`;

            if ("href" in item) {
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-label={label}
                    className={className}
                    onClick={() => {
                      setIsDashboardOpen(false);
                      setIsCreateOpen(false);
                    }}
                  >
                    <Icon size={22} weight={active ? "fill" : "regular"} />
                  </Link>
                </li>
              );
            }

            return (
              <li key={label}>
                <button type="button" onClick={item.onClick} aria-label={label} className={className}>
                  <Icon size={22} weight={active ? "fill" : "regular"} />
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      <DashboardPanel isOpen={isDashboardOpen} onClose={() => setIsDashboardOpen(false)} />
      <CreatePanel isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </>
  );
}
