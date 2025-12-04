import { supabase } from '../lib/supabase';

export const categorieService = {
  /**
   * Récupère toutes les catégories.
   * Si projetId est fourni -> filtre sur ce projet.
   */
  async getAll(projetId = null) {
    let query = supabase
      ?.from('categorie')
      ?.select('*')
      ?.order('nom', { ascending: true });

    if (projetId) {
      query = query?.eq('projet_id', projetId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[categorieService.getAll] error', error);
      throw error;
    }

    return (
      data?.map((row) => ({
        id: row?.id,
        projetId: row?.projet_id,
        nom: row?.nom,
        description: row?.description,
        createdAt: row?.created_at,
        updatedAt: row?.updated_at,
      })) || []
    );
  },

  /**
   * Crée une catégorie.
   * payload attendu : { projetId, nom, description? }
   */
  async create({ projetId, nom, description }) {
    const payload = {
      projet_id: projetId,
      nom,
      description: description || null,
    };

    const { data, error } = await supabase
      ?.from('categorie')
      ?.insert(payload)
      ?.select('*')
      ?.single();

    if (error) {
      console.error('[categorieService.create] error', error);
      throw error;
    }

    return {
      id: data?.id,
      projetId: data?.projet_id,
      nom: data?.nom,
      description: data?.description,
      createdAt: data?.created_at,
      updatedAt: data?.updated_at,
    };
  },

  /**
   * Met à jour une catégorie.
   * fields : { nom?, description? }
   */
  async update(id, fields) {
    const payload = {};
    if (fields.nom !== undefined) payload.nom = fields.nom;
    if (fields.description !== undefined) payload.description = fields.description;

    const { data, error } = await supabase
      ?.from('categorie')
      ?.update(payload)
      ?.eq('id', id)
      ?.select('*')
      ?.single();

    if (error) {
      console.error('[categorieService.update] error', error);
      throw error;
    }

    return {
      id: data?.id,
      projetId: data?.projet_id,
      nom: data?.nom,
      description: data?.description,
      createdAt: data?.created_at,
      updatedAt: data?.updated_at,
    };
  },

  /**
   * Supprime une catégorie.
   * (à utiliser avec prudence si des saisies utilisent cette catégorie)
   */
  async delete(id) {
    const { error } = await supabase
      ?.from('categorie')
      ?.delete()
      ?.eq('id', id);

    if (error) {
      console.error('[categorieService.delete] error', error);
      throw error;
    }
  },

  /**
   * Récupère une catégorie par id.
   */
  async getById(id) {
    const { data, error } = await supabase
      ?.from('categorie')
      ?.select('*')
      ?.eq('id', id)
      ?.single();

    if (error) {
      console.error('[categorieService.getById] error', error);
      throw error;
    }

    return {
      id: data?.id,
      projetId: data?.projet_id,
      nom: data?.nom,
      description: data?.description,
      createdAt: data?.created_at,
      updatedAt: data?.updated_at,
    };
  },
};
