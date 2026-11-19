"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { callRpc, ensureAuthenticatedUser } from "@/lib/api-client";
import { tripKeys } from "@/lib/query-client";

type JoinTripInput = {
  code: string;
  displayName: string;
};

type JoinTripOutput = {
  trip_id: string;
  member_id: string;
};

export function useJoinTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ code, displayName }: JoinTripInput): Promise<JoinTripOutput> => {
      await ensureAuthenticatedUser();
      const data = await callRpc<JoinTripOutput[]>("join_trip_by_code", {
        p_code: code.trim(),
        p_display_name: displayName.trim(),
      });
      const result = Array.isArray(data) ? data[0] : data;
      if (!result?.trip_id) {
        throw new Error("Mã mời không hợp lệ hoặc chuyến đã đóng nhận thành viên.");
      }
      return result as JoinTripOutput;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: tripKeys.all });
      queryClient.invalidateQueries({ queryKey: tripKeys.detail(data.trip_id) });
    },
  });
}
