import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

// Re-export database types for convenience
export type Profile = Tables<"profiles">;
export type Student = Tables<"students">;
export type Payment = Tables<"payments">;
export type Message = Tables<"messages">;

export type StudentInsert = TablesInsert<"students">;
export type StudentUpdate = TablesUpdate<"students">;
export type PaymentInsert = TablesInsert<"payments">;
export type PaymentUpdate = TablesUpdate<"payments">;
export type ProfileUpdate = TablesUpdate<"profiles">;
export type MessageInsert = TablesInsert<"messages">;

export interface DashboardStats {
  totalStudents: number;
  totalCollected: number;
  totalPending: number;
}
