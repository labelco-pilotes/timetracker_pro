import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationHeader from '../navigation-header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import IcsUrlInput from './components/IcsUrlInput';
import WeekSelector from './components/WeekSelector';
import EventsPreviewTable from './components/EventsPreviewTable';
import { supabase } from '../../lib/supabase';
import ICAL from 'ical.js';
import { saisieTempsService } from '../../services/saisieTempsService';
import { useAuth } from '../../contexts/AuthContext';

const CalendarImport = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Form state
  const [icsUrl, setIcsUrl] = useState('');
  const [selectedWeek, setSelectedWeek] = useState('');
  const [events, setEvents] = useState([]);
  const [selectedEvents, setSelectedEvents] = useState(new Set());
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  const handleLoadEvents = async () => {
    if (!icsUrl?.trim()) {
      setErrors({ url: 'Veuillez saisir une URL .ics valide' });
      return;
    }

    if (!selectedWeek) {
      setErrors({ week: 'Veuillez sélectionner une semaine' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Call backend Edge Function instead of direct fetch
      const { data, error } = await supabase?.functions?.invoke('import-ics', {
        body: { icsUrl }
      });

      if (error) {
        console.error('Edge Function error:', error);
        throw new Error(error.message || 'Erreur lors de la récupération du calendrier');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data?.rawIcs) {
        throw new Error('Aucune donnée reçue du serveur');
      }

      const icsData = data?.rawIcs;
      
      // BUG FIX: Removed dynamic import - now using static import at the top
      // This fixes "B.parse is not a function" error that occurred with: await import('ical.js')
      const jcalData = ICAL?.parse(icsData);
      const comp = new ICAL.Component(jcalData);
      const vevents = comp?.getAllSubcomponents('vevent');

      // Get week start and end dates
      const [year, week] = selectedWeek?.split('-W');
      const weekStart = getWeekStartDate(parseInt(year), parseInt(week));
      const weekEnd = new Date(weekStart);
      weekEnd?.setDate(weekEnd?.getDate() + 7);

      // Parse events for the selected week
      const parsedEvents = vevents
        ?.map((vevent, index) => {
          const event = new ICAL.Event(vevent);
          const startDate = new Date(event?.startDate?.toJSDate());
          const endDate = new Date(event?.endDate?.toJSDate());
          
          // Check if event is in selected week
          if (startDate < weekStart || startDate >= weekEnd) {
            return null;
          }

          // Calculate duration in decimal hours
          const durationMs = endDate - startDate;
          const durationHours = (durationMs / (1000 * 60 * 60))?.toFixed(2);

          // Build comment with title and location
          let comment = event?.summary || '';
          if (event?.location) {
            comment += ` – ${event?.location}`;
          }

          return {
            id: `event-${index}`,
            date: startDate?.toISOString()?.split('T')?.[0],
            startTime: startDate?.toTimeString()?.substring(0, 5),
            endTime: endDate?.toTimeString()?.substring(0, 5),
            duration: durationHours,
            comment: comment,
            summary: event?.summary || '',
            location: event?.location || ''
          };
        })
        ?.filter(Boolean);

      if (parsedEvents?.length === 0) {
        setErrors({ events: 'Aucun événement trouvé pour cette semaine dans ce calendrier.' });
        setEvents([]);
      } else {
        setEvents(parsedEvents);
        // Select all events by default
        setSelectedEvents(new Set(parsedEvents?.map(e => e?.id)));
      }
    } catch (error) {
      console.error('Error loading events:', error);
      setErrors({ 
        load: error?.message || 'Erreur lors du chargement des événements. Vérifiez l\'URL et réessayez.' 
      });
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportEvents = async () => {
    const eventsToImport = events?.filter(e => selectedEvents?.has(e?.id));
    
    if (eventsToImport?.length === 0) {
      setErrors({ import: 'Veuillez sélectionner au moins un événement à importer' });
      return;
    }

    // Validate that all selected events have duration > 0
    const invalidEvents = eventsToImport?.filter(e => parseFloat(e?.duration) <= 0);
    if (invalidEvents?.length > 0) {
      setErrors({ import: 'Tous les événements doivent avoir une durée supérieure à 0' });
      return;
    }

    setIsImporting(true);
    setErrors({});

    try {
      // 🔥 BUG FIX: Actually save entries to database instead of just simulating success
      // Previous code had a TODO and setTimeout - entries were never saved!
      // Now using saisieTempsService.create() to properly save each imported event

      const importPromises = eventsToImport?.map(async (event) => {
        try {
          // Create SaisieTemps entry with:
          // - collaborateur: current authenticated user (from auth.uid())
          // - date: event date
          // - dureeHeures: event duration (validated > 0)
          // - commentaire: event summary + location
          // - projet: null (user will complete later in "Mes saisies")
          // - categorie: null (user will complete later in "Mes saisies")
          await saisieTempsService?.create({
            date: event?.date,
            dureeHeures: parseFloat(event?.duration),
            commentaire: event?.comment,
            projetId: null,      // Allows creation without project (as per requirements)
            categorieId: null    // Allows creation without category (as per requirements)
          });
        } catch (entryError) {
          console.error(`Erreur lors de l'import de l'événement ${event?.id}:`, entryError);
          throw entryError;
        }
      });

      // Wait for all imports to complete
      await Promise.all(importPromises);
      
      setShowSuccess(true);
      
      // Clear form after successful import
      setTimeout(() => {
        setShowSuccess(false);
        setIcsUrl('');
        setSelectedWeek('');
        setEvents([]);
        setSelectedEvents(new Set());
      }, 3000);
    } catch (error) {
      console.error('Error importing events:', error);
      setErrors({ 
        import: `Erreur lors de l'importation: ${error?.message || 'Veuillez réessayer.'}`
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleToggleEvent = (eventId) => {
    const newSelected = new Set(selectedEvents);
    if (newSelected?.has(eventId)) {
      newSelected?.delete(eventId);
    } else {
      newSelected?.add(eventId);
    }
    setSelectedEvents(newSelected);
  };

  const handleToggleAll = () => {
    if (selectedEvents?.size === events?.length) {
      setSelectedEvents(new Set());
    } else {
      setSelectedEvents(new Set(events?.map(e => e?.id)));
    }
  };

  const handleUpdateEventComment = (eventId, newComment) => {
    setEvents(events?.map(e => 
      e?.id === eventId ? { ...e, comment: newComment } : e
    ));
  };

  const handleUpdateEventDuration = (eventId, newDuration) => {
    setEvents(events?.map(e => 
      e?.id === eventId ? { ...e, duration: newDuration } : e
    ));
  };

  // Helper function to get week start date
  const getWeekStartDate = (year, week) => {
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dow = simple?.getDay();
    const ISOweekStart = simple;
    if (dow <= 4) {
      ISOweekStart?.setDate(simple?.getDate() - simple?.getDay() + 1);
    } else {
      ISOweekStart?.setDate(simple?.getDate() + 8 - simple?.getDay());
    }
    return ISOweekStart;
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-background pt-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-success/10 border border-success/20 p-8 rounded-lg text-center space-y-4">
            <Icon name="CheckCircle" size={48} className="text-success mx-auto" />
            <h2 className="text-xl font-semibold text-success">
              Import réussi !
            </h2>
            <p className="text-muted-foreground">
              Les événements sélectionnés ont été importés comme saisies de temps. 
              Vous pouvez maintenant compléter les projets et catégories dans la page "Mes saisies".
            </p>
            <div className="flex justify-center space-x-4 pt-4">
              <Button
                variant="default"
                onClick={() => setShowSuccess(false)}
                iconName="Upload"
                iconPosition="left"
              >
                Nouvel import
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/personal-time-entries')}
                iconName="List"
                iconPosition="left"
              >
                Voir mes saisies
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <NavigationHeader />
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground flex items-center space-x-3">
                <Icon name="Upload" size={28} />
                <span>Import calendrier</span>
              </h1>
              <p className="text-muted-foreground mt-1">
                Importez vos événements Outlook (.ics) comme saisies de temps
              </p>
            </div>
            
            <Button
              variant="ghost"
              onClick={() => navigate('/personal-time-entries')}
              iconName="ArrowLeft"
              iconPosition="left"
            >
              Retour
            </Button>
          </div>

          {/* Help notice */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <Icon name="Info" size={20} className="text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Comment ça marche ?</p>
                <p>
                  Le nom de l'événement sera utilisé comme commentaire. Vous pourrez ensuite 
                  compléter le projet et la catégorie dans la page "Mes saisies".
                </p>
              </div>
            </div>
          </div>

          {/* Error display */}
          {(errors?.url || errors?.week || errors?.load || errors?.import || errors?.events) && (
            <div className="bg-error/10 border border-error/20 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Icon name="AlertCircle" size={16} className="text-error" />
                <span className="text-error font-medium">
                  {errors?.url || errors?.week || errors?.load || errors?.import || errors?.events}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Input section */}
            <div className="bg-card p-6 rounded-lg border border-border card-shadow space-y-6">
              <IcsUrlInput
                value={icsUrl}
                onChange={setIcsUrl}
                error={errors?.url}
              />

              <WeekSelector
                value={selectedWeek}
                onChange={setSelectedWeek}
                error={errors?.week}
              />

              <div className="flex justify-end">
                <Button
                  variant="default"
                  onClick={handleLoadEvents}
                  disabled={isLoading || !icsUrl?.trim() || !selectedWeek}
                  iconName="Download"
                  iconPosition="left"
                >
                  {isLoading ? 'Chargement...' : 'Charger les événements'}
                </Button>
              </div>
            </div>

            {/* Events preview table */}
            {events?.length > 0 && (
              <>
                <EventsPreviewTable
                  events={events}
                  selectedEvents={selectedEvents}
                  onToggleEvent={handleToggleEvent}
                  onToggleAll={handleToggleAll}
                  onUpdateComment={handleUpdateEventComment}
                  onUpdateDuration={handleUpdateEventDuration}
                />

                {/* Import actions */}
                <div className="bg-card p-6 rounded-lg border border-border card-shadow">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {selectedEvents?.size}
                      </span> événement(s) sélectionné(s) sur {events?.length}
                    </div>
                    
                    <Button
                      variant="default"
                      onClick={handleImportEvents}
                      disabled={isImporting || selectedEvents?.size === 0}
                      iconName="Upload"
                      iconPosition="left"
                    >
                      {isImporting ? 'Import en cours...' : 'Créer les saisies de temps sélectionnées'}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CalendarImport;