"use client";

import type { Member } from "@/features/trips/types";
import { Crown, User } from "lucide-react";

interface MemberListProps {
  members: Member[];
  userId: string;
}

export function MemberList({ members, userId }: MemberListProps) {
  return (
    <div className="divide-y divide-border/70">
      {members.map((member) => {
        const isSelf = member.user_id === userId;
        const isOwner = member.role === "owner";
        const isActive = member.status === "active";

        return (
          <div
            key={member.id}
            className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-800 text-xs font-bold">
                {member.display_name.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground text-sm">
                  {member.display_name}
                  {isSelf && (
                    <span className="ml-1 text-xs text-teal-700 font-medium">
                      (bạn)
                    </span>
                  )}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  Tham gia{" "}
                  {new Date(member.created_at).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>

            <div className="shrink-0">
              {isOwner ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                  <Crown className="size-3" />
                  Người tạo
                </span>
              ) : isActive ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  <User className="size-3" />
                  Thành viên
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                  Đã rời
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
