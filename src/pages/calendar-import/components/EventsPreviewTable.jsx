import React from 'react';
import Icon from '../../../components/AppIcon';
import { Checkbox } from '../../../components/ui/Checkbox';

const EventsPreviewTable = ({
  events,
  selectedEvents,
  onToggleEvent,
  onToggleAll,
  onUpdateComment,
  onUpdateDuration,
  projects = [],
  categories = [],
  onUpdateProject,
  onUpdateCategory,
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '—';

    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const allSelected =
    events?.length > 0 && selectedEvents?.size === events?.length;
  const someSelected =
    selectedEvents?.size > 0 && !allSelected;

  return (
    <div className="bg-card rounded-lg border border-border card-shadow overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted/30">
        <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
          <Icon name="List" size={20} />
          <span>Aperçu des événements</span>
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Sélectionnez les événements à importer, ajustez la durée et associez un projet / une
          catégorie si besoin.
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={onToggleAll}
                  label=""
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                Date
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                Heure
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                Durée (h)
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                Projet
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                Catégorie
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                Commentaire
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {events?.map((event) => {
              const isSelected = selectedEvents?.has(event?.id);
              const eventProjectId = event?.projetId || '';

              // Catégories filtrées par projet
              const projectCategories =
                categories?.filter((cat) =>
                  eventProjectId
                    ? String(cat?.projetId) === String(eventProjectId)
                    : false
                ) || [];

              return (
                <tr
                  key={event?.id}
                  className={`hover:bg-muted/30 transition-colors ${
                    isSelected ? 'bg-primary/5' : ''
                  }`}
                >
                  {/* Checkbox ligne */}
                  <td className="px-4 py-3 align-top">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => onToggleEvent(event?.id)}
                      label=""
                    />
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3 align-top text-sm text-foreground whitespace-nowrap">
                    {formatDate(event?.date)}
                  </td>

                  {/* Heure */}
                  <td className="px-4 py-3 align-top text-sm text-muted-foreground whitespace-nowrap">
                    {event?.startTime && event?.endTime
                      ? `${event?.startTime} – ${event?.endTime}`
                      : '—'}
                  </td>

                  {/* Durée */}
                  <td className="px-4 py-3 align-top">
                    <input
                      type="number"
                      step="0.25"
                      min="0"
                      value={event?.duration ?? ''}
                      onChange={(e) =>
                        onUpdateDuration &&
                        onUpdateDuration(event?.id, e.target.value)
                      }
                      className="w-20 px-2 py-1 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </td>

                  {/* Projet */}
                  <td className="px-4 py-3 align-top">
                    <select
                      className="w-48 px-2 py-1 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={eventProjectId}
                      onChange={(e) =>
                        onUpdateProject &&
                        onUpdateProject(event?.id, e.target.value)
                      }
                    >
                      <option value="">— Sélectionner —</option>
                      {projects?.map((project) => (
                        <option key={project?.id} value={project?.id}>
                          {project?.nom}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Catégorie */}
                  <td className="px-4 py-3 align-top">
                    <select
                      className="w-48 px-2 py-1 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={event?.categorieId || ''}
                      onChange={(e) =>
                        onUpdateCategory &&
                        onUpdateCategory(event?.id, e.target.value)
                      }
                    >
                      <option value="">— Choisir —</option>
                      {projectCategories?.map((category) => (
                        <option key={category?.id} value={category?.id}>
                          {category?.nom}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Commentaire */}
                  <td className="px-4 py-3 align-top">
                    <input
                      type="text"
                      value={event?.comment || ''}
                      onChange={(e) =>
                        onUpdateComment &&
                        onUpdateComment(event?.id, e.target.value)
                      }
                      className="w-full px-2 py-1 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="Ajouter un commentaire..."
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Aucun événement */}
      {(!events || events.length === 0) && (
        <div className="p-8 text-center text-muted-foreground">
          <Icon name="Calendar" size={48} className="mx-auto mb-3 opacity-50" />
          <p>Aucun événement à afficher</p>
          <p className="text-sm mt-1">
            Chargez d&apos;abord les événements depuis votre calendrier
          </p>
        </div>
      )}
    </div>
  );
};

export default EventsPreviewTable;
