"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ensureAnonymousSession, getErrorMessage } from "@/lib/supabase";
import { tripKeys } from "@/lib/query-client";
import type { Settlement, BankAccount } from "../types";

export function useSettlements(tripId: string) {
  return useQuery({
    queryKey: tripKeys.settlements(tripId),
    queryFn: async (): Promise<Settlement[]> => {
      const { supabase } = await ensureAnonymousSession();
      const { data, error } = await supabase
        .from("settlements")
        .select("id, trip_id, from_member, to_member, amount, status, marked_at, confirmed_at, created_by")
        .eq("trip_id", tripId)
        .is("deleted_at", null)
        .order("marked_at", { ascending: false });

      if (error) throw new Error(getErrorMessage(error));
      return (data ?? []) as Settlement[];
    },
    enabled: !!tripId,
  });
}

export function useMemberBankAccount(memberId: string) {
  return useQuery({
    queryKey: ["bank-account", memberId],
    queryFn: async (): Promise<BankAccount | null> => {
      const { supabase } = await ensureAnonymousSession();
      const { data, error } = await supabase
        .from("member_bank_accounts")
        .select("member_id, bank_bin, account_number, account_name")
        .eq("member_id", memberId)
        .maybeSingle();

      if (error) return null;
      return data as BankAccount | null;
    },
    enabled: !!memberId,
  });
}

export function usePaymentTarget(tripId: string, toMemberId: string) {
  return useQuery({
    queryKey: ["payment-target", tripId, toMemberId],
    queryFn: async (): Promise<BankAccount | null> => {
      const { supabase } = await ensureAnonymousSession();
      const { data, error } = await supabase.rpc("get_payment_target", {
        p_trip_id: tripId,
        p_to_member: toMemberId,
      });

      if (error) return null;
      const res = Array.isArray(data) ? data[0] : data;
      if (!res?.bank_bin) return null;

      return {
        member_id: toMemberId,
        bank_bin: res.bank_bin,
        account_number: res.account_number,
        account_name: res.account_name,
      };
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
      const { supabase } = await ensureAnonymousSession();
      const { data, error } = await supabase.rpc("save_bank_account", {
        p_member_id: memberId,
        p_bank_bin: bankBin.trim(),
        p_account_number: accountNumber.trim(),
        p_account_name: accountName.trim().toUpperCase(),
      });

      if (error) throw new Error(getErrorMessage(error));
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bank-account", variables.memberId] });
      queryClient.invalidateQueries({ queryKey: ["payment-target"] });
    },
  });
}

export function useMarkPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tripId,
      toMember,
      amount,
    }: {
      tripId: string;
      toMember: string;
      amount: number;
    }) => {
      const { supabase } = await ensureAnonymousSession();
      const { data, error } = await supabase.rpc("mark_paid", {
        p_trip_id: tripId,
        p_to_member: toMember,
        p_amount: amount,
      });

      if (error) throw new Error(getErrorMessage(error));
      return data as string;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tripKeys.settlements(variables.tripId) });
      queryClient.invalidateQueries({ queryKey: tripKeys.detail(variables.tripId) });
    },
  });
}

export function useConfirmPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tripId,
      settlementId,
    }: {
      tripId: string;
      settlementId: string;
    }) => {
      const { supabase } = await ensureAnonymousSession();
      const { data, error } = await supabase.rpc("confirm_payment", {
        p_settlement_id: settlementId,
      });

      if (error) throw new Error(getErrorMessage(error));
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tripKeys.settlements(variables.tripId) });
      queryClient.invalidateQueries({ queryKey: tripKeys.detail(variables.tripId) });
    },
  });
}

export function useDeleteSettlement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tripId,
      settlementId,
    }: {
      tripId: string;
      settlementId: string;
    }) => {
      const { supabase } = await ensureAnonymousSession();
      const { data, error } = await supabase.rpc("delete_settlement", {
        p_settlement_id: settlementId,
      });

      if (error) throw new Error(getErrorMessage(error));
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tripKeys.settlements(variables.tripId) });
      queryClient.invalidateQueries({ queryKey: tripKeys.detail(variables.tripId) });
    },
  });
}

export function useToggleTripLock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tripId,
      lock,
    }: {
      tripId: string;
      lock: boolean;
    }) => {
      const { supabase } = await ensureAnonymousSession();
      const rpcName = lock ? "lock_trip" : "unlock_trip";
      const { data, error } = await supabase.rpc(rpcName, {
        p_trip_id: tripId,
      });

      if (error) throw new Error(getErrorMessage(error));
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tripKeys.detail(variables.tripId) });
    },
  });
}
