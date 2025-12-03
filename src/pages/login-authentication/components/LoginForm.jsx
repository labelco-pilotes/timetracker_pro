import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

const LoginForm = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  // Demo credentials
  const demoCredentials = [
    { email: 'admin@timetracker.fr', password: 'Admin123!', role: 'Administrateur' },
    { email: 'pierre.martin@timetracker.fr', password: 'User123!', role: 'Utilisateur' },
    { email: 'sophie.laurent@timetracker.fr', password: 'User123!', role: 'Utilisateur' }
  ];

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: signInError } = await signIn(email, password);
      
      if (signInError) {
        setError(signInError?.message || 'Échec de la connexion. Vérifiez vos identifiants.');
      } else {
        navigate('/team-dashboard');
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const useDemoCredentials = (cred) => {
    setEmail(cred?.email);
    setPassword(cred?.password);
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
            Adresse email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e?.target?.value)}
              className="block w-full pl-10 pr-3 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              placeholder="utilisateur@example.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
            Mot de passe
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e?.target?.value)}
              className="block w-full pl-10 pr-10 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
              ) : (
                <Eye className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Connexion en cours...' : 'Se connecter'}
        </button>

        <div className="text-center">
          <a 
            href="/password-reset-request" 
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            Mot de passe oublié ?
          </a>
        </div>
      </form>

      <div className="mt-6 pt-6 border-t border-border text-center">
        <p className="text-sm text-muted-foreground mb-2">
          Pas encore de compte ?
        </p>
        <a
          href="/user-registration"
          className="text-primary hover:text-primary/80 font-medium transition-colors"
        >
          Inscrivez-vous
        </a>
      </div>

      {/* Demo Credentials Section */}
      <div className="mt-8 pt-6 border-t border-border">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold mr-2">
            i
          </span>
          Identifiants de démonstration
        </h3>
        <div className="space-y-3">
          {demoCredentials?.map((cred, index) => (
            <div 
              key={index}
              className="bg-muted/30 rounded-lg p-3 border border-border hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground uppercase">
                  {cred?.role}
                </span>
                <button
                  type="button"
                  onClick={() => useDemoCredentials(cred)}
                  className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Utiliser ces identifiants
                </button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground font-mono">{cred?.email}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(cred?.email, `email-${index}`)}
                    className="p-1 hover:bg-background rounded transition-colors"
                    title="Copier l'email"
                  >
                    {copiedField === `email-${index}` ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground font-mono">{cred?.password}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(cred?.password, `password-${index}`)}
                    className="p-1 hover:bg-background rounded transition-colors"
                    title="Copier le mot de passe"
                  >
                    {copiedField === `password-${index}` ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
          Ces identifiants correspondent aux utilisateurs créés dans la migration de base de données. 
          Utilisez le compte administrateur pour accéder à toutes les fonctionnalités de gestion.
        </p>
      </div>
    </div>
  );
};

export default LoginForm;