"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, UserCircle, UsersThree, type Icon } from "@phosphor-icons/react";

export type NavItem = {
  href: string;
  icon: Icon;
  label: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/profile", icon: UserCircle, label: "프로필" },
  { href: "/main", icon: Globe, label: "메인" },
  { href: "/friends", icon: UsersThree, label: "친구" },
];

type Props = {
  items?: NavItem[];
};

export function BottomNav({ items = NAV_ITEMS }: Props) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <ul className="flex gap-1 rounded-full border border-gray-200 bg-white/90 px-2 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl">
        {items.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-label={label}
                className={`flex items-center justify-center rounded-full p-3 transition-all duration-200 ${
                  active
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                }`}
              >
                <Icon size={22} weight={active ? "fill" : "regular"} />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
