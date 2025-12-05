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
import { projetService } from '../../services/projetService';
import { categorieService } from '../../services/categorieService';

const CalendarImport = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Form state
  const [icsUrl, setIcsUrl] = useState('');
  const [selectedWeek, setSelectedWeek] = useState('');
  const [events, setEvents] = useState([]);
  const [selectedEvents, setSelectedEvents] = useState(new Set());

  // Métadonnées pour les menus déroulants
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Charger projets & catégories dès que la page s’ouvre
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [allProjects, allCategories] = await Promise.all([
          projetService?.getAll(),
          categorieService?.getAll(),
        ]);
        setProjects(allProjects || []);
        setCategories(allCategories || []);
      } catch (error) {
        console.error('[CalendarImport] Erreur chargement projets/catégories', error);
      }
    };

    loadMetadata();
  }, []);

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
      // Appel de l’Edge Function import-ics (déjà existante)
      const { data, error } = await supabase?.functions?.invoke('import-ics', {
        body: { icsUrl },
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

      // Parsing ICS via ical.js
      const jcalData = ICAL?.parse(icsData);
      const comp = new ICAL.Component(jcalData);
      const vevents = comp?.getAllSubcomponents('vevent');

      // Période de la semaine sélectionnée
      const [year, week] = selectedWeek?.split('-W');
      const weekStart = getWeekStartDate(parseInt(year, 10), parseInt(week, 10));
      const weekEnd = new Date(weekStart);
      weekEnd?.setDate(weekEnd?.getDate() + 7);

      // Parsing des événements dans la semaine
      const parsedEvents =
        vevents
          ?.map((vevent, index) => {
            const event = new ICAL.Event(vevent);
            const startDate = new Date(event?.startDate?.toJSDate());
            const endDate = new Date(event?.endDate?.toJSDate());

            if (Number.isNaN(startDate?.getTime()) || Number.isNaN(endDate?.getTime())) {
              return null;
            }

            // Filtre sur la semaine sélectionnée
            if (startDate < weekStart || startDate >= weekEnd) {
              return null;
            }

            // Durée en heures décimales
            const durationMs = endDate - startDate;
            const durationHours = (durationMs / (1000 * 60 * 60))?.toFixed(2);

            // Commentaire = titre + lieu
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
              location: event?.location || '',
              // nouveaux champs pour les menus déroulants
              projetId: null,
              categorieId: null,
            };
          })
          ?.filter(Boolean) || [];

      if (parsedEvents?.length === 0) {
        setErrors({ events: 'Aucun événement trouvé pour cette semaine dans ce calendrier.' });
        setEvents([]);
      } else {
        setEvents(parsedEvents);
        // Tous sélectionnés par défaut
        setSelectedEvents(new Set(parsedEvents?.map((e) => e?.id)));
      }
    } catch (error) {
      console.error('Error loading events:', error);
      setErrors({
        load: error?.message || 'Erreur lors du chargement des événements. Veuillez réessayer.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportEvents = async () => {
    const eventsToImport = events?.filter((e) => selectedEvents?.has(e?.id));

    if (eventsToImport?.length === 0) {
      setErrors({ import: 'Veuillez sélectionner au moins un événement à importer' });
      return;
    }

    // Durée > 0 pour tous les événements sélectionnés
    const invalidEvents = eventsToImport?.filter((e) => parseFloat(e?.duration) <= 0);
    if (invalidEvents?.length > 0) {
      setErrors({ import: 'Tous les événements doivent avoir une durée supérieure à 0' });
      return;
    }

    setIsImporting(true);
    setErrors({});

    try {
      const importPromises = eventsToImport?.map(async (event) => {
        try {
          await saisieTempsService?.create({
            date: event?.date,
            dureeHeures: parseFloat(event?.duration),
            commentaire: event?.comment,
            // IMPORTANT : on garde les IDs tels quels (UUID string)
            projetId: event?.projetId ?? null,
            categorieId: event?.categorieId ?? null,
          });
        } catch (entryError) {
          console.error(`Erreur lors de l'import de l'événement ${event?.id}:`, entryError);
          throw entryError;
        }
      });

      await Promise.all(importPromises);

      setShowSuccess(true);
      setEvents([]);
      setSelectedEvents(new Set());
    } catch (error) {
      console.error('Error importing events:', error);
      setErrors({
        import: `Erreur lors de l'importation: ${
          error?.message || 'Veuillez réessayer.'
        }`,
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
      setSelectedEvents(new Set(events?.map((e) => e?.id)));
    }
  };

  const handleUpdateEventComment = (eventId, newComment) => {
    setEvents(events?.map((e) => (e?.id === eventId ? { ...e, comment: newComment } : e)));
  };

  const handleUpdateEventDuration = (eventId, newDuration) => {
    setEvents(events?.map((e) => (e?.id === eventId ? { ...e, duration: newDuration } : e)));
  };

  // 🔴 CORRIGÉ : on ne fait plus Number(newProjectId), on garde la string (UUID)
  const handleUpdateEventProject = (eventId, newProjectId) => {
    setEvents(
      events?.map((e) =>
        e?.id === eventId
          ? {
              ...e,
              // on garde l’ID tel quel (string), surtout pas Number()
              projetId: newProjectId || null,
              // si on change de projet -> on remet la catégorie à null
              categorieId: null,
            }
          : e,
      ),
    );
  };

  // 🔴 CORRIGÉ : idem pour la catégorie
  const handleUpdateEventCategory = (eventId, newCategoryId) => {
    setEvents(
      events?.map((e) =>
        e?.id === eventId
          ? {
              ...e,
              categorieId: newCategoryId || null,
            }
          : e,
      ),
    );
  };

  const getWeekStartDate = (year, week) => {
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dow = simple?.getDay();
    const ISOweekStart = new Date(simple);
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
            <h2 className="text-xl font-semibold text-success">Import réussi !</h2>
            <p className="text-muted-foreground">
              Les événements sélectionnés ont été importés comme saisies de temps. Vous pouvez
              maintenant les consulter dans la page &quot;Mes saisies&quot;.
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
      <NavigationHeader
        title="Import calendrier"
        description="Importez vos événements Outlook / Google Calendar comme saisies de temps."
      />

      <div className="min-h-screen bg-background pt-20 px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Import de calendrier</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Collez l&apos;URL publique de votre calendrier au format .ics, sélectionnez une
                semaine et importez les événements comme saisies de temps.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-6 items-start">
            {/* Contenu principal */}
            <div className="space-y-4">
              {/* Erreurs globales */}
              {(errors?.url ||
                errors?.week ||
                errors?.load ||
                errors?.import ||
                errors?.events) && (
                <div className="bg-error/10 border border-error/20 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Icon name="AlertCircle" size={16} className="text-error" />
                    <span className="text-error font-medium">
                      {errors?.url ||
                        errors?.week ||
                        errors?.load ||
                        errors?.import ||
                        errors?.events}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {/* Formulaire URL + semaine */}
                <div className="bg-card p-6 rounded-lg border border-border card-shadow space-y-6">
                  <IcsUrlInput value={icsUrl} onChange={setIcsUrl} error={errors?.url} />

                  <WeekSelector
                    value={selectedWeek}
                    onChange={setSelectedWeek}
                    error={errors?.week}
                  />

                  <div className="flex justify-end">
                    <Button
                      variant="default"
                      onClick={handleLoadEvents}
                      disabled={isLoading}
                      iconName="Download"
                      iconPosition="left"
                    >
                      {isLoading ? 'Chargement...' : 'Charger les événements'}
                    </Button>
                  </div>
                </div>

                {/* Tableau des événements */}
                {events?.length > 0 && (
                  <>
                    <EventsPreviewTable
                      events={events}
                      selectedEvents={selectedEvents}
                      onToggleEvent={handleToggleEvent}
                      onToggleAll={handleToggleAll}
                      onUpdateComment={handleUpdateEventComment}
                      onUpdateDuration={handleUpdateEventDuration}
                      projects={projects}
                      categories={categories}
                      onUpdateProject={handleUpdateEventProject}
                      onUpdateCategory={handleUpdateEventCategory}
                    />

                    {/* Résumé & bouton d'import */}
                    <div className="bg-card p-4 rounded-lg border border-border card-shadow flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {selectedEvents?.size}
                        </span>{' '}
                        événement(s) sélectionné(s) sur {events?.length}
                      </div>

                      <Button
                        variant="default"
                        onClick={handleImportEvents}
                        disabled={isImporting || selectedEvents?.size === 0}
                        iconName="Upload"
                        iconPosition="left"
                      >
                        {isImporting
                          ? 'Import en cours...'
                          : 'Créer les saisies de temps sélectionnées'}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Panneau d’aide */}
            <div className="bg-card p-6 rounded-lg border border-border card-shadow space-y-6">
              <div className="flex items-center space-x-2">
                <Icon name="Info" size={18} className="text-primary" />
                <h2 className="text-sm font-semibold text-foreground">Comment ça marche ?</h2>
              </div>

              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  1. Copiez l&apos;URL publique de votre calendrier Outlook ou Google au format
                  <span className="font-mono bg-muted px-1 rounded ml-1">.ics</span> (commençant par
                  <span className="font-mono bg-muted px-1 rounded ml-1">https://</span> ou
                  <span className="font-mono bg-muted px-1 rounded ml-1">webcal://</span>).
                </p>
                <p>2. Choisissez la semaine que vous souhaitez importer.</p>
                <p>3. Cliquez sur &quot;Charger les événements&quot; pour voir un aperçu.</p>
                <p>
                  4. Sélectionnez les événements à importer, ajustez la durée et associez un projet
                  / une catégorie si nécessaire.
                </p>
                <p>
                  5. Cliquez sur &quot;Créer les saisies de temps sélectionnées&quot; pour
                  enregistrer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CalendarImport;
