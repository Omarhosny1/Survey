
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "activity_events": {
                  Row: {
                    "created_at": string,"id": string,"message": string,"owner_id": string,"survey_id": string | null,"survey_title": string,"type": Database["public"]['Enums']["activity_type"]
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id": string,"message": string,"owner_id": string,"survey_id"?: string | null,"survey_title": string,"type": Database["public"]['Enums']["activity_type"]
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"message"?: string,"owner_id"?: string,"survey_id"?: string | null,"survey_title"?: string,"type"?: Database["public"]['Enums']["activity_type"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "activity_events_owner_id_fkey"
      columns: ["owner_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "activity_events_survey_id_fkey"
      columns: ["survey_id"]
isOneToOne: false
      referencedRelation: "surveys"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "avatar": string | null,"company": string | null,"created_at": string,"email": string,"id": string,"name": string,"preferences": NonNullable<Json>,"role": string | null,"timezone": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "avatar"?: string | null,"company"?: string | null,"created_at"?: string,"email": string,"id": string,"name": string,"preferences"?: NonNullable<Json>,"role"?: string | null,"timezone"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "avatar"?: string | null,"company"?: string | null,"created_at"?: string,"email"?: string,"id"?: string,"name"?: string,"preferences"?: NonNullable<Json>,"role"?: string | null,"timezone"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"question_options": {
                  Row: {
                    "id": string,"label": string,"position": number,"question_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "id": string,"label": string,"position": number,"question_id": string
                  }
                  Update: {
                    "id"?: string,"label"?: string,"position"?: number,"question_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "question_options_question_id_fkey"
      columns: ["question_id"]
isOneToOne: false
      referencedRelation: "questions"
      referencedColumns: ["id"]
    }
                  ]
                },"questions": {
                  Row: {
                    "description": string,"id": string,"position": number,"required": boolean,"survey_id": string,"title": string,"type": Database["public"]['Enums']["question_type"]
                  }
                  ComputedFields: never
                  Insert: {
                    "description"?: string,"id": string,"position": number,"required"?: boolean,"survey_id": string,"title": string,"type": Database["public"]['Enums']["question_type"]
                  }
                  Update: {
                    "description"?: string,"id"?: string,"position"?: number,"required"?: boolean,"survey_id"?: string,"title"?: string,"type"?: Database["public"]['Enums']["question_type"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "questions_survey_id_fkey"
      columns: ["survey_id"]
isOneToOne: false
      referencedRelation: "surveys"
      referencedColumns: ["id"]
    }
                  ]
                },"response_answers": {
                  Row: {
                    "id": number,"option_id": string | null,"question_id": string,"response_id": string,"text_value": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "id"?: number,"option_id"?: string | null,"question_id": string,"response_id": string,"text_value"?: string | null
                  }
                  Update: {
                    "id"?: number,"option_id"?: string | null,"question_id"?: string,"response_id"?: string,"text_value"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "response_answers_option_id_fkey"
      columns: ["option_id"]
isOneToOne: false
      referencedRelation: "question_options"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "response_answers_question_id_fkey"
      columns: ["question_id"]
isOneToOne: false
      referencedRelation: "questions"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "response_answers_response_id_fkey"
      columns: ["response_id"]
isOneToOne: false
      referencedRelation: "responses"
      referencedColumns: ["id"]
    }
                  ]
                },"responses": {
                  Row: {
                    "completion": number,"device": Database["public"]['Enums']["response_device"],"duration_seconds": number,"email": string | null,"id": string,"name": string | null,"submitted_at": string,"survey_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "completion"?: number,"device"?: Database["public"]['Enums']["response_device"],"duration_seconds"?: number,"email"?: string | null,"id": string,"name"?: string | null,"submitted_at"?: string,"survey_id": string
                  }
                  Update: {
                    "completion"?: number,"device"?: Database["public"]['Enums']["response_device"],"duration_seconds"?: number,"email"?: string | null,"id"?: string,"name"?: string | null,"submitted_at"?: string,"survey_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "responses_survey_id_fkey"
      columns: ["survey_id"]
isOneToOne: false
      referencedRelation: "surveys"
      referencedColumns: ["id"]
    }
                  ]
                },"surveys": {
                  Row: {
                    "accent": string,"category": string,"closed_at": string | null,"collect_email": boolean,"created_at": string,"description": string,"id": string,"owner_id": string,"published_at": string | null,"show_progress": boolean,"slug": string,"status": Database["public"]['Enums']["survey_status"],"thank_you_message": string,"thank_you_title": string,"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "accent"?: string,"category": string,"closed_at"?: string | null,"collect_email"?: boolean,"created_at"?: string,"description"?: string,"id": string,"owner_id": string,"published_at"?: string | null,"show_progress"?: boolean,"slug": string,"status"?: Database["public"]['Enums']["survey_status"],"thank_you_message"?: string,"thank_you_title"?: string,"title": string,"updated_at"?: string
                  }
                  Update: {
                    "accent"?: string,"category"?: string,"closed_at"?: string | null,"collect_email"?: boolean,"created_at"?: string,"description"?: string,"id"?: string,"owner_id"?: string,"published_at"?: string | null,"show_progress"?: boolean,"slug"?: string,"status"?: Database["public"]['Enums']["survey_status"],"thank_you_message"?: string,"thank_you_title"?: string,"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "surveys_owner_id_fkey"
      columns: ["owner_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "duplicate_survey":
{ Args: { "p_survey_id": string }; Returns: string
                           },
"get_public_survey":
{ Args: { "p_slug": string }; Returns: Json
                           },
"reorder_questions":
{ Args: { "p_question_ids": (string)[],"p_survey_id": string }; Returns: undefined
                           },
"save_survey_tree":
{ Args: { "p_survey": Json }; Returns: undefined
                           },
"submit_survey_response":
{ Args: { "p_answers": Json,"p_device": string,"p_duration_seconds": number,"p_email": string,"p_name": string,"p_slug": string }; Returns: string
                           }
          }
          Enums: {
            "activity_type": "published"|"created"|"response"|"edited"|"duplicated"|"closed"|"reopened","question_type": "multiple_choice"|"text"|"single_choice"|"long_answer","response_device": "Desktop"|"Mobile"|"Tablet","survey_status": "draft"|"published"|"closed"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "activity_type": ["published", "created", "response", "edited", "duplicated", "closed", "reopened"],"question_type": ["multiple_choice", "text", "single_choice", "long_answer"],"response_device": ["Desktop", "Mobile", "Tablet"],"survey_status": ["draft", "published", "closed"]
          }
        }
} as const
