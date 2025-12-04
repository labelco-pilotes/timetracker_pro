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

    // Filtres optionnels
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

    // Normalisation du format pour tout le front
    return (data || []).map((row) => ({
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
    }));
  },

  /**
   * Crée une saisie de temps pour l'utilisateur connecté
   * (utilisé pour la saisie manuelle + import calendrier)
   */
  async create({ projetId = null, categorieId = null, date, dureeHeures, commentaire = null }) {
    // Récupérer l'utilisateur courant
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error('[saisieTempsService.create] auth error', userError);
      throw userError;
    }
    if (!user) {
      throw new Error("Utilisateur non authentifié");
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

    return {
      id: data.id,
      collaborateurId: data.collaborateur_id,
      projetId: data.projet_id,
      categorieId: data.categorie_id,
      date: data.date,
      dureeHeures: Number(data.duree_heures) || 0,
      commentaire: data.commentaire || '',
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      collaborateur: data.collaborateur
        ? {
            id: data.collaborateur.id,
            nomComplet: data.collaborateur.nom_complet,
            email: data.collaborateur.email,
            role: data.collaborateur.role,
            tauxHoraire: Number(data.collaborateur.taux_horaire) || 0,
          }
        : null,
      projet: data.projet
        ? {
            id: data.projet.id,
            nom: data.projet.nom,
          }
        : null,
      categorie: data.categorie
        ? {
            id: data.categorie.id,
            nom: data.categorie.nom,
          }
        : null,
    };
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
