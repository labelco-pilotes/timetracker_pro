import { supabase } from '../lib/supabase';

export const categorieService = {
  async getAll(projetId = null) {
    let query = supabase?.from('categorie')?.select('*')?.order('nom', { ascending: true });
    
    if (projetId) {
      query = query?.eq('projet_id', projetId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data?.map(row => ({
      id: row?.id,
      projetId: row?.projet_id,
      nom: row?.nom,
      description: row?.description,
      createdAt: row?.created_at,
      updatedAt: row?.updated_at
    })) || [];
  },

  async getById(id) {
    const { data, error } = await supabase?.from('categorie')?.select('*')?.eq('id', id)?.single();
    
    if (error) throw error;
    
    return {
      id: data?.id,
      projetId: data?.projet_id,
      nom: data?.nom,
      description: data?.description,
      createdAt: data?.created_at,
      updatedAt: data?.updated_at
    };
  }
};