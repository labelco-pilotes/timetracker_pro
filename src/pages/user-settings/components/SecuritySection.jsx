import React, { useState } from 'react';
import { collaborateurService } from '../../../services/collaborateurService';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

export function SecuritySection() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      // Validate inputs
      if (!currentPassword) {
        throw new Error('Le mot de passe actuel est requis');
      }
      if (!newPassword) {
        throw new Error('Le nouveau mot de passe est requis');
      }
      if (newPassword?.length < 6) {
        throw new Error('Le mot de passe doit contenir au moins 6 caractères');
      }
      if (newPassword !== confirmPassword) {
        throw new Error('Les mots de passe ne correspondent pas');
      }

      // Change password
      await collaborateurService?.changePassword(currentPassword, newPassword);

      setSuccessMessage('Mot de passe mis à jour avec succès.');
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      if (error?.message?.includes('Invalid login credentials')) {
        setErrorMessage('Le mot de passe actuel est incorrect.');
      } else {
        setErrorMessage(error?.message || 'Une erreur est survenue lors de la mise à jour du mot de passe.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Sécurité</h2>
      
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 text-green-800 rounded-md">
          {successMessage}
        </div>
      )}
      
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-md">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Mot de passe actuel
          </label>
          <Input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e?.target?.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Nouveau mot de passe
          </label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e?.target?.value)}
            placeholder="••••••••"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Le mot de passe doit contenir au moins 6 caractères.
          </p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirmer le nouveau mot de passe
          </label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e?.target?.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <div className="pt-2">
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
          </Button>
        </div>
      </form>
    </div>
  );
}