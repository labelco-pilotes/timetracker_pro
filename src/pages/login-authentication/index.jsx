import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginHeader from './components/LoginHeader';
import LoginForm from './components/LoginForm';
import SecurityNotice from './components/SecurityNotice';
import SystemStatus from './components/SystemStatus';

const LoginAuthentication = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const existingUser = localStorage.getItem('timetracker_user');
    if (existingUser) {
      try {
        const userData = JSON.parse(existingUser);
        // Redirect based on role
        if (userData?.role === 'admin') {
          navigate('/team-dashboard');
        } else {
          navigate('/personal-time-entries');
        }
      } catch (error) {
        // Clear invalid session data
        localStorage.removeItem('timetracker_user');
      }
    }

    // Set page title
    document.title = 'Connexion - TimeTracker Pro';
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Main Login Card */}
        <div className="bg-card border border-border rounded-lg card-shadow p-8">
          <LoginHeader />
          <LoginForm />
          <SecurityNotice />
          <SystemStatus />
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
            © {new Date()?.getFullYear()} TimeTracker Pro. Tous droits réservés.
          </p>
          <div className="flex items-center justify-center space-x-4 mt-2">
            <a 
              href="#" 
              className="text-xs text-muted-foreground hover:text-foreground nav-transition"
            >
              Conditions d'utilisation
            </a>
            <span className="text-xs text-muted-foreground">•</span>
            <a 
              href="#" 
              className="text-xs text-muted-foreground hover:text-foreground nav-transition"
            >
              Politique de confidentialité
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginAuthentication;