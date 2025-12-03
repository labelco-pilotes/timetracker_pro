import { supabase } from '../lib/supabase';

export const projetService = {
  async getAll() {
    const { data, error } = await supabase?.from('projet')?.select('*')?.order('nom', { ascending: true });
    
    if (error) throw error;
    
    return data?.map(row => ({
      id: row?.id,
      nom: row?.nom,
      description: row?.description,
      status: row?.status,
      createdAt: row?.created_at,
      updatedAt: row?.updated_at
    })) || [];
  },

  async getById(id) {
    const { data, error } = await supabase?.from('projet')?.select('*')?.eq('id', id)?.single();
    
    if (error) throw error;
    
    return {
      id: data?.id,
      nom: data?.nom,
      description: data?.description,
      status: data?.status,
      createdAt: data?.created_at,
      updatedAt: data?.updated_at
    };
  }
};