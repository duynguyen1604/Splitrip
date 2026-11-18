"use client";

import Link from "next/link";
import { ArrowUpRight, Calendar, MapPin } from "lucide-react";
import type { TripRow } from "@/features/trips/types";

interface TripCardProps {
  trip: TripRow;
}

export function TripCard({ trip }: TripCardProps) {
  const formattedDate = trip.start_date
    ? new Date(`${trip.start_date}T00:00:00`).toLocaleDateString("vi-VN")
    : null;

  return (
    <Link
      href={`/trips/${trip.id}`}
      className="group relative flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-400/80 hover:bg-teal-50/20 hover:shadow-md"
    >
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-bold text-foreground transition-colors group-hover:text-teal-800">
          {trip.name}
        </h3>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {trip.destination ? (
            <span className="flex items-center gap-1">
              <MapPin className="size-3 text-teal-600" />
              <span className="truncate">{trip.destination}</span>
            </span>
          ) : null}
          {formattedDate ? (
            <span className="flex items-center gap-1">
              <Calendar className="size-3 text-teal-600" />
              <span>{formattedDate}</span>
            </span>
          ) : null}
          {!trip.destination && !formattedDate && (
            <span>Chưa cập nhật thời gian/địa điểm</span>
          )}
        </div>
      </div>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700 transition-all group-hover:bg-teal-700 group-hover:text-white">
        <ArrowUpRight className="size-4" />
      </span>
    </Link>
  );
}
