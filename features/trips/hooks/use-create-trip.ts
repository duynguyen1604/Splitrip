"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { callRpc, ensureAuthenticatedUser } from "@/lib/api-client";
import { tripKeys } from "@/lib/query-client";

type CreateTripInput = {
  name: string;
  displayName: string;
};

type CreateTripOutput = {
  trip_id: string;
  member_id: string;
  invite_code: string;
};

export function useCreateTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, displayName }: CreateTripInput): Promise<CreateTripOutput> => {
      await ensureAuthenticatedUser();
      const data = await callRpc<CreateTripOutput[]>("create_trip", {
        p_name: name.trim(),
        p_display_name: displayName.trim(),
      });
      const result = Array.isArray(data) ? data[0] : data;
      if (!result?.trip_id) {
        throw new Error("Không nhận được dữ liệu chuyến vừa tạo.");
      }
      return result as CreateTripOutput;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripKeys.all });
    },
  });
}
