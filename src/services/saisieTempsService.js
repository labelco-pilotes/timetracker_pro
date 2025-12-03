import { supabase } from '../lib/supabase';

export const saisieTempsService = {
  async getAll(filters = {}) {
    let query = supabase?.from('saisie_temps')?.select(`
        *,
        collaborateur:collaborateur_id(id, nom_complet, email, taux_horaire),
        projet:projet_id(id, nom),
        categorie:categorie_id(id, nom)
      `);

    // Apply filters
    if (filters?.collaborateurId) {
      query = query?.eq('collaborateur_id', filters?.collaborateurId);
    }
    if (filters?.projetId) {
      query = query?.eq('projet_id', filters?.projetId);
    }
    if (filters?.categorieId) {
      query = query?.eq('categorie_id', filters?.categorieId);
    }
    if (filters?.startDate) {
      query = query?.gte('date', filters?.startDate);
    }
    if (filters?.endDate) {
      query = query?.lte('date', filters?.endDate);
    }

    query = query?.order('date', { ascending: false });

    const { data, error } = await query;
    
    if (error) throw error;
    
    return data?.map(row => ({
      id: row?.id,
      collaborateurId: row?.collaborateur_id,
      collaborateur: row?.collaborateur ? {
        id: row?.collaborateur?.id,
        nomComplet: row?.collaborateur?.nom_complet,
        email: row?.collaborateur?.email,
        tauxHoraire: row?.collaborateur?.taux_horaire
      } : null,
      projetId: row?.projet_id,
      projet: row?.projet ? {
        id: row?.projet?.id,
        nom: row?.projet?.nom
      } : null,
      categorieId: row?.categorie_id,
      categorie: row?.categorie ? {
        id: row?.categorie?.id,
        nom: row?.categorie?.nom
      } : null,
      date: row?.date,
      dureeHeures: row?.duree_heures,
      commentaire: row?.commentaire,
      createdAt: row?.created_at,
      updatedAt: row?.updated_at
    })) || [];
  },

  async create(saisieData) {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Non authentifié');

    const { data, error } = await supabase?.from('saisie_temps')?.insert({
        collaborateur_id: user?.id,
        projet_id: saisieData?.projetId || null,
        categorie_id: saisieData?.categorieId || null,
        date: saisieData?.date,
        duree_heures: saisieData?.dureeHeures,
        commentaire: saisieData?.commentaire || null
      })?.select()?.single();
    
    if (error) throw error;
    
    return {
      id: data?.id,
      collaborateurId: data?.collaborateur_id,
      projetId: data?.projet_id,
      categorieId: data?.categorie_id,
      date: data?.date,
      dureeHeures: data?.duree_heures,
      commentaire: data?.commentaire,
      createdAt: data?.created_at,
      updatedAt: data?.updated_at
    };
  },

  async update(id, updates) {
    const { data, error } = await supabase?.from('saisie_temps')?.update({
        projet_id: updates?.projetId !== undefined ? updates?.projetId : undefined,
        categorie_id: updates?.categorieId !== undefined ? updates?.categorieId : undefined,
        duree_heures: updates?.dureeHeures !== undefined ? updates?.dureeHeures : undefined,
        commentaire: updates?.commentaire !== undefined ? updates?.commentaire : undefined
      })?.eq('id', id)?.select()?.single();
    
    if (error) throw error;
    
    return {
      id: data?.id,
      collaborateurId: data?.collaborateur_id,
      projetId: data?.projet_id,
      categorieId: data?.categorie_id,
      date: data?.date,
      dureeHeures: data?.duree_heures,
      commentaire: data?.commentaire,
      createdAt: data?.created_at,
      updatedAt: data?.updated_at
    };
  },

  async delete(id) {
    const { error } = await supabase?.from('saisie_temps')?.delete()?.eq('id', id);
    
    if (error) throw error;
  }
};