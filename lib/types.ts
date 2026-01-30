export type Subject =
  | 'administratif'
  | 'note-de-synthese'
  | 'droit'
  | 'droit-des-obligations'
  | 'droit-prive'
  | 'procedure-civile'

export interface SubjectInfo {
  id: Subject
  name: string
  color: string
}

export const SUBJECTS: SubjectInfo[] = [
  { id: 'administratif', name: 'Administratif', color: '#3B82F6' },
  { id: 'note-de-synthese', name: 'Note de synthèse', color: '#10B981' },
  { id: 'droit', name: 'Droit', color: '#F59E0B' },
  { id: 'droit-des-obligations', name: 'Droit des obligations', color: '#EF4444' },
  { id: 'droit-prive', name: 'Droit privé', color: '#8B5CF6' },
  { id: 'procedure-civile', name: 'Procédure civile', color: '#EC4899' },
]

export interface CrfpaPage {
  id: string
  subject: Subject
  title: string
  order_index: number
  created_at: string
  updated_at: string
}

export interface CrfpaBlock {
  id: string
  page_id: string
  type: 'text' | 'heading1' | 'heading2' | 'heading3' | 'bullet' | 'numbered' | 'quote' | 'code' | 'divider'
  content: string
  order_index: number
  created_at: string
  updated_at: string
}

export const BLOCK_TYPES = [
  { type: 'text', label: 'Texte', icon: '¶' },
  { type: 'heading1', label: 'Titre 1', icon: 'H1' },
  { type: 'heading2', label: 'Titre 2', icon: 'H2' },
  { type: 'heading3', label: 'Titre 3', icon: 'H3' },
  { type: 'bullet', label: 'Liste à puces', icon: '•' },
  { type: 'numbered', label: 'Liste numérotée', icon: '1.' },
  { type: 'quote', label: 'Citation', icon: '"' },
  { type: 'code', label: 'Code', icon: '</>' },
  { type: 'divider', label: 'Séparateur', icon: '—' },
] as const
