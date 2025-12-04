import React, { useEffect, useState } from 'react';
import NavigationHeader from '../navigation-header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';

import { projetService } from '../../services/projetService';
import { categorieService } from '../../services/categorieService';

/**
 * Admin catégories :
 * - Choix du projet
 * - Liste des catégories de ce projet
 * - Création / modification branchées sur Supabase
 */

const CategoryAdministration = () => {
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState(null);

  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState(null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({ nom: '', description: '' });
  const [createErrors, setCreateErrors] = useState({});
  const [createLoading, setCreateLoading] = useState(false);

  const [editingCategory, setEditingCategory] = useState(null);
  const [editForm, setEditForm] = useState({ nom: '', description: '' });
  const [editErrors, setEditErrors] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  // 1. Charger les projets
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setProjectsLoading(true);
        setProjectsError(null);
        const data = await projetService.getAll();
        setProjects(data || []);
        if (data?.length > 0) {
          setSelectedProjectId(data[0].id);
        }
      } catch (error) {
        console.error('Erreur chargement projets', error);
        setProjectsError("Erreur lors du chargement des projets.");
      } finally {
        setProjectsLoading(false);
      }
    };

    loadProjects();
  }, []);

  // 2. Charger les catégories du projet sélectionné
  useEffect(() => {
    const loadCategories = async () => {
      if (!selectedProjectId) {
        setCategories([]);
        return;
      }

      try {
        setCategoriesLoading(true);
        setCategoriesError(null);
        const data = await categorieService.getAll(selectedProjectId);
        setCategories(data || []);
      } catch (error) {
        console.error('Erreur chargement catégories', error);
        setCategoriesError("Erreur lors du chargement des catégories.");
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, [selectedProjectId]);

  // Helpers
  const currentProject = projects?.find((p) => p.id === selectedProjectId) || null;

  const projectOptions = projects?.map((p) => ({
    value: p.id,
    label: p.nom,
  }));

  // ========= Création =========

  const openCreateForm = () => {
    setCreateForm({ nom: '', description: '' });
    setCreateErrors({});
    setShowCreateForm(true);
  };

  const validateCreate = () => {
    const errors = {};
    if (!createForm.nom?.trim()) {
      errors.nom = 'Le nom de la catégorie est obligatoire.';
    }
    if (!selectedProjectId) {
      errors.projet = 'Merci de sélectionner un projet.';
    }
    return errors;
  };

  const handleCreateSubmit = async (e) => {
    e?.preventDefault?.();
    const errors = validateCreate();
    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors);
      return;
    }

    try {
      setCreateLoading(true);
      const created = await categorieService.create({
        projetId: selectedProjectId,
        nom: createForm.nom.trim(),
        description: createForm.description?.trim() || null,
      });
      setCategories((prev) => [...prev, created]);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Erreur création catégorie', error);
      alert("Erreur lors de la création de la catégorie. Merci de réessayer.");
    } finally {
      setCreateLoading(false);
    }
  };

  // ========= Édition =========

  const openEdit = (cat) => {
    setEditingCategory(cat);
    setEditForm({
      nom: cat?.nom || '',
      description: cat?.description || '',
    });
    setEditErrors({});
  };

  const validateEdit = () => {
    const errors = {};
    if (!editForm.nom?.trim()) {
      errors.nom = 'Le nom de la catégorie est obligatoire.';
    }
    return errors;
  };

  const handleEditSubmit = async (e) => {
    e?.preventDefault?.();
    if (!editingCategory) return;

    const errors = validateEdit();
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    try {
      setEditLoading(true);
      const updated = await categorieService.update(editingCategory.id, {
        nom: editForm.nom.trim(),
        description: editForm.description?.trim() || null,
      });

      setCategories((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
      setEditingCategory(null);
    } catch (error) {
      console.error('Erreur mise à jour catégorie', error);
      alert("Erreur lors de la mise à jour de la catégorie. Merci de réessayer.");
    } finally {
      setEditLoading(false);
    }
  };

  const closeEdit = () => {
    setEditingCategory(null);
  };

  // ========= UI =========

  return (
    <>
      <NavigationHeader />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-start flex-col space-y-1">
            <h1 className="text-2xl font-semibold text-foreground">
              Gestion des catégories
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              Administrez les catégories de temps, projet par projet. Ces catégories
              sont utilisées dans les saisies de temps et doivent être cohérentes avec
              vos projets actifs.
            </p>
          </div>

          <Button
            variant="primary"
            iconName="Plus"
            iconPosition="left"
            onClick={openCreateForm}
            disabled={!selectedProjectId}
          >
            Nouvelle catégorie
          </Button>
        </div>

        {/* Sélecteur projet */}
        <section className="mb-4">
          <div className="bg-card border border-border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center space-x-3">
              <Icon name="Folders" size={20} className="text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Projet sélectionné
                </p>
                <p className="text-xs text-muted-foreground">
                  Choisissez un projet pour voir et modifier ses catégories.
                </p>
              </div>
            </div>

            <div className="w-full max-w-sm">
              {projectsLoading ? (
                <p className="text-sm text-muted-foreground">
                  Chargement des projets…
                </p>
              ) : projectsError ? (
                <p className="text-sm text-destructive">{projectsError}</p>
              ) : (
                <Select
                  label="Projet"
                  placeholder={
                    projectOptions?.length
                      ? 'Sélectionner un projet…'
                      : 'Aucun projet disponible'
                  }
                  value={selectedProjectId}
                  onChange={setSelectedProjectId}
                  options={projectOptions}
                  disabled={!projectOptions?.length}
                />
              )}
            </div>
          </div>
        </section>

        {/* Liste des catégories */}
        <section className="mt-4">
          {!selectedProjectId && !projectsLoading && (
            <div className="bg-card border border-dashed border-border rounded-lg p-6 text-center">
              <Icon
                name="ListTree"
                size={24}
                className="mx-auto mb-2 text-muted-foreground"
              />
              <p className="text-sm text-muted-foreground">
                Sélectionnez un projet pour afficher ses catégories.
              </p>
            </div>
          )}

          {selectedProjectId && (
            <>
              {categoriesLoading ? (
                <div className="text-sm text-muted-foreground">
                  Chargement des catégories…
                </div>
              ) : categoriesError ? (
                <div className="text-sm text-destructive">{categoriesError}</div>
              ) : categories?.length === 0 ? (
                <div className="bg-card border border-dashed border-border rounded-lg p-6 text-center">
                  <Icon
                    name="Braces"
                    size={24}
                    className="mx-auto mb-2 text-muted-foreground"
                  />
                  <p className="text-sm font-medium text-foreground mb-1">
                    Aucune catégorie pour ce projet
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Créez une première catégorie pour que l’équipe puisse l’utiliser
                    dans les saisies de temps.
                  </p>
                  <Button
                    variant="primary"
                    iconName="Plus"
                    iconPosition="left"
                    onClick={openCreateForm}
                  >
                    Créer une catégorie
                  </Button>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                  <table className="min-w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Nom
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Description
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((cat) => (
                        <tr
                          key={cat.id}
                          className="border-t border-border hover:bg-muted/40 transition-colors"
                        >
                          <td className="px-4 py-2 align-top">
                            <div className="flex items-center space-x-2">
                              <Icon
                                name="Braces"
                                size={16}
                                className="text-primary"
                              />
                              <span className="font-medium text-foreground">
                                {cat?.nom || 'Sans nom'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-2 align-top max-w-md">
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {cat?.description || '—'}
                            </p>
                          </td>
                          <td className="px-4 py-2 align-top text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              iconName="Pencil"
                              iconPosition="left"
                              onClick={() => openEdit(cat)}
                            >
                              Modifier
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* Formulaire création (petit drawer simple) */}
      {showCreateForm && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div
            className="flex-1 bg-black/30"
            onClick={() => setShowCreateForm(false)}
          />
          <div className="w-full max-w-md bg-card border-l border-border shadow-xl flex flex-col">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon name="Braces" size={18} className="text-primary" />
                <div>
                  <p className="text-xs uppercase text-muted-foreground">
                    Nouvelle catégorie
                  </p>
                  <h2 className="text-sm font-semibold text-foreground">
                    {currentProject?.nom || 'Projet non sélectionné'}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                className="p-1 rounded-md hover:bg-muted text-muted-foreground"
                onClick={() => setShowCreateForm(false)}
              >
                <Icon name="X" size={16} />
              </button>
            </div>

            <form
              onSubmit={handleCreateSubmit}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
            >
              {!selectedProjectId && (
                <div className="text-sm text-destructive mb-2">
                  Merci de sélectionner un projet avant de créer une catégorie.
                </div>
              )}

              <Input
                label="Nom de la catégorie"
                value={createForm.nom}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, nom: e.target.value }))
                }
                error={createErrors.nom}
                required
              />

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Description (facultatif)
                </label>
                <textarea
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  rows={4}
                  placeholder="Ex : Production, réunion, administratif, développement…"
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
            </form>

            <div className="px-4 py-3 border-t border-border flex items-center justify-end space-x-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowCreateForm(false)}
              >
                Annuler
              </Button>
              <Button
                type="button"
                variant="primary"
                iconName="Plus"
                iconPosition="left"
                loading={createLoading}
                onClick={handleCreateSubmit}
                disabled={!selectedProjectId}
              >
                Créer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Panneau édition */}
      {editingCategory && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="flex-1 bg-black/30" onClick={closeEdit} />
          <div className="w-full max-w-md bg-card border-l border-border shadow-xl flex flex-col">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon name="Braces" size={18} className="text-primary" />
                <div>
                  <p className="text-xs uppercase text-muted-foreground">
                    Modifier la catégorie
                  </p>
                  <h2 className="text-sm font-semibold text-foreground">
                    {editingCategory?.nom}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                className="p-1 rounded-md hover:bg-muted text-muted-foreground"
                onClick={closeEdit}
              >
                <Icon name="X" size={16} />
              </button>
            </div>

            <form
              onSubmit={handleEditSubmit}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
            >
              <Input
                label="Nom de la catégorie"
                value={editForm.nom}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, nom: e.target.value }))
                }
                error={editErrors.nom}
                required
              />

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Description
                </label>
                <textarea
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  rows={4}
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
            </form>

            <div className="px-4 py-3 border-t border-border flex items-center justify-end space-x-2">
              <Button type="button" variant="ghost" onClick={closeEdit}>
                Annuler
              </Button>
              <Button
                type="button"
                variant="primary"
                iconName="Save"
                iconPosition="left"
                loading={editLoading}
                onClick={handleEditSubmit}
              >
                Enregistrer
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CategoryAdministration;
