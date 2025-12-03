import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const QuickActionButton = ({ 
  isMobile = false,
  className = '',
  onClick,
  disabled = false 
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate('/time-entry-creation');
    }
  };

  // Keyboard shortcut handler
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event?.ctrlKey || event?.metaKey) && event?.key === 'n') {
        event?.preventDefault();
        if (!disabled) {
          handleClick();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [disabled]);

  if (isMobile) {
    return (
      <Button
        variant="default"
        size="icon"
        onClick={handleClick}
        disabled={disabled}
        className={`fixed bottom-6 right-6 z-150 w-14 h-14 rounded-full modal-shadow ${className}`}
        title="Nouvelle saisie (Ctrl+N)"
      >
        <Icon name="Plus" size={24} />
      </Button>
    );
  }

  return (
    <Button
      variant="default"
      size="sm"
      onClick={handleClick}
      disabled={disabled}
      className={`w-full ${className}`}
      title="Nouvelle saisie (Ctrl+N)"
    >
      <Icon name="Plus" size={16} />
      <span className="ml-2">Nouvelle saisie</span>
    </Button>
  );
};

export default QuickActionButton;