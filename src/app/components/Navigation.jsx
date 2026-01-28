"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, History, Settings, LayoutDashboard, Music2 } from "lucide-react";
import { Button } from "./ui/button";

export function Navigation({ isAdmin = false }) {
  const pathname = usePathname();

  const navItems = [
    { id: "dashboard", label: "Home", href: "/dashboard", icon: Home },
    { id: "history", label: "History", href: "/history", icon: History },
    { id: "settings", label: "Settings", href: "/settings", icon: Settings },
  ];

  if (isAdmin) {
    navItems.push({ id: "admin", label: "Admin", href: "/admin", icon: LayoutDashboard });
  }

  return (
    <nav className="bg-black border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-[#1DB954] p-2 rounded-lg">
              <Music2 className="w-6 h-6 text-black" />
            </div>
            <span className="text-xl font-bold text-white">EmoBeat</span>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link href={item.href} key={item.id} passHref>
                  <Button
                    asChild
                    variant={isActive ? "default" : "ghost"}
                    className={
                      isActive
                        ? "bg-[#1DB954] text-black hover:bg-[#1ed760]"
                        : "text-gray-400 hover:text-white hover:bg-gray-800"
                    }
                  >
                    <div className="flex items-center">
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </div>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
