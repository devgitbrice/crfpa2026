-- =====================================================
-- CRFPA 2026 - Schéma de base de données Supabase
-- =====================================================
-- Exécutez ce script dans l'éditeur SQL de Supabase
-- Dashboard > SQL Editor > New Query
-- =====================================================

-- Table des pages
CREATE TABLE IF NOT EXISTS crfpa_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject TEXT NOT NULL CHECK (subject IN (
        'administratif',
        'note-de-synthese',
        'droit',
        'droit-des-obligations',
        'droit-prive',
        'procedure-civile'
    )),
    title TEXT NOT NULL DEFAULT 'Nouvelle page',
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des blocs
CREATE TABLE IF NOT EXISTS crfpa_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES crfpa_pages(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'text' CHECK (type IN (
        'text',
        'heading1',
        'heading2',
        'heading3',
        'bullet',
        'numbered',
        'quote',
        'code',
        'divider'
    )),
    content TEXT NOT NULL DEFAULT '',
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_crfpa_pages_subject ON crfpa_pages(subject);
CREATE INDEX IF NOT EXISTS idx_crfpa_pages_order ON crfpa_pages(subject, order_index);
CREATE INDEX IF NOT EXISTS idx_crfpa_blocks_page ON crfpa_blocks(page_id);
CREATE INDEX IF NOT EXISTS idx_crfpa_blocks_order ON crfpa_blocks(page_id, order_index);

-- Activer Row Level Security (RLS)
ALTER TABLE crfpa_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE crfpa_blocks ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre toutes les opérations (mode public)
-- Pour une application personnelle sans authentification
CREATE POLICY "Allow all operations on crfpa_pages" ON crfpa_pages
    FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all operations on crfpa_blocks" ON crfpa_blocks
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour mettre à jour updated_at automatiquement
DROP TRIGGER IF EXISTS update_crfpa_pages_updated_at ON crfpa_pages;
CREATE TRIGGER update_crfpa_pages_updated_at
    BEFORE UPDATE ON crfpa_pages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_crfpa_blocks_updated_at ON crfpa_blocks;
CREATE TRIGGER update_crfpa_blocks_updated_at
    BEFORE UPDATE ON crfpa_blocks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================
-- Après exécution, vos tables sont prêtes !
-- Vous pouvez lancer l'application avec: npm run dev
-- =====================================================
