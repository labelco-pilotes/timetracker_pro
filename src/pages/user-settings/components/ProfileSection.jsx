import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { collaborateurService } from '../../../services/collaborateurService';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

export function ProfileSection() {
  const { user, userProfile } = useAuth();
  const [nomComplet, setNomComplet] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (userProfile) {
      setNomComplet(userProfile?.nom_complet || '');
      setEmail(userProfile?.email || '');
    }
  }, [userProfile]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      // Validate inputs
      if (!nomComplet?.trim()) {
        throw new Error('Le nom complet est obligatoire');
      }
      if (!email?.trim()) {
        throw new Error('L\'adresse e-mail est obligatoire');
      }

      // Check if email changed
      const emailChanged = email !== userProfile?.email;

      // Update collaborateur profile
      if (nomComplet !== userProfile?.nom_complet || emailChanged) {
        await collaborateurService?.updateProfile(user?.id, {
          nomComplet: nomComplet?.trim(),
          email: email?.trim()
        });
      }

      // Update auth email if changed
      if (emailChanged) {
        await collaborateurService?.updateEmail(email?.trim());
      }

      setSuccessMessage('Informations mises à jour avec succès.');
      
      // Reload profile
      window?.location?.reload();
    } catch (error) {
      if (error?.message?.includes('unique constraint')) {
        setErrorMessage('Cette adresse e-mail est déjà utilisée.');
      } else {
        setErrorMessage(error?.message || 'Une erreur est survenue lors de la mise à jour.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Profil</h2>
      
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
          <label htmlFor="nomComplet" className="block text-sm font-medium text-gray-700 mb-1">
            Nom complet
          </label>
          <Input
            id="nomComplet"
            type="text"
            value={nomComplet}
            onChange={(e) => setNomComplet(e?.target?.value)}
            placeholder="Votre nom complet"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Adresse e-mail
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e?.target?.value)}
            placeholder="votre.email@exemple.fr"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Si vous modifiez votre e-mail, vous devrez le confirmer via un lien envoyé par e-mail.
          </p>
        </div>

        <div className="pt-2">
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </Button>
        </div>
      </form>
    </div>
  );
}