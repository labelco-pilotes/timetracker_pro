import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Clock, PlusCircle, Calendar, FolderKanban, Tag, Users, Settings, LogOut, ChevronDown, Menu, X, User, BarChart3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../../components/AppIcon';


const NavigationHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userProfile, signOut, loading } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const userMenuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef?.current && !userMenuRef?.current?.contains(event?.target)) {
        setShowUserMenu(false);
      }
    };
    document?.addEventListener('mousedown', handleClickOutside);
    return () => document?.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      navigate('/login-authentication');
    }
  };

  const isAdmin = userProfile?.role === 'admin';

  const navigationLinks = [
    // Admin-only links
    ...(userProfile?.role === 'admin' ? [
      { label: 'Tableau de bord', path: '/team-dashboard', icon: BarChart3 },
      { label: 'Projets', path: '/project-management', icon: FolderKanban },
      { label: 'Catégories', path: '/category-administration', icon: Tag },
      { label: 'Collaborateurs', path: '/collaborator-management', icon: Users },
    ] : []),
    // Common links for all users
    { label: 'Mes saisies', path: '/personal-time-entries', icon: Clock },
    { label: 'Nouvelle saisie', path: '/time-entry-creation', icon: PlusCircle },
    { label: 'Import calendrier', path: '/calendar-import', icon: Calendar },
    { label: 'Réglages', path: '/user-settings', icon: Settings },
  ];

  const NavLink = ({ path, label, icon: Icon, mobile = false }) => {
    const isActive = location?.pathname === path;
    
    return (
      <Link
        to={path}
        onClick={() => mobile && setShowMobileMenu(false)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'text-foreground hover:bg-muted'
        } ${mobile ? 'w-full' : ''}`}
      >
        <Icon className="h-5 w-5" />
        <span className="font-medium">{label}</span>
      </Link>
    );
  };

  if (loading || !user) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <div className="flex items-center space-x-8">
            <button
              onClick={() => navigate(isAdmin ? '/team-dashboard' : '/personal-time-entries')}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <Clock className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground hidden sm:inline">
                Suivi du temps
              </span>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigationLinks?.map((link) => (
                <NavLink key={link?.path} {...link} />
              ))}
            </nav>
          </div>

          {/* Right Side - User Menu */}
          <div className="flex items-center space-x-4">
            {/* User Profile Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold">
                  <User className="h-5 w-5" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-foreground">
                    {userProfile?.nom_complet || user?.email?.split('@')?.[0]}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {userProfile?.role || 'standard'}
                  </p>
                </div>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-card rounded-lg shadow-lg border border-border py-2">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-medium text-foreground">
                      {userProfile?.nom_complet || 'Utilisateur'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {user?.email}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => {
                      navigate('/settings');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Réglages</span>
                  </button>
                  
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Se déconnecter</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            >
              {showMobileMenu ? (
                <X className="h-6 w-6 text-foreground" />
              ) : (
                <Menu className="h-6 w-6 text-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <nav className="lg:hidden py-4 border-t border-border space-y-2">
            {navigationLinks?.map((link) => (
              <NavLink key={link?.path} {...link} mobile />
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};

export default NavigationHeader;