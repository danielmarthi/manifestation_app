// Hand-written types for the Supabase schema.
// Regenerate with the CLI when convenient: `supabase gen types typescript --project-id <ref>`
//
// IMPORTANT: Row/Insert/Update types are defined inline inside `Database` so that
// TypeScript's conditional-type `extends` checks (used internally by supabase-js)
// correctly resolve each table's schema. Named helpers are then extracted below.

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          // Stage 1 fields
          first_name: string | null;
          full_name: string | null;
          age: number | null;
          occupation: string | null;
          relationship_status: string | null;
          about_text: string | null;
          personal_context: Record<string, unknown> | null;
          coach_style: string;
          // Stage 2 fields
          selected_areas: string[] | null;
          // Stage 3 fields
          onboarding_answers: Record<string, unknown>[] | null;
          // Generated profile fields (new v2)
          old_self_portrait: string | null;
          old_self_tags: string[];
          future_self_portrait: string | null;
          future_self_tags: string[];
          releasing: string[];
          coaching_notes: string | null;
          // Generated profile fields (legacy / still used)
          desire_area: string | null;
          desire_statement: string | null;
          primary_block: string | null;
          block_type: string | null;
          assumption: string | null;
          gap_statement: string | null;
          future_self_name: string | null;
          old_self_name: string | null;
          // Legacy body arrays (kept for backward compat)
          future_self_body: string[];
          future_self_traits: string[];
          old_self_body: string[];
          // Progress tracking
          current_phase: number;
          streak: number;
          last_practice_date: string | null;
          onboarding_completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          first_name?: string | null;
          full_name?: string | null;
          age?: number | null;
          occupation?: string | null;
          relationship_status?: string | null;
          about_text?: string | null;
          personal_context?: Record<string, unknown> | null;
          coach_style?: string;
          selected_areas?: string[] | null;
          onboarding_answers?: Record<string, unknown>[] | null;
          old_self_portrait?: string | null;
          old_self_tags?: string[];
          future_self_portrait?: string | null;
          future_self_tags?: string[];
          releasing?: string[];
          coaching_notes?: string | null;
          desire_area?: string | null;
          desire_statement?: string | null;
          primary_block?: string | null;
          block_type?: string | null;
          assumption?: string | null;
          gap_statement?: string | null;
          future_self_name?: string | null;
          old_self_name?: string | null;
          future_self_body?: string[];
          future_self_traits?: string[];
          old_self_body?: string[];
          current_phase?: number;
          streak?: number;
          last_practice_date?: string | null;
          onboarding_completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string | null;
          full_name?: string | null;
          age?: number | null;
          occupation?: string | null;
          relationship_status?: string | null;
          about_text?: string | null;
          personal_context?: Record<string, unknown> | null;
          coach_style?: string;
          selected_areas?: string[] | null;
          onboarding_answers?: Record<string, unknown>[] | null;
          old_self_portrait?: string | null;
          old_self_tags?: string[];
          future_self_portrait?: string | null;
          future_self_tags?: string[];
          releasing?: string[];
          coaching_notes?: string | null;
          desire_area?: string | null;
          desire_statement?: string | null;
          primary_block?: string | null;
          block_type?: string | null;
          assumption?: string | null;
          gap_statement?: string | null;
          future_self_name?: string | null;
          old_self_name?: string | null;
          future_self_body?: string[];
          future_self_traits?: string[];
          old_self_body?: string[];
          current_phase?: number;
          streak?: number;
          last_practice_date?: string | null;
          onboarding_completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      beliefs: {
        Row: {
          id: string;
          user_id: string;
          text: string;
          type: "inherited" | "self-created" | "fear-based" | "identity-based";
          area: string | null;
          dissolved: boolean;
          dissolved_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          text: string;
          type: "inherited" | "self-created" | "fear-based" | "identity-based";
          area?: string | null;
          dissolved?: boolean;
          dissolved_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          text?: string;
          type?: "inherited" | "self-created" | "fear-based" | "identity-based";
          area?: string | null;
          dissolved?: boolean;
          dissolved_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      identity_statements: {
        Row: {
          id: string;
          user_id: string;
          text: string;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          text: string;
          position?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          text?: string;
          position?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      evidence_entries: {
        Row: {
          id: string;
          user_id: string;
          kind: "win" | "synchronicity" | "receiving" | "resistance";
          text: string;
          occurred_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          kind: "win" | "synchronicity" | "receiving" | "resistance";
          text: string;
          occurred_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          kind?: "win" | "synchronicity" | "receiving" | "resistance";
          text?: string;
          occurred_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      coach_messages: {
        Row: {
          id: string;
          user_id: string;
          conversation_id: string;
          role: "user" | "assistant";
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          conversation_id: string;
          role: "user" | "assistant";
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          conversation_id?: string;
          role?: "user" | "assistant";
          content?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      practice_log: {
        Row: {
          id: string;
          user_id: string;
          practice_date: string;
          steps_completed: Record<string, boolean>;
          gratitude: string | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          practice_date: string;
          steps_completed?: Record<string, boolean>;
          gratitude?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          practice_date?: string;
          steps_completed?: Record<string, boolean>;
          gratitude?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      sos_logs: {
        Row: {
          id: string;
          user_id: string;
          feeling: string | null;
          reframed: boolean;
          returned: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          feeling?: string | null;
          reframed?: boolean;
          returned?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          feeling?: string | null;
          reframed?: boolean;
          returned?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      belief_type: "inherited" | "self-created" | "fear-based" | "identity-based";
      evidence_kind: "win" | "synchronicity" | "receiving" | "resistance";
      coach_role: "user" | "assistant";
    };
  };
};

// Convenience type aliases extracted from the Database schema
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type BeliefRow = Database["public"]["Tables"]["beliefs"]["Row"];
export type IdentityStatementRow = Database["public"]["Tables"]["identity_statements"]["Row"];
export type EvidenceEntryRow = Database["public"]["Tables"]["evidence_entries"]["Row"];
export type CoachMessageRow = Database["public"]["Tables"]["coach_messages"]["Row"];
export type PracticeLogRow = Database["public"]["Tables"]["practice_log"]["Row"];
export type SosLogRow = Database["public"]["Tables"]["sos_logs"]["Row"];

// Enum types
export type BeliefType = Database["public"]["Enums"]["belief_type"];
export type EvidenceKind = Database["public"]["Enums"]["evidence_kind"];
export type CoachRole = Database["public"]["Enums"]["coach_role"];
