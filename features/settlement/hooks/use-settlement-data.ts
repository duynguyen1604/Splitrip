"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest, callRpc, ensureAuthenticatedUser } from "@/lib/api-client";
import { tripKeys } from "@/lib/query-client";
import type { BankAccount, Settlement } from "../types";

export function useSettlements(tripId: string) {
  return useQuery({
    queryKey: tripKeys.settlements(tripId),
    queryFn: async (): Promise<Settlement[]> => {
      await ensureAuthenticatedUser();
      return apiRequest<Settlement[]>(`/api/trips/${tripId}/settlements`);
    },
    enabled: !!tripId,
  });
}

export function useMemberBankAccount(memberId: string) {
  return useQuery({
    queryKey: ["bank-account", memberId],
    queryFn: async (): Promise<BankAccount | null> => {
      await ensureAuthenticatedUser();
      return apiRequest<BankAccount | null>(
        `/api/members/${memberId}/bank-account`
      );
    },
    enabled: !!memberId,
  });
}

export function usePaymentTarget(tripId: string, toMemberId: string) {
  return useQuery({
    queryKey: ["payment-target", tripId, toMemberId],
    queryFn: async (): Promise<BankAccount | null> => {
      await ensureAuthenticatedUser();
      const target = await apiRequest<Omit<BankAccount, "member_id"> | null>(
        `/api/trips/${tripId}/payment-target?toMember=${encodeURIComponent(toMemberId)}`
      );
      return target ? { ...target, member_id: toMemberId } : null;
    },
    enabled: !!tripId && !!toMemberId,
  });
}

export function useSaveBankAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      memberId,
      bankBin,
      accountNumber,
      accountName,
    }: {
      memberId: string;
      bankBin: string;
      accountNumber: string;
      accountName: string;
    }) => {
      await ensureAuthenticatedUser();
      return callRpc<boolean>("save_bank_account", {
        p_member_id: memberId,
        p_bank_bin: bankBin.trim(),
        p_account_number: accountNumber.trim(),
        p_account_name: accountName.trim().toUpperCase(),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["bank-account", variables.memberId],
      });
      queryClient.invalidateQueries({ queryKey: ["payment-target"] });
    },
  });
}

export function useMarkPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tripId, toMember, amount }: {
      tripId: string;
      toMember: string;
      amount: number;
    }) => {
      await ensureAuthenticatedUser();
      return callRpc<string>("mark_paid", {
        p_trip_id: tripId,
        p_to_member: toMember,
        p_amount: amount,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: tripKeys.settlements(variables.tripId),
      });
      queryClient.invalidateQueries({
        queryKey: tripKeys.detail(variables.tripId),
      });
    },
  });
}

export function useConfirmPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ settlementId }: {
      tripId: string;
      settlementId: string;
    }) => {
      await ensureAuthenticatedUser();
      return callRpc<boolean>("confirm_payment", {
        p_settlement_id: settlementId,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: tripKeys.settlements(variables.tripId),
      });
      queryClient.invalidateQueries({
        queryKey: tripKeys.detail(variables.tripId),
      });
    },
  });
}

export function useDeleteSettlement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ settlementId }: {
      tripId: string;
      settlementId: string;
    }) => {
      await ensureAuthenticatedUser();
      return callRpc<boolean>("delete_settlement", {
        p_settlement_id: settlementId,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: tripKeys.settlements(variables.tripId),
      });
      queryClient.invalidateQueries({
        queryKey: tripKeys.detail(variables.tripId),
      });
    },
  });
}

export function useToggleTripLock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tripId, lock }: { tripId: string; lock: boolean }) => {
      await ensureAuthenticatedUser();
      return callRpc<boolean>(lock ? "lock_trip" : "unlock_trip", {
        p_trip_id: tripId,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: tripKeys.detail(variables.tripId),
      });
    },
  });
}
