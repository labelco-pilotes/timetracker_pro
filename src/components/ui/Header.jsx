import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigationItems = [
    { label: 'Tableau de bord', path: '/team-dashboard', icon: 'BarChart3' },
    { label: 'Nouvelle saisie', path: '/time-entry-creation', icon: 'Plus' },
    { label: 'Mes saisies', path: '/personal-time-entries', icon: 'Clock' },
    { label: 'Projets', path: '/project-management', icon: 'FolderOpen' },
  ];

  const moreItems = [
    { label: 'Catégories', path: '/category-administration', icon: 'Tags' },
  ];

  const isActivePath = (path) => {
    return location?.pathname === path;
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-100 bg-card border-b border-border sidebar-shadow">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Logo */}
        <div className="flex items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <Icon name="Clock" size={20} color="white" />
            </div>
            <span className="text-xl font-semibold text-foreground">TimeTracker Pro</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navigationItems?.map((item) => (
            <a
              key={item?.path}
              href={item?.path}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium nav-transition ${
                isActivePath(item?.path)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon name={item?.icon} size={16} />
              <span>{item?.label}</span>
            </a>
          ))}
          
          {/* More Menu */}
          <div className="relative group">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2"
            >
              <Icon name="MoreHorizontal" size={16} />
              <span>Plus</span>
            </Button>
            
            <div className="absolute right-0 top-full mt-1 w-48 bg-popover border border-border rounded-md modal-shadow opacity-0 invisible group-hover:opacity-100 group-hover:visible nav-transition">
              <div className="py-1">
                {moreItems?.map((item) => (
                  <a
                    key={item?.path}
                    href={item?.path}
                    className={`flex items-center space-x-3 px-4 py-2 text-sm nav-transition ${
                      isActivePath(item?.path)
                        ? 'bg-accent text-accent-foreground'
                        : 'text-popover-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon name={item?.icon} size={16} />
                    <span>{item?.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </nav>

        {/* User Profile */}
        <div className="hidden md:flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-sm font-medium text-foreground">Marie Dubois</div>
              <div className="text-xs text-muted-foreground">Administrateur</div>
            </div>
            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
              <Icon name="User" size={16} color="white" />
            </div>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={toggleMobileMenu}
        >
          <Icon name={mobileMenuOpen ? "X" : "Menu"} size={20} />
        </Button>
      </div>
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-card border-t border-border">
          <div className="px-4 py-2 space-y-1">
            {[...navigationItems, ...moreItems]?.map((item) => (
              <a
                key={item?.path}
                href={item?.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium nav-transition ${
                  isActivePath(item?.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon name={item?.icon} size={16} />
                <span>{item?.label}</span>
              </a>
            ))}
            
            {/* Mobile User Profile */}
            <div className="flex items-center space-x-3 px-4 py-3 mt-4 border-t border-border">
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                <Icon name="User" size={16} color="white" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">Marie Dubois</div>
                <div className="text-xs text-muted-foreground">Administrateur</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;