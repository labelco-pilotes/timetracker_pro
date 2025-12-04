import { supabase } from '../lib/supabase';

export const projetService = {
  /**
   * Récupère tous les projets, triés par nom.
   * Retourne des objets au format :
   * { id, nom, description, status, createdAt, updatedAt }
   */
  async getAll() {
    const { data, error } = await supabase
      ?.from('projet')
      ?.select('*')
      ?.order('nom', { ascending: true });

    if (error) {
      console.error('[projetService.getAll] error', error);
      throw error;
    }

    return (
      data?.map((row) => ({
        id: row?.id,
        nom: row?.nom,
        description: row?.description,
        status: row?.status,
        createdAt: row?.created_at,
        updatedAt: row?.updated_at,
      })) || []
    );
  },

  /**
   * Crée un projet.
   * payload attendu : { nom, description?, status? }
   */
  async create({ nom, description, status = 'active' }) {
    const payload = {
      nom,
      description: description || null,
      status: status || 'active',
    };

    const { data, error } = await supabase
      ?.from('projet')
      ?.insert(payload)
      ?.select('*')
      ?.single();

    if (error) {
      console.error('[projetService.create] error', error);
      throw error;
    }

    return {
      id: data?.id,
      nom: data?.nom,
      description: data?.description,
      status: data?.status,
      createdAt: data?.created_at,
      updatedAt: data?.updated_at,
    };
  },

  /**
   * Met à jour un projet.
   * fields : { nom?, description?, status? }
   */
  async update(id, fields) {
    const payload = {};
    if (fields.nom !== undefined) payload.nom = fields.nom;
    if (fields.description !== undefined) payload.description = fields.description;
    if (fields.status !== undefined) payload.status = fields.status;

    const { data, error } = await supabase
      ?.from('projet')
      ?.update(payload)
      ?.eq('id', id)
      ?.select('*')
      ?.single();

    if (error) {
      console.error('[projetService.update] error', error);
      throw error;
    }

    return {
      id: data?.id,
      nom: data?.nom,
      description: data?.description,
      status: data?.status,
      createdAt: data?.created_at,
      updatedAt: data?.updated_at,
    };
  },

  async archive(id) {
    return this.update(id, { status: 'inactive' });
  },

  async activate(id) {
    return this.update(id, { status: 'active' });
  },

  async delete(id) {
    const { error } = await supabase?.from('projet')?.delete()?.eq('id', id);
    if (error) {
      console.error('[projetService.delete] error', error);
      throw error;
    }
  },

  async getById(id) {
    const { data, error } = await supabase
      ?.from('projet')
      ?.select('*')
      ?.eq('id', id)
      ?.single();

    if (error) {
      console.error('[projetService.getById] error', error);
      throw error;
    }

    return {
      id: data?.id,
      nom: data?.nom,
      description: data?.description,
      status: data?.status,
      createdAt: data?.created_at,
      updatedAt: data?.updated_at,
    };
  },
};
