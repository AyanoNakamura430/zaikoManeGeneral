// GENERATED FILE - DO NOT EDIT. Regenerate with npm run update:database-types.
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      application_accounts: {
        Row: {
          created_at: string;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          status: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      attribute_definitions: {
        Row: {
          created_at: string;
          display_name: string;
          is_active: boolean;
          key: string;
          searchable: boolean;
          sort_order: number;
          template_key: string;
          updated_at: string;
          value_type: string;
        };
        Insert: {
          created_at?: string;
          display_name: string;
          is_active?: boolean;
          key: string;
          searchable: boolean;
          sort_order: number;
          template_key: string;
          updated_at?: string;
          value_type: string;
        };
        Update: {
          created_at?: string;
          display_name?: string;
          is_active?: boolean;
          key?: string;
          searchable?: boolean;
          sort_order?: number;
          template_key?: string;
          updated_at?: string;
          value_type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "attribute_definitions_template_key_fkey";
            columns: ["template_key"];
            isOneToOne: false;
            referencedRelation: "category_templates";
            referencedColumns: ["key"];
          },
        ];
      };
      categories: {
        Row: {
          color_key: string | null;
          created_at: string;
          id: string;
          name: string;
          name_key: string;
          sort_order: number;
          template_key: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          color_key?: string | null;
          created_at?: string;
          id?: string;
          name: string;
          name_key: string;
          sort_order: number;
          template_key?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          color_key?: string | null;
          created_at?: string;
          id?: string;
          name?: string;
          name_key?: string;
          sort_order?: number;
          template_key?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "categories_template_key_fkey";
            columns: ["template_key"];
            isOneToOne: false;
            referencedRelation: "category_templates";
            referencedColumns: ["key"];
          },
        ];
      };
      category_templates: {
        Row: {
          created_at: string;
          default_sort_order: number;
          display_name: string;
          is_active: boolean;
          key: string;
          preset_color_key: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          default_sort_order: number;
          display_name: string;
          is_active?: boolean;
          key: string;
          preset_color_key?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          default_sort_order?: number;
          display_name?: string;
          is_active?: boolean;
          key?: string;
          preset_color_key?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      items: {
        Row: {
          attributes: Json;
          brand: string | null;
          category_id: string | null;
          color: string | null;
          created_at: string;
          id: string;
          image_path: string | null;
          item_name: string;
          low_stock_threshold: number | null;
          model_code: string | null;
          notes: string | null;
          purchase_date: string | null;
          quantity: number;
          unit: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          attributes?: Json;
          brand?: string | null;
          category_id?: string | null;
          color?: string | null;
          created_at?: string;
          id?: string;
          image_path?: string | null;
          item_name: string;
          low_stock_threshold?: number | null;
          model_code?: string | null;
          notes?: string | null;
          purchase_date?: string | null;
          quantity?: number;
          unit?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          attributes?: Json;
          brand?: string | null;
          category_id?: string | null;
          color?: string | null;
          created_at?: string;
          id?: string;
          image_path?: string | null;
          item_name?: string;
          low_stock_threshold?: number | null;
          model_code?: string | null;
          notes?: string | null;
          purchase_date?: string | null;
          quantity?: number;
          unit?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "items_category_id_user_id_fkey";
            columns: ["category_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
