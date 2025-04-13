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
      access_logs: {
        Row: {
          access_point: string | null
          created_at: string | null
          id: number
          rfid_tag: string | null
          status: string | null
          user_name: string
        }
        Insert: {
          access_point?: string | null
          created_at?: string | null
          id?: number
          rfid_tag?: string | null
          status?: string | null
          user_name: string
        }
        Update: {
          access_point?: string | null
          created_at?: string | null
          id?: number
          rfid_tag?: string | null
          status?: string | null
          user_name?: string
        }
        Relationships: []
      }
      admin_requests: {
        Row: {
          created_at: string
          id: string
          reason: string
          reviewed_at: string | null
          reviewer_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          role?: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string | null
          description: string | null
          duration: number | null
          event_type: string | null
          id: number
          resolved_at: string | null
          security_sensors: number | null
          sensor_id: number | null
          severity: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration?: number | null
          event_type?: string | null
          id?: number
          resolved_at?: string | null
          security_sensors?: number | null
          sensor_id?: number | null
          severity?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration?: number | null
          event_type?: string | null
          id?: number
          resolved_at?: string | null
          security_sensors?: number | null
          sensor_id?: number | null
          severity?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "security_events_security_sensors_fkey"
            columns: ["security_sensors"]
            isOneToOne: false
            referencedRelation: "security_sensors"
            referencedColumns: ["id"]
          },
        ]
      }
      security_sensors: {
        Row: {
          id: number
          location: string | null
          name: string | null
          type: string | null
        }
        Insert: {
          id?: number
          location?: string | null
          name?: string | null
          type?: string | null
        }
        Update: {
          id?: number
          location?: string | null
          name?: string | null
          type?: string | null
        }
        Relationships: []
      }
      system_status: {
        Row: {
          average_temperature: number | null
          created_at: string
          id: number
          network_status: string | null
          security_status: string | null
          system_health: number | null
          temperature_status: string | null
        }
        Insert: {
          average_temperature?: number | null
          created_at?: string
          id?: number
          network_status?: string | null
          security_status?: string | null
          system_health?: number | null
          temperature_status?: string | null
        }
        Update: {
          average_temperature?: number | null
          created_at?: string
          id?: number
          network_status?: string | null
          security_status?: string | null
          system_health?: number | null
          temperature_status?: string | null
        }
        Relationships: []
      }
      temperature_predictions: {
        Row: {
          id: number
          last_timestamp: string | null
          predictions: Json | null
        }
        Insert: {
          id?: number
          last_timestamp?: string | null
          predictions?: Json | null
        }
        Update: {
          id?: number
          last_timestamp?: string | null
          predictions?: Json | null
        }
        Relationships: []
      }
      temperature_readings: {
        Row: {
          created_at: string
          days_to_failure: number | null
          fan_status: string | null
          humidity: number | null
          id: number
          sensor_id: number
          temperature: number | null
          temperature_sensors: number | null
          updated_at: string | null
          voltage: number | null
          warning_status: boolean | null
        }
        Insert: {
          created_at?: string
          days_to_failure?: number | null
          fan_status?: string | null
          humidity?: number | null
          id?: number
          sensor_id: number
          temperature?: number | null
          temperature_sensors?: number | null
          updated_at?: string | null
          voltage?: number | null
          warning_status?: boolean | null
        }
        Update: {
          created_at?: string
          days_to_failure?: number | null
          fan_status?: string | null
          humidity?: number | null
          id?: number
          sensor_id?: number
          temperature?: number | null
          temperature_sensors?: number | null
          updated_at?: string | null
          voltage?: number | null
          warning_status?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "temperature_readings_temperature_sensors_fkey"
            columns: ["temperature_sensors"]
            isOneToOne: false
            referencedRelation: "temperature_sensors"
            referencedColumns: ["id"]
          },
        ]
      }
      temperature_sensors: {
        Row: {
          id: number
          location: string | null
          name: string | null
        }
        Insert: {
          id?: number
          location?: string | null
          name?: string | null
        }
        Update: {
          id?: number
          location?: string | null
          name?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
