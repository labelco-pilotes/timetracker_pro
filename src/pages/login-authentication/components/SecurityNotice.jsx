import React from 'react';
import Icon from '../../../components/AppIcon';

const SecurityNotice = () => {
  return (
    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
      <div className="flex items-start space-x-3">
        <Icon name="Shield" size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-700">
          <p className="font-medium mb-1">Sécurité et confidentialité</p>
          <p className="text-xs leading-relaxed">
            Vos données sont protégées par un chiffrement SSL. 
            Cette session sera automatiquement fermée après 30 minutes d'inactivité 
            pour garantir la sécurité de vos informations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SecurityNotice;