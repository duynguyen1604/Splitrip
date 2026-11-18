import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  client ??= createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return client;
}

export async function ensureAnonymousSession() {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Thiếu cấu hình Supabase. Hãy điền URL và anon key trong .env.local.");
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  if (session) return { supabase, userId: session.user.id };
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  if (!data.user) throw new Error("Không tạo được phiên ẩn danh.");
  return { supabase, userId: data.user.id };
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Có lỗi xảy ra. Vui lòng thử lại.";
}
