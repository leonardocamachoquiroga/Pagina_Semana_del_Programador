export interface Database {
  public: {
    Tables: {
      teams: {
        Row: {
          id: string;
          name: string;
          members: string[];
          active: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          members?: string[];
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          members?: string[];
          active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
