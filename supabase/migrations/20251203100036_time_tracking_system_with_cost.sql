-- Location: supabase/migrations/20251203100036_time_tracking_system_with_cost.sql
-- Schema Analysis: Fresh project - no existing schema
-- Integration Type: Complete time tracking system with auth, roles, and cost tracking
-- Dependencies: auth.users (Supabase built-in)

-- 1. Types
CREATE TYPE public.user_role AS ENUM ('admin', 'standard');
CREATE TYPE public.project_status AS ENUM ('active', 'archived', 'completed');

-- 2. Core Tables
-- Collaborateur table (linked to auth.users)
CREATE TABLE public.collaborateur (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    nom_complet TEXT NOT NULL,
    role public.user_role DEFAULT 'standard'::public.user_role NOT NULL,
    taux_horaire DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Projet table
CREATE TABLE public.projet (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom TEXT NOT NULL,
    description TEXT,
    status public.project_status DEFAULT 'active'::public.project_status,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Catégorie table
CREATE TABLE public.categorie (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    projet_id UUID REFERENCES public.projet(id) ON DELETE CASCADE,
    nom TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- SaisieTemps table
CREATE TABLE public.saisie_temps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collaborateur_id UUID REFERENCES public.collaborateur(id) ON DELETE CASCADE NOT NULL,
    projet_id UUID REFERENCES public.projet(id) ON DELETE SET NULL,
    categorie_id UUID REFERENCES public.categorie(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    duree_heures DECIMAL(5,2) NOT NULL CHECK (duree_heures > 0),
    commentaire TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Indexes
CREATE INDEX idx_collaborateur_email ON public.collaborateur(email);
CREATE INDEX idx_collaborateur_role ON public.collaborateur(role);
CREATE INDEX idx_projet_status ON public.projet(status);
CREATE INDEX idx_categorie_projet_id ON public.categorie(projet_id);
CREATE INDEX idx_saisie_temps_collaborateur_id ON public.saisie_temps(collaborateur_id);
CREATE INDEX idx_saisie_temps_projet_id ON public.saisie_temps(projet_id);
CREATE INDEX idx_saisie_temps_date ON public.saisie_temps(date);

-- 4. Functions (MUST BE BEFORE RLS POLICIES)
-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.collaborateur (id, email, nom_complet, role, taux_horaire)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nom_complet', split_part(NEW.email, '@', 1)),
        COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'standard'::public.user_role),
        COALESCE((NEW.raw_user_meta_data->>'taux_horaire')::DECIMAL, 0)
    );
    RETURN NEW;
END;
$$;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.collaborateur c
    WHERE c.id = auth.uid() AND c.role = 'admin'::public.user_role
)
$$;

-- Function to update timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- 5. Enable RLS
ALTER TABLE public.collaborateur ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorie ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saisie_temps ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
-- Collaborateur policies (Pattern 1: Core user table)
CREATE POLICY "users_view_own_collaborateur"
ON public.collaborateur
FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "users_update_own_collaborateur"
ON public.collaborateur
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Admin can view all collaborateurs
CREATE POLICY "admin_view_all_collaborateurs"
ON public.collaborateur
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Admin can update roles and taux_horaire
CREATE POLICY "admin_update_collaborateur_role_taux"
ON public.collaborateur
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Projet policies (admin manages, users view)
CREATE POLICY "users_view_projets"
ON public.projet
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "admin_manage_projets"
ON public.projet
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Catégorie policies (admin manages, users view)
CREATE POLICY "users_view_categories"
ON public.categorie
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "admin_manage_categories"
ON public.categorie
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- SaisieTemps policies (Pattern 2: Simple user ownership)
CREATE POLICY "users_view_own_saisie_temps"
ON public.saisie_temps
FOR SELECT
TO authenticated
USING (collaborateur_id = auth.uid());

CREATE POLICY "users_create_own_saisie_temps"
ON public.saisie_temps
FOR INSERT
TO authenticated
WITH CHECK (collaborateur_id = auth.uid());

CREATE POLICY "users_update_own_saisie_temps"
ON public.saisie_temps
FOR UPDATE
TO authenticated
USING (collaborateur_id = auth.uid())
WITH CHECK (collaborateur_id = auth.uid());

CREATE POLICY "users_delete_own_saisie_temps"
ON public.saisie_temps
FOR DELETE
TO authenticated
USING (collaborateur_id = auth.uid());

-- Admin can view all saisies
CREATE POLICY "admin_view_all_saisie_temps"
ON public.saisie_temps
FOR SELECT
TO authenticated
USING (public.is_admin());

-- 7. Triggers
-- Trigger to create collaborateur when auth user is created
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Triggers to update timestamps
CREATE TRIGGER update_collaborateur_timestamp
    BEFORE UPDATE ON public.collaborateur
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_projet_timestamp
    BEFORE UPDATE ON public.projet
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_categorie_timestamp
    BEFORE UPDATE ON public.categorie
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_saisie_temps_timestamp
    BEFORE UPDATE ON public.saisie_temps
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- 8. Mock Data
DO $$
DECLARE
    admin_uuid UUID := gen_random_uuid();
    user1_uuid UUID := gen_random_uuid();
    user2_uuid UUID := gen_random_uuid();
    projet1_uuid UUID := gen_random_uuid();
    projet2_uuid UUID := gen_random_uuid();
    projet3_uuid UUID := gen_random_uuid();
    cat1_uuid UUID := gen_random_uuid();
    cat2_uuid UUID := gen_random_uuid();
    cat3_uuid UUID := gen_random_uuid();
BEGIN
    -- Create auth users
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'admin@timetracker.fr', crypt('Admin123!', gen_salt('bf', 10)), now(), now(), now(),
         '{"nom_complet": "Marie Dubois", "role": "admin", "taux_horaire": 85}'::jsonb, 
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (user1_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'pierre.martin@timetracker.fr', crypt('User123!', gen_salt('bf', 10)), now(), now(), now(),
         '{"nom_complet": "Pierre Martin", "role": "standard", "taux_horaire": 65}'::jsonb, 
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (user2_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'sophie.laurent@timetracker.fr', crypt('User123!', gen_salt('bf', 10)), now(), now(), now(),
         '{"nom_complet": "Sophie Laurent", "role": "standard", "taux_horaire": 70}'::jsonb, 
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null);

    -- Create projets
    INSERT INTO public.projet (id, nom, description, status) VALUES
        (projet1_uuid, 'Refonte Site E-commerce', 'Modernisation complète de la plateforme e-commerce', 'active'),
        (projet2_uuid, 'Application Mobile Banking', 'Développement application bancaire mobile iOS/Android', 'active'),
        (projet3_uuid, 'Système CRM Interne', 'Mise en place CRM pour gestion clients', 'active');

    -- Create catégories
    INSERT INTO public.categorie (id, projet_id, nom, description) VALUES
        (cat1_uuid, projet1_uuid, 'Développement Frontend', 'Intégration UI et développement React'),
        (cat2_uuid, projet2_uuid, 'Développement Backend', 'API et logique serveur'),
        (cat3_uuid, projet3_uuid, 'Tests et QA', 'Tests fonctionnels et assurance qualité');

    -- Create saisies temps
    INSERT INTO public.saisie_temps (collaborateur_id, projet_id, categorie_id, date, duree_heures, commentaire) VALUES
        (admin_uuid, projet1_uuid, cat1_uuid, '2024-12-02', 7.5, 'Intégration des nouvelles maquettes page produit'),
        (user1_uuid, projet2_uuid, cat2_uuid, '2024-12-02', 8.0, 'Développement API gestion comptes'),
        (user2_uuid, projet3_uuid, cat3_uuid, '2024-12-02', 6.5, 'Tests intégration module contacts'),
        (admin_uuid, projet1_uuid, cat1_uuid, '2024-12-01', 6.0, 'Optimisation performances page accueil'),
        (user1_uuid, projet2_uuid, cat2_uuid, '2024-12-01', 7.5, 'Sécurisation endpoints authentification');
END $$;