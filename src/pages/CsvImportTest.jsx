import React, { useState, useEffect, useRef } from 'react';
import NavigationHeader from './navigation-header';
import Icon from '../components/AppIcon';
import Button from '../components/ui/Button';
import { projetService } from '../services/projetService';
import { categorieService } from '../services/categorieService';
import { saisieTempsService } from '../services/saisieTempsService';

/**
 * Page TEMPORAIRE pour importer un CSV de test :
 * Colonnes attendues : Date, User, Project, Task, Decimal Hours
 *
 * - Project  -> projet
 * - Task     -> catégorie
 */
const CsvImportTest = () => {
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState(null);

  // caches persos via useRef pour ne PAS recréer projet/catégorie à chaque ligne
  const projectsByNameRef = useRef({});
  const categoriesByKeyRef = useRef({}); // key = `${projetId}__${nomCat}`

  // Charger les projets + catégories existants pour faire la correspondance par nom
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [allProjects, allCategories] = await Promise.all([
          projetService.getAll(),
          categorieService.getAll(),
        ]);

        const projMap = {};
        (allProjects || []).forEach((p) => {
          if (p?.nom) {
            projMap[p.nom.trim()] = p;
          }
        });

        const catMap = {};
        (allCategories || []).forEach((c) => {
          if (c?.nom && c?.projetId) {
            const key = `${c.projetId}__${c.nom.trim()}`;
            catMap[key] = c;
          }
        });

        projectsByNameRef.current = projMap;
        categoriesByKeyRef.current = catMap;
      } catch (e) {
        console.error('[CsvImportTest] Erreur chargement meta', e);
        setError("Erreur lors du chargement des projets / catégories existants.");
      }
    };

    loadMetadata();
  }, []);

  const appendLog = (msg) => {
    setLogs((prev) => [...prev, msg]);
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setRows([]);
    setLogs([]);
    setError(null);

    if (f) {
      parseFile(f);
    }
  };

  const parseFile = (file) => {
    setIsParsing(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target.result;

        // On suppose un CSV simple, séparateur = ','
        // Header attendu : Date,User,Project,Task, Decimal Hours
        const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
        if (lines.length <= 1) {
          setError("Le fichier ne contient aucune ligne de données.");
          setIsParsing(false);
          return;
        }

        const header = lines[0].split(',').map((h) => h.trim());
        const expected = ['Date', 'User', 'Project', 'Task', 'Decimal Hours'];

        const normalizedHeader = header.map((h) => h.replace(/"/g, ''));

        const missing = expected.filter((col) => !normalizedHeader.includes(col));
        if (missing.length > 0) {
          setError(
            `Colonnes manquantes dans le CSV : ${missing.join(
              ', ',
            )}. En-tête trouvé : ${normalizedHeader.join(', ')}`,
          );
          setIsParsing(false);
          return;
        }

        const idx = {};
        expected.forEach((col) => {
          idx[col] = normalizedHeader.indexOf(col);
        });

        const parsedRows = lines.slice(1).map((line, i) => {
          const parts = line.split(',');
          if (parts.length < expected.length) {
            return null;
          }

          const safe = (j) =>
            parts[j] !== undefined ? parts[j].replace(/"/g, '').trim() : '';

          return {
            _line: i + 2, // numéro de ligne dans le fichier (à partir de 1)
            date: safe(idx['Date']),
            user: safe(idx['User']),
            project: safe(idx['Project']),
            task: safe(idx['Task']),
            decimalHours: safe(idx['Decimal Hours']),
          };
        });

        const cleaned = parsedRows.filter((r) => r && r.date && r.project && r.task);

        setRows(cleaned);
        appendLog(`Fichier chargé : ${cleaned.length} lignes valides.`);
      } catch (err) {
        console.error('[CsvImportTest] parse error', err);
        setError("Erreur lors de la lecture du fichier CSV.");
      } finally {
        setIsParsing(false);
      }
    };

    reader.onerror = () => {
      setError("Erreur de lecture du fichier.");
      setIsParsing(false);
    };

    reader.readAsText(file, 'UTF-8');
  };

  const getOrCreateProject = async (projectName) => {
    const name = (projectName || '').trim();
    if (!name) return null;

    const map = projectsByNameRef.current;

    // déjà en cache ?
    if (map[name]) {
      return map[name];
    }

    // Créer le projet si non existant
    const created = await projetService.create({
      nom: name,
      description: null,
      status: 'active',
    });

    map[name] = created; // on met à jour le cache local
    appendLog(`Projet créé : ${name}`);

    return created;
  };

  const getOrCreateCategory = async (projetId, categoryName) => {
    const name = (categoryName || '').trim();
    if (!name || !projetId) return null;

    const key = `${projetId}__${name}`;
    const map = categoriesByKeyRef.current;

    // déjà en cache ?
    if (map[key]) {
      return map[key];
    }

    const created = await categorieService.create({
      projetId,
      nom: name,
      description: null,
    });

    map[key] = created;
    appendLog(`Catégorie créée : ${name} (projetId=${projetId})`);

    return created;
  };

  const handleImport = async () => {
    if (!rows.length) {
      setError("Aucune ligne à importer. Charge d'abord un CSV.");
      return;
    }

    setIsImporting(true);
    setError(null);
    setLogs((prev) => [...prev, '----- Début import -----']);

    try {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];

        const date = row.date; // déjà au format YYYY-MM-DD dans ton CSV
        const projectName = row.project;
        const taskName = row.task;
        const decimal = row.decimalHours ? row.decimalHours.replace(',', '.') : '0';
        const dureeHeures = parseFloat(decimal) || 0;

        if (!date || !projectName || !taskName || dureeHeures <= 0) {
          appendLog(
            `Ligne ${row._line} ignorée (valeurs manquantes ou durée <= 0).`,
          );
          continue;
        }

        // 1) projet (réutilise le même objet pour toutes les lignes de ce projet)
        const projet = await getOrCreateProject(projectName);
        if (!projet?.id) {
          appendLog(
            `Ligne ${row._line} : impossible de récupérer/créer le projet "${projectName}".`,
          );
          continue;
        }

        // 2) catégorie (task -> categorie) réutilisée pour ce projet
        const categorie = await getOrCreateCategory(projet.id, taskName);

        // 3) création de la saisie de temps
        // ⚠️ collaborateur_id = utilisateur connecté (cf. saisieTempsService.create)
        await saisieTempsService.create({
          projetId: projet.id,
          categorieId: categorie?.id || null,
          date,
          dureeHeures,
          commentaire: `${row.user || ''} - ${taskName}`,
        });

        appendLog(
          `Ligne ${row._line} importée : ${date} / ${projectName} / ${taskName} / ${dureeHeures}h`,
        );
      }

      appendLog('✅ Import terminé.');
    } catch (err) {
      console.error('[CsvImportTest] import error', err);
      setError(
        err?.message || 'Erreur lors de la création des saisies de temps.',
      );
      appendLog('❌ Import interrompu suite à une erreur.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      <NavigationHeader
        title="Import CSV (TEST)"
        description="Page temporaire pour importer un CSV Date / Project / Task / Decimal Hours."
      />

      <div className="min-h-screen bg-background pt-20 px-4">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                Import CSV de test
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Utilisez cette page uniquement pour tester l&apos;import de vos
                données CSV (Project = projet, Task = catégorie). Vous pourrez
                supprimer ce fichier ensuite.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-6 items-start">
            {/* Zone de gauche */}
            <div className="space-y-4">
              {error && (
                <div className="bg-error/10 border border-error/20 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Icon name="AlertCircle" size={18} className="text-error" />
                    <span className="text-sm text-error font-medium">
                      {error}
                    </span>
                  </div>
                </div>
              )}

              <div className="bg-card p-6 rounded-lg border border-border card-shadow space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Fichier CSV
                  </label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Format attendu : Date, User, Project, Task, Decimal Hours
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-muted-foreground">
                    {file
                      ? `Fichier sélectionné : ${file.name}`
                      : 'Aucun fichier sélectionné'}
                    {rows.length > 0 && (
                      <span className="ml-2">
                        — {rows.length} ligne(s) prêtes à être importées
                      </span>
                    )}
                  </div>

                  <Button
                    variant="default"
                    onClick={handleImport}
                    disabled={isParsing || isImporting || !rows.length}
                    iconName="Upload"
                    iconPosition="left"
                  >
                    {isImporting
                      ? 'Import en cours...'
                      : 'Importer les saisies de temps'}
                  </Button>
                </div>
              </div>

              {/* Aperçu des premières lignes */}
              {rows.length > 0 && (
                <div className="bg-card p-4 rounded-lg border border-border card-shadow">
                  <h2 className="text-sm font-semibold text-foreground mb-3">
                    Aperçu des premières lignes
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/50 border-b border-border">
                        <tr>
                          <th className="px-2 py-1 text-left">Ligne</th>
                          <th className="px-2 py-1 text-left">Date</th>
                          <th className="px-2 py-1 text-left">User</th>
                          <th className="px-2 py-1 text-left">Project</th>
                          <th className="px-2 py-1 text-left">Task</th>
                          <th className="px-2 py-1 text-left">Heures</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.slice(0, 10).map((r) => (
                          <tr key={r._line} className="border-b border-border/60">
                            <td className="px-2 py-1">{r._line}</td>
                            <td className="px-2 py-1">{r.date}</td>
                            <td className="px-2 py-1">{r.user}</td>
                            <td className="px-2 py-1">{r.project}</td>
                            <td className="px-2 py-1">{r.task}</td>
                            <td className="px-2 py-1">{r.decimalHours}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Zone de droite : logs */}
            <div className="bg-card p-6 rounded-lg border border-border card-shadow space-y-3">
              <div className="flex items-center space-x-2">
                <Icon name="Info" size={18} className="text-primary" />
                <h2 className="text-sm font-semibold text-foreground">
                  Journal d&apos;import
                </h2>
              </div>
              <div className="h-72 overflow-auto text-xs font-mono bg-muted/40 border border-border rounded p-2 whitespace-pre-wrap">
                {logs.length === 0 ? (
                  <span className="text-muted-foreground">
                    Les messages d&apos;import apparaîtront ici...
                  </span>
                ) : (
                  logs.map((l, i) => <div key={i}>{l}</div>)
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Cette page est conçue comme un outil de test temporaire. Une
                fois vos essais terminés, vous pouvez supprimer le fichier{' '}
                <span className="font-mono">src/pages/CsvImportTest.jsx</span> et
                la route associée.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CsvImportTest;
