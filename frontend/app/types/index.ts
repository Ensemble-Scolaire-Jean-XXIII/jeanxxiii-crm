// ==========================================
// ENTITÉS DE BASE ET MODELES DE DONNÉES
// ==========================================

export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at?: string;
}

export interface Status {
  id: number;
  name: string;
  is_custom: boolean;
  created_by?: string;
}

export interface Prospect {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  gender: string;
  country_id: number | null;
  status_id: number | null;
  formation_id: number | null;
  last_action_date: string | null;
  created_at?: string;
  lexpress_id?: string | null;
  situation?: string | null;
  niveau?: string | null;
  formation?: string | null;
  campus?: string | null;
  code_postal?: string | null;
  commentaire?: string | null;
}

export interface ProspectExtended extends Prospect {
  status_name?: string;
  country_name?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  created_at?: string;
}

export interface Country {
  id: number;
  name: string;
}

export interface EmailAutomationRule {
  id: number;
  status_id: number | null;
  formation_id: number | null;
  email_template_id: string;
  trigger_type: string;
  scheduled_date: string | null;
}

export interface EmailLog {
  id: string;
  prospect_id: string;
  email_template_id: string;
  sent_at: Date;
  status: string;
}

export interface Formation {
  id: number;
  name: string;
  created_at?: string;
}

export interface AuditLog {
  id: number;
  user_id: string;
  action: string;
  resource: string;
  details: Record<string, unknown> | null;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

// ==========================================
// PAYLOADS API (CRÉATION / MODIFICATION)
// ==========================================

export interface CreateFormationPayload {
  name: string;
}

export interface CreateUserPayload {
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role?: string;
}

export interface CreateProspectPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  country_id: number;
  status_id: number;
  formation_id: number | null;
}

export interface CreateStatusPayload {
  name: string;
  is_custom?: boolean;
}

export interface CreateTemplatePayload {
  name: string;
  subject: string;
  body: string;
}

export interface CreateAutomationPayload {
  status_id: number | "" | null;
  formation_id: number | null;
  email_template_id: string;
  trigger_type: string;
  scheduled_date: string | null;
}

export interface UpdateProfilePayload {
  first_name: string;
  last_name: string;
  email: string;
  password_hash?: string;
}

// ==========================================
// INTERFACES FRONTEND ET UTILITAIRES UI
// ==========================================

export interface SortHeaderProps {
  field: string;
  label: string;
  sortField: string;
  sortDirection: "asc" | "desc";
  onSort: (field: string) => void;
}

export interface ToastProps {
  message: string;
  type: "success" | "error" | "undo";
  duration?: number;
  onClose: () => void;
  onUndo?: () => void;
}

export interface CrudService<T, CreatePayload, UpdatePayload = Partial<T>> {
  getAll: () => Promise<T[]>;
  create: (data: CreatePayload) => Promise<unknown>;
  update: (
    id: string | number,
    data: UpdatePayload | Record<string, unknown>,
  ) => Promise<unknown>;
  delete: (id: string | number) => Promise<unknown>;
}

export interface UndoAction {
  message: string;
  duration: number;
  timerId: NodeJS.Timeout;
  onUndo: () => void;
}

export type ThemeName = "islands" | "glass" | "institution";

export type ThemeContextType = {
  themeName: ThemeName;
  setThemeName: (name: ThemeName) => void;
  t: {
    wrapper: string;
    sidebar: string;
    header: string;
    main: string;
    card: string;
    tableHeader: string;
    tableRow: string;
    input: string;
    btnPrimary: string;
    btnGhost: string;
    textMuted: string;
    title: string;
    activeNav: string;
    navHover: string;
  };
};

export interface FormCardProps {
  title: string;
  badge?: string;
  children: React.ReactNode;
}

export interface PageHeaderProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}
