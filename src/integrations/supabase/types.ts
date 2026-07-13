export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_status: {
        Row: {
          created_at: string
          is_active: boolean
          is_primary: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          is_active?: boolean
          is_primary?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          is_active?: boolean
          is_primary?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount: number | null
          created_at: string
          description: string
          donor_email: string
          donor_id: string | null
          donor_name: string
          donor_phone: string | null
          id: string
          location: string
          status: Database["public"]["Enums"]["donation_status"]
          type: string
          updated_at: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          description: string
          donor_email: string
          donor_id?: string | null
          donor_name: string
          donor_phone?: string | null
          id?: string
          location: string
          status?: Database["public"]["Enums"]["donation_status"]
          type: string
          updated_at?: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          description?: string
          donor_email?: string
          donor_id?: string | null
          donor_name?: string
          donor_phone?: string | null
          id?: string
          location?: string
          status?: Database["public"]["Enums"]["donation_status"]
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          created_at: string
          donation_id: string | null
          id: string
          ngo_id: string | null
          notes: string | null
          request_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          donation_id?: string | null
          id?: string
          ngo_id?: string | null
          notes?: string | null
          request_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          donation_id?: string | null
          id?: string
          ngo_id?: string | null
          notes?: string | null
          request_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_donation_id_fkey"
            columns: ["donation_id"]
            isOneToOne: false
            referencedRelation: "donations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_ngo_id_fkey"
            columns: ["ngo_id"]
            isOneToOne: false
            referencedRelation: "ngos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "support_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          created_at: string
          from_email: string
          from_name: string
          from_user: string | null
          id: string
          read: boolean
          subject: string
        }
        Insert: {
          body: string
          created_at?: string
          from_email: string
          from_name: string
          from_user?: string | null
          id?: string
          read?: boolean
          subject: string
        }
        Update: {
          body?: string
          created_at?: string
          from_email?: string
          from_name?: string
          from_user?: string | null
          id?: string
          read?: boolean
          subject?: string
        }
        Relationships: []
      }
      ngos: {
        Row: {
          address: string
          city: string
          contact_person: string
          created_at: string
          description: string
          documents: Json
          email: string
          id: string
          org_name: string
          phone: string
          province: string
          reg_number: string | null
          rejection_reason: string | null
          status: Database["public"]["Enums"]["ngo_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address: string
          city: string
          contact_person: string
          created_at?: string
          description: string
          documents?: Json
          email: string
          id?: string
          org_name: string
          phone: string
          province: string
          reg_number?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["ngo_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string
          city?: string
          contact_person?: string
          created_at?: string
          description?: string
          documents?: Json
          email?: string
          id?: string
          org_name?: string
          phone?: string
          province?: string
          reg_number?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["ngo_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      support_requests: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          location: string
          requester_email: string
          requester_id: string | null
          requester_name: string
          requester_phone: string | null
          status: Database["public"]["Enums"]["request_status"]
          title: string
          updated_at: string
          urgency: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          location: string
          requester_email: string
          requester_id?: string | null
          requester_name: string
          requester_phone?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          title: string
          updated_at?: string
          urgency?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          location?: string
          requester_email?: string
          requester_id?: string | null
          requester_name?: string
          requester_phone?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          title?: string
          updated_at?: string
          urgency?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          author_name: string
          author_role: string | null
          created_at: string
          hidden: boolean
          id: string
          image_url: string | null
          published: boolean
          quote: string
          updated_at: string
        }
        Insert: {
          author_name: string
          author_role?: string | null
          created_at?: string
          hidden?: boolean
          id?: string
          image_url?: string | null
          published?: boolean
          quote: string
          updated_at?: string
        }
        Update: {
          author_name?: string
          author_role?: string | null
          created_at?: string
          hidden?: boolean
          id?: string
          image_url?: string | null
          published?: boolean
          quote?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_active_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "ngo" | "donor" | "community" | "volunteer"
      donation_status:
        | "pending"
        | "approved"
        | "rejected"
        | "matched"
        | "completed"
      ngo_status: "pending" | "approved" | "rejected"
      request_status:
        | "pending"
        | "approved"
        | "rejected"
        | "matched"
        | "completed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "ngo", "donor", "community", "volunteer"],
      donation_status: [
        "pending",
        "approved",
        "rejected",
        "matched",
        "completed",
      ],
      ngo_status: ["pending", "approved", "rejected"],
      request_status: [
        "pending",
        "approved",
        "rejected",
        "matched",
        "completed",
      ],
    },
  },
} as const
