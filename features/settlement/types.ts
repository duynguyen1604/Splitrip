export type SettlementStatus = "marked_paid" | "confirmed";

export type Settlement = {
  id: string;
  trip_id: string;
  from_member: string;
  to_member: string;
  amount: number;
  status: SettlementStatus;
  marked_at: string;
  confirmed_at: string | null;
  created_by: string;
};

export type BankAccount = {
  member_id: string;
  bank_bin: string;
  account_number: string;
  account_name: string;
};
