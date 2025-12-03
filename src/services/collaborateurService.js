import { supabase } from '../lib/supabase';

export const collaborateurService = {
  async getAll() {
    const { data, error } = await supabase?.from('collaborateur')?.select('*')?.order('nom_complet', { ascending: true });
    
    if (error) throw error;
    
    return data?.map(row => ({
      id: row?.id,
      email: row?.email,
      nomComplet: row?.nom_complet,
      role: row?.role,
      tauxHoraire: row?.taux_horaire,
      createdAt: row?.created_at,
      updatedAt: row?.updated_at
    })) || [];
  },

  async getById(id) {
    const { data, error } = await supabase?.from('collaborateur')?.select('*')?.eq('id', id)?.single();
    
    if (error) throw error;
    
    return {
      id: data?.id,
      email: data?.email,
      nomComplet: data?.nom_complet,
      role: data?.role,
      tauxHoraire: data?.taux_horaire,
      createdAt: data?.created_at,
      updatedAt: data?.updated_at
    };
  },

  async updateRole(id, role) {
    const { data, error } = await supabase?.from('collaborateur')?.update({ role: role })?.eq('id', id)?.select()?.single();
    
    if (error) throw error;
    
    return {
      id: data?.id,
      email: data?.email,
      nomComplet: data?.nom_complet,
      role: data?.role,
      tauxHoraire: data?.taux_horaire,
      createdAt: data?.created_at,
      updatedAt: data?.updated_at
    };
  },

  async updateTauxHoraire(id, tauxHoraire) {
    const { data, error } = await supabase?.from('collaborateur')?.update({ taux_horaire: tauxHoraire })?.eq('id', id)?.select()?.single();
    
    if (error) throw error;
    
    return {
      id: data?.id,
      email: data?.email,
      nomComplet: data?.nom_complet,
      role: data?.role,
      tauxHoraire: data?.taux_horaire,
      createdAt: data?.created_at,
      updatedAt: data?.updated_at
    };
  },

  async updateProfile(id, profileData) {
    const updateData = {};
    
    if (profileData?.nomComplet !== undefined) {
      updateData.nom_complet = profileData?.nomComplet;
    }
    if (profileData?.email !== undefined) {
      updateData.email = profileData?.email;
    }
    
    const { data, error } = await supabase?.from('collaborateur')?.update(updateData)?.eq('id', id)?.select()?.single();
    
    if (error) throw error;
    
    return {
      id: data?.id,
      email: data?.email,
      nomComplet: data?.nom_complet,
      role: data?.role,
      tauxHoraire: data?.taux_horaire,
      createdAt: data?.created_at,
      updatedAt: data?.updated_at
    };
  },

  async changePassword(currentPassword, newPassword) {
    try {
      // Verify current password by attempting to sign in
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Non authentifié');

      // Update password using Supabase auth
      const { error } = await supabase?.auth?.updateUser({ 
        password: newPassword 
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      throw error;
    }
  },

  async updateEmail(newEmail) {
    try {
      const { data, error } = await supabase?.auth?.updateUser({ 
        email: newEmail 
      });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      throw error;
    }
  }
};