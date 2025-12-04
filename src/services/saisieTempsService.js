import { supabase } from '../lib/supabase';

export const saisieTempsService = {
  /**
   * Récupère les saisies de temps
   * filters: { collaborateurId?, projetId?, categorieId?, startDate?, endDate? }
   */
  async getAll(filters = {}) {
    let query = supabase
      ?.from('saisie_temps')
      ?.select(
        `
        id,
        collaborateur_id,
        projet_id,
        categorie_id,
        date,
        duree_heures,
        commentaire,
        created_at,
        updated_at,
        collaborateur:collaborateur_id (
          id,
          nom_complet,
          email,
          role,
          taux_horaire
        ),
        projet:projet_id (
          id,
          nom
        ),
        categorie:categorie_id (
          id,
          nom
        )
      `
      );

    if (filters?.collaborateurId) {
      query = query.eq('collaborateur_id', filters.collaborateurId);
    }
    if (filters?.projetId) {
      query = query.eq('projet_id', filters.projetId);
    }
    if (filters?.categorieId) {
      query = query.eq('categorie_id', filters.categorieId);
    }
    if (filters?.startDate) {
      query = query.gte('date', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('date', filters.endDate);
    }

    const { data, error } = await query.order('date', { ascending: true });

    if (error) {
      console.error('[saisieTempsService.getAll] error', error);
      throw error;
    }

    return (data || []).map((row) => normalizeRow(row));
  },

  /**
   * Crée une saisie de temps pour l'utilisateur connecté
   */
  async create({ projetId = null, categorieId = null, date, dureeHeures, commentaire = null }) {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error('[saisieTempsService.create] auth error', userError);
      throw userError;
    }
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    const payload = {
      collaborateur_id: user.id,
      projet_id: projetId || null,
      categorie_id: categorieId || null,
      date,
      duree_heures: dureeHeures,
      commentaire: commentaire || null,
    };

    const { data, error } = await supabase
      .from('saisie_temps')
      .insert(payload)
      .select(
        `
        id,
        collaborateur_id,
        projet_id,
        categorie_id,
        date,
        duree_heures,
        commentaire,
        created_at,
        updated_at,
        collaborateur:collaborateur_id (
          id,
          nom_complet,
          email,
          role,
          taux_horaire
        ),
        projet:projet_id (
          id,
          nom
        ),
        categorie:categorie_id (
          id,
          nom
        )
      `
      )
      .single();

    if (error) {
      console.error('[saisieTempsService.create] error', error);
      throw error;
    }

    return normalizeRow(data);
  },

  /**
   * Met à jour une saisie de temps de l'utilisateur connecté
   * fields: { projetId?, categorieId?, dureeHeures?, commentaire? }
   */
  async update(id, fields = {}) {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error('[saisieTempsService.update] auth error', userError);
      throw userError;
    }
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    const payload = {};
    if (fields.projetId !== undefined) payload.projet_id = fields.projetId || null;
    if (fields.categorieId !== undefined) payload.categorie_id = fields.categorieId || null;
    if (fields.dureeHeures !== undefined) payload.duree_heures = fields.dureeHeures;
    if (fields.commentaire !== undefined) payload.commentaire = fields.commentaire;

    const { data, error } = await supabase
      .from('saisie_temps')
      .update(payload)
      .eq('id', id)
      .eq('collaborateur_id', user.id) // sécurité + RLS
      .select(
        `
        id,
        collaborateur_id,
        projet_id,
        categorie_id,
        date,
        duree_heures,
        commentaire,
        created_at,
        updated_at,
        collaborateur:collaborateur_id (
          id,
          nom_complet,
          email,
          role,
          taux_horaire
        ),
        projet:projet_id (
          id,
          nom
        ),
        categorie:categorie_id (
          id,
          nom
        )
      `
      )
      .single();

    if (error) {
      console.error('[saisieTempsService.update] error', error);
      throw error;
    }

    return normalizeRow(data);
  },

  async delete(id) {
    const { error } = await supabase
      ?.from('saisie_temps')
      ?.delete()
      ?.eq('id', id);

    if (error) {
      console.error('[saisieTempsService.delete] error', error);
      throw error;
    }
  },
};

function normalizeRow(row) {
  return {
    id: row.id,
    collaborateurId: row.collaborateur_id,
    projetId: row.projet_id,
    categorieId: row.categorie_id,
    date: row.date,
    dureeHeures: Number(row.duree_heures) || 0,
    commentaire: row.commentaire || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    collaborateur: row.collaborateur
      ? {
          id: row.collaborateur.id,
          nomComplet: row.collaborateur.nom_complet,
          email: row.collaborateur.email,
          role: row.collaborateur.role,
          tauxHoraire: Number(row.collaborateur.taux_horaire) || 0,
        }
      : null,
    projet: row.projet
      ? {
          id: row.projet.id,
          nom: row.projet.nom,
        }
      : null,
    categorie: row.categorie
      ? {
          id: row.categorie.id,
          nom: row.categorie.nom,
        }
      : null,
  };
}
