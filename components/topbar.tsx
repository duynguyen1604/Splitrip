"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AuthActions } from "@/components/auth-actions";

interface TopbarProps {
  subtitle?: string;
  rightAction?: React.ReactNode;
}

export function Topbar({ subtitle, rightAction }: TopbarProps) {
  return (
    <header className="sticky top-0 z-50 h-16 md:h-[72px] w-full border-b border-border/70 bg-white/80 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-full max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2.5 text-base sm:text-lg font-bold tracking-tight text-foreground transition-opacity hover:opacity-90"
        >
          <span className="flex size-8 sm:size-9 items-center justify-center rounded-xl bg-teal-700 text-white shadow-sm transition-transform group-hover:scale-105">
            <ArrowUpRight className="size-4 sm:size-5" />
          </span>
          <span className="font-extrabold tracking-tight">tripmate</span>
        </Link>

        <div className="flex items-center gap-4">
          {subtitle && (
            <span className="hidden text-xs text-muted-foreground sm:inline-block">
              {subtitle}
            </span>
          )}
          {rightAction}
          <AuthActions />
        </div>
      </div>
    </header>
  );
}
