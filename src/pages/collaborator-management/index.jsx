import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/ui/Header';
import { collaborateurService } from '../../services/collaborateurService';
import { Users, Mail, Shield, DollarSign, Loader2 } from 'lucide-react';

import Input from '../../components/ui/Input';

export default function CollaboratorManagement() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, userProfile } = useAuth();
  const [collaborateurs, setCollaborateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingRoles, setEditingRoles] = useState({});
  const [editingTauxHoraire, setEditingTauxHoraire] = useState({});

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login-authentication');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && userProfile?.role === 'admin') {
      loadCollaborateurs();
    }
  }, [isAuthenticated, authLoading, userProfile]);

  const loadCollaborateurs = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await collaborateurService?.getAll();
      setCollaborateurs(data || []);
    } catch (err) {
      setError('Erreur lors du chargement des collaborateurs : ' + (err?.message || 'Erreur inconnue'));
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (collaborateurId, newRole) => {
    try {
      setError('');
      setSuccessMessage('');
      setEditingRoles(prev => ({ ...prev, [collaborateurId]: true }));

      await collaborateurService?.updateRole(collaborateurId, newRole);
      
      // Update local state
      setCollaborateurs(prev => prev?.map(c => 
        c?.id === collaborateurId ? { ...c, role: newRole } : c
      ));

      setSuccessMessage('Rôle mis à jour avec succès');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Erreur lors de la mise à jour du rôle : ' + (err?.message || 'Erreur inconnue'));
    } finally {
      setEditingRoles(prev => ({ ...prev, [collaborateurId]: false }));
    }
  };

  const handleTauxHoraireChange = async (collaborateurId, newTaux) => {
    try {
      setError('');
      setSuccessMessage('');
      setEditingTauxHoraire(prev => ({ ...prev, [collaborateurId]: true }));

      const tauxValue = parseFloat(newTaux);
      if (isNaN(tauxValue) || tauxValue < 0) {
        throw new Error('Le taux horaire doit être un nombre positif');
      }

      await collaborateurService?.updateTauxHoraire(collaborateurId, tauxValue);
      
      // Update local state
      setCollaborateurs(prev => prev?.map(c => 
        c?.id === collaborateurId ? { ...c, tauxHoraire: tauxValue } : c
      ));

      setSuccessMessage('Taux horaire mis à jour avec succès');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Erreur lors de la mise à jour du taux horaire : ' + (err?.message || 'Erreur inconnue'));
    } finally {
      setEditingTauxHoraire(prev => ({ ...prev, [collaborateurId]: false }));
    }
  };

  if (authLoading || (isAuthenticated && userProfile && userProfile?.role !== 'admin' && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (userProfile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Accès refusé</h2>
            <p className="text-red-700">
              Cette page est réservée aux administrateurs. Vous n'avez pas les droits nécessaires pour y accéder.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Gestion des Collaborateurs - Suivi du temps</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50">
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Collaborateurs</h1>
            <p className="mt-2 text-gray-600">
              Gérez les rôles et les taux horaires de vos collaborateurs
            </p>
          </div>

          {/* Messages */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 text-green-800 rounded-lg border border-green-200">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* Collaborators Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto" />
                <p className="mt-4 text-gray-600">Chargement des collaborateurs...</p>
              </div>
            ) : collaborateurs?.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Aucun collaborateur trouvé</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Nom complet
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Rôle
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Taux horaire (€/h)
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {collaborateurs?.map((collaborateur) => (
                      <tr key={collaborateur?.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {collaborateur?.nomComplet}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {collaborateur?.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <select
                              value={collaborateur?.role}
                              onChange={(e) => handleRoleChange(collaborateur?.id, e?.target?.value)}
                              disabled={editingRoles?.[collaborateur?.id]}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                              <option value="standard">Standard</option>
                              <option value="admin">Administrateur</option>
                            </select>
                            {editingRoles?.[collaborateur?.id] && (
                              <Loader2 className="animate-spin h-4 w-4 text-blue-600" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={collaborateur?.tauxHoraire || ''}
                              onChange={(e) => handleTauxHoraireChange(collaborateur?.id, e?.target?.value)}
                              disabled={editingTauxHoraire?.[collaborateur?.id]}
                              placeholder="Ex: 65.00"
                              className="w-32"
                            />
                            {editingTauxHoraire?.[collaborateur?.id] && (
                              <Loader2 className="animate-spin h-4 w-4 text-blue-600" />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Help Text */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              💡 À propos des taux horaires
            </h3>
            <p className="text-sm text-blue-700">
              Le taux horaire est utilisé pour calculer le coût des temps saisis dans le tableau de bord. 
              La devise est l'euro (€). Laissez vide si vous ne souhaitez pas calculer le coût pour ce collaborateur.
            </p>
          </div>
        </main>
      </div>
    </>
  );
}