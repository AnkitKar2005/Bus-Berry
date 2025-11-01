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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          booking_reference: string
          cancelled_at: string | null
          created_at: string | null
          id: string
          passenger_email: string
          passenger_name: string
          passenger_phone: string
          payment_verified: boolean | null
          qr_code_data: string | null
          schedule_id: string | null
          seat_numbers: number[]
          status: Database["public"]["Enums"]["booking_status"] | null
          total_fare: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          booking_reference: string
          cancelled_at?: string | null
          created_at?: string | null
          id?: string
          passenger_email: string
          passenger_name: string
          passenger_phone: string
          payment_verified?: boolean | null
          qr_code_data?: string | null
          schedule_id?: string | null
          seat_numbers: number[]
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_fare: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          booking_reference?: string
          cancelled_at?: string | null
          created_at?: string | null
          id?: string
          passenger_email?: string
          passenger_name?: string
          passenger_phone?: string
          payment_verified?: boolean | null
          qr_code_data?: string | null
          schedule_id?: string | null
          seat_numbers?: number[]
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_fare?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      buses: {
        Row: {
          amenities: string[] | null
          approval_status: string | null
          arrival_time: string
          bus_name: string
          bus_type: Database["public"]["Enums"]["bus_type"]
          created_at: string | null
          departure_time: string
          fare_per_km: number
          features: string[] | null
          id: string
          images: string[] | null
          is_active: boolean | null
          operator_id: string | null
          registration_no: string
          total_seats: number
          updated_at: string | null
        }
        Insert: {
          amenities?: string[] | null
          approval_status?: string | null
          arrival_time: string
          bus_name: string
          bus_type: Database["public"]["Enums"]["bus_type"]
          created_at?: string | null
          departure_time: string
          fare_per_km: number
          features?: string[] | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          operator_id?: string | null
          registration_no: string
          total_seats: number
          updated_at?: string | null
        }
        Update: {
          amenities?: string[] | null
          approval_status?: string | null
          arrival_time?: string
          bus_name?: string
          bus_type?: Database["public"]["Enums"]["bus_type"]
          created_at?: string | null
          departure_time?: string
          fare_per_km?: number
          features?: string[] | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          operator_id?: string | null
          registration_no?: string
          total_seats?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "buses_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          max_discount: number | null
          min_fare: number | null
          usage_limit: number | null
          used_count: number | null
          valid_from: string
          valid_until: string
        }
        Insert: {
          code: string
          created_at?: string | null
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          min_fare?: number | null
          usage_limit?: number | null
          used_count?: number | null
          valid_from: string
          valid_until: string
        }
        Update: {
          code?: string
          created_at?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          min_fare?: number | null
          usage_limit?: number | null
          used_count?: number | null
          valid_from?: string
          valid_until?: string
        }
        Relationships: []
      }
      operator_earnings: {
        Row: {
          amount: number
          booking_id: string | null
          commission: number
          created_at: string | null
          id: string
          net_amount: number
          operator_id: string | null
          status: string | null
          withdrawn_at: string | null
        }
        Insert: {
          amount: number
          booking_id?: string | null
          commission: number
          created_at?: string | null
          id?: string
          net_amount: number
          operator_id?: string | null
          status?: string | null
          withdrawn_at?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string | null
          commission?: number
          created_at?: string | null
          id?: string
          net_amount?: number
          operator_id?: string | null
          status?: string | null
          withdrawn_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "operator_earnings_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operator_earnings_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          booking_id: string | null
          created_at: string | null
          id: string
          payment_method: string
          status: Database["public"]["Enums"]["payment_status"] | null
          transaction_id: string | null
        }
        Insert: {
          amount: number
          booking_id?: string | null
          created_at?: string | null
          id?: string
          payment_method: string
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string | null
          created_at?: string | null
          id?: string
          payment_method?: string
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          last_active: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          last_active?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          last_active?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      route_stops: {
        Row: {
          arrival_time: string
          created_at: string | null
          departure_time: string
          fare_from_origin: number
          id: string
          route_id: string | null
          stop_name: string
          stop_order: number
        }
        Insert: {
          arrival_time: string
          created_at?: string | null
          departure_time: string
          fare_from_origin: number
          id?: string
          route_id?: string | null
          stop_name: string
          stop_order: number
        }
        Update: {
          arrival_time?: string
          created_at?: string | null
          departure_time?: string
          fare_from_origin?: number
          id?: string
          route_id?: string | null
          stop_name?: string
          stop_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "route_stops_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      routes: {
        Row: {
          created_at: string | null
          destination: string
          distance: number
          duration: string | null
          id: string
          source: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          destination: string
          distance: number
          duration?: string | null
          id?: string
          source: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          destination?: string
          distance?: number
          duration?: string | null
          id?: string
          source?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      schedules: {
        Row: {
          available_seats: number
          bus_id: string | null
          created_at: string | null
          departure_date: string
          id: string
          route_id: string | null
          updated_at: string | null
        }
        Insert: {
          available_seats: number
          bus_id?: string | null
          created_at?: string | null
          departure_date: string
          id?: string
          route_id?: string | null
          updated_at?: string | null
        }
        Update: {
          available_seats?: number
          bus_id?: string | null
          created_at?: string | null
          departure_date?: string
          id?: string
          route_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedules_bus_id_fkey"
            columns: ["bus_id"]
            isOneToOne: false
            referencedRelation: "buses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      can_cancel_booking: { Args: { booking_id: string }; Returns: boolean }
      generate_booking_reference: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      setup_admin_user: {
        Args: { admin_email: string; admin_password: string }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "operator" | "passenger"
      booking_status: "pending" | "confirmed" | "cancelled" | "completed"
      bus_type: "ac" | "non_ac" | "sleeper" | "semi_sleeper" | "luxury"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      user_role: "passenger" | "operator" | "admin"
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
      app_role: ["admin", "operator", "passenger"],
      booking_status: ["pending", "confirmed", "cancelled", "completed"],
      bus_type: ["ac", "non_ac", "sleeper", "semi_sleeper", "luxury"],
      payment_status: ["pending", "completed", "failed", "refunded"],
      user_role: ["passenger", "operator", "admin"],
    },
  },
} as const
