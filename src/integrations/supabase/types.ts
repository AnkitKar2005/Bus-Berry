export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      bookings: {
        Row: {
          booking_reference: string
          created_at: string | null
          id: string
          passenger_details: Json
          schedule_id: string | null
          seat_numbers: number[]
          status: Database["public"]["Enums"]["booking_status"] | null
          total_price: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          booking_reference: string
          created_at?: string | null
          id?: string
          passenger_details: Json
          schedule_id?: string | null
          seat_numbers: number[]
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_price: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          booking_reference?: string
          created_at?: string | null
          id?: string
          passenger_details?: Json
          schedule_id?: string | null
          seat_numbers?: number[]
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_price?: number
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
            foreignKeyName: "fk_bookings_schedule"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_bookings_user"
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
          arrival_time: string | null
          bus_name: string
          bus_type: Database["public"]["Enums"]["bus_type"]
          created_at: string | null
          departure_time: string | null
          fare_per_km: number | null
          features: string[] | null
          id: string
          images: string[] | null
          is_active: boolean | null
          operator_id: string | null
          registration_no: string
          seat_layout: Json | null
          total_seats: number
          updated_at: string | null
        }
        Insert: {
          amenities?: string[] | null
          arrival_time?: string | null
          bus_name?: string
          bus_type: Database["public"]["Enums"]["bus_type"]
          created_at?: string | null
          departure_time?: string | null
          fare_per_km?: number | null
          features?: string[] | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          operator_id?: string | null
          registration_no: string
          seat_layout?: Json | null
          total_seats?: number
          updated_at?: string | null
        }
        Update: {
          amenities?: string[] | null
          arrival_time?: string | null
          bus_name?: string
          bus_type?: Database["public"]["Enums"]["bus_type"]
          created_at?: string | null
          departure_time?: string | null
          fare_per_km?: number | null
          features?: string[] | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          operator_id?: string | null
          registration_no?: string
          seat_layout?: Json | null
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
          {
            foreignKeyName: "fk_buses_operator"
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
          discount_percent: number
          expiry_date: string
          id: string
          is_active: boolean | null
          max_discount: number | null
          usage_limit: number | null
          used_count: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          discount_percent: number
          expiry_date: string
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          usage_limit?: number | null
          used_count?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          discount_percent?: number
          expiry_date?: string
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          usage_limit?: number | null
          used_count?: number | null
        }
        Relationships: []
      }
      operator_earnings: {
        Row: {
          amount: number
          booking_id: string | null
          created_at: string | null
          id: string
          operator_id: string
          status: string | null
          withdrawn_at: string | null
        }
        Insert: {
          amount: number
          booking_id?: string | null
          created_at?: string | null
          id?: string
          operator_id: string
          status?: string | null
          withdrawn_at?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string | null
          created_at?: string | null
          id?: string
          operator_id?: string
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
        ]
      }
      payments: {
        Row: {
          amount: number
          booking_id: string | null
          created_at: string | null
          id: string
          method: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          transaction_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          booking_id?: string | null
          created_at?: string | null
          id?: string
          method?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string | null
          created_at?: string | null
          id?: string
          method?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_payments_booking"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
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
          id: string
          is_approved: boolean | null
          name: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          is_approved?: boolean | null
          name: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      route_stops: {
        Row: {
          arrival_time: string | null
          created_at: string | null
          departure_time: string | null
          fare_from_origin: number | null
          id: string
          route_id: string | null
          stop_name: string
          stop_order: number
        }
        Insert: {
          arrival_time?: string | null
          created_at?: string | null
          departure_time?: string | null
          fare_from_origin?: number | null
          id?: string
          route_id?: string | null
          stop_name: string
          stop_order: number
        }
        Update: {
          arrival_time?: string | null
          created_at?: string | null
          departure_time?: string | null
          fare_from_origin?: number | null
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
          distance: number | null
          id: string
          source: string
        }
        Insert: {
          created_at?: string | null
          destination: string
          distance?: number | null
          id?: string
          source: string
        }
        Update: {
          created_at?: string | null
          destination?: string
          distance?: number | null
          id?: string
          source?: string
        }
        Relationships: []
      }
      schedules: {
        Row: {
          arrival_time: string
          available_seats: number
          base_price: number
          bus_id: string | null
          created_at: string | null
          departure_date: string
          departure_time: string
          id: string
          is_active: boolean | null
          route_id: string | null
          updated_at: string | null
        }
        Insert: {
          arrival_time: string
          available_seats: number
          base_price: number
          bus_id?: string | null
          created_at?: string | null
          departure_date: string
          departure_time: string
          id?: string
          is_active?: boolean | null
          route_id?: string | null
          updated_at?: string | null
        }
        Update: {
          arrival_time?: string
          available_seats?: number
          base_price?: number
          bus_id?: string | null
          created_at?: string | null
          departure_date?: string
          departure_time?: string
          id?: string
          is_active?: boolean | null
          route_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_schedules_bus"
            columns: ["bus_id"]
            isOneToOne: false
            referencedRelation: "buses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_schedules_route"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_booking_reference: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      booking_status: ["pending", "confirmed", "cancelled", "completed"],
      bus_type: ["ac", "non_ac", "sleeper", "semi_sleeper", "luxury"],
      payment_status: ["pending", "completed", "failed", "refunded"],
      user_role: ["passenger", "operator", "admin"],
    },
  },
} as const
