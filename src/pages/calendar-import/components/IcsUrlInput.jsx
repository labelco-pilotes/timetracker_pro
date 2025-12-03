import React from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';

const IcsUrlInput = ({ value, onChange, error }) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground flex items-center space-x-2">
        <Icon name="Link" size={16} />
        <span>URL du calendrier .ics</span>
        <span className="text-error">*</span>
      </label>
      
      <Input
        type="url"
        value={value}
        onChange={(e) => onChange(e?.target?.value)}
        placeholder="https://outlook.office365.com/owa/calendar/... ou webcal://..."
        className={error ? 'border-error' : ''}
      />
      
      {error && (
        <p className="text-xs text-error flex items-center space-x-1">
          <Icon name="AlertCircle" size={12} />
          <span>{error}</span>
        </p>
      )}
      
      <div className="text-xs text-muted-foreground space-y-1">
        <p className="font-medium">
          Utilisez un lien de calendrier Outlook au format .ics accessible publiquement (sans connexion).
        </p>
        <p>
          Vérifiez que le lien commence par <span className="font-mono bg-muted px-1 rounded">https://</span> ou <span className="font-mono bg-muted px-1 rounded">webcal://</span>
        </p>
        <p>
          💡 <span className="font-medium">Astuce :</span> Vous pouvez tester le lien dans une fenêtre de navigation privée : 
          s'il ne télécharge pas un fichier .ics, l'import ne fonctionnera pas.
        </p>
      </div>
    </div>
  );
};

export default IcsUrlInput;