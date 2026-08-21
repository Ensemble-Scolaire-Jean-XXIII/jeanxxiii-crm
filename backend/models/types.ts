export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at?: Date;
}

export interface Status {
  id: number;
  name: string;
  is_custom: boolean;
  created_by?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  created_at?: Date;
}

export interface Country {
  id: number;
  name: string;
}

export interface Prospect {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  gender: string;
  country_id: number;
  status_id: number;
  last_action_date: Date | null;
  created_at?: Date;
  lexpress_id?: string | null;
  formation?: string | null;
  formation_id?: number | null;
}

export interface EmailAutomationRule {
  id: number;
  formation_id: number | null;
  formation: string | null;
  email_template_id: string;
}

export interface EmailLog {
  id: string;
  prospect_id: string;
  email_template_id: string;
  sent_at: Date;
  status: string;
}

export interface Formation {
  id?: number | null;
  name: string;
  created_at?: Date | string;
}

export interface AuditLog {
  id: number;
  user_id: string;
  action: string;
  resource: string;
  details: any;
  created_at: Date;
  user_email?: string;
  user_name?: string;
}
