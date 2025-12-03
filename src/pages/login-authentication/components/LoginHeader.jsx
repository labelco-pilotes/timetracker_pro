import React from 'react';
import Icon from '../../../components/AppIcon';

const LoginHeader = () => {
  return (
    <div className="text-center mb-8">
      {/* Company Logo */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
          <Icon name="Clock" size={32} color="white" />
        </div>
      </div>

      {/* Application Title */}
      <h1 className="text-2xl font-semibold text-foreground mb-2">
        TimeTracker Pro
      </h1>
      
      {/* Subtitle */}
      <p className="text-muted-foreground text-sm">
        Connectez-vous à votre espace de suivi du temps
      </p>
    </div>
  );
};

export default LoginHeader;