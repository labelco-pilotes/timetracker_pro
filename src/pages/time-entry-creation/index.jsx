import React, { useState, useEffect } from 'react';
import NavigationHeader from '../navigation-header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import ProjectSelector from './components/ProjectSelector';
import CategorySelector from './components/CategorySelector';
import DurationInput from './components/DurationInput';
import DateSelector from './components/DateSelector';
import CommentsSection from './components/CommentsSection';
import QuickEntryToolbar from './components/QuickEntryToolbar';
import FormActions from './components/FormActions';
import ValidationSummary from './components/ValidationSummary';
import { useNavigate } from 'react-router-dom';
import { saisieTempsService } from '../../services/saisieTempsService';
import { projetService } from '../../services/projetService';
import { categorieService } from '../../services/categorieService';
import { useAuth } from '../../contexts/AuthContext';

const TimeEntryCreation = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Form state
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [duration, setDuration] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date()?.toISOString()?.split('T')?.[0]);
  const [comments, setComments] = useState('');
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // ✅ FIX: Replace mock data with real data from database
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // ✅ FIX: Fetch real projects and categories from database on mount
  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      try {
        const [projectsData, categoriesData] = await Promise.all([
          projetService?.getAll(),
          categorieService?.getAll()
        ]);
        setProjects(projectsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading data:', error);
        setErrors({ submit: 'Erreur lors du chargement des données. Veuillez réessayer.' });
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  // ✅ FIX: These can be derived from actual data but keeping mock for quick actions
  const recentProjects = projects?.slice(0, 3)?.map(p => ({ id: p?.id, name: p?.nom })) || [];

  const lastEntry = {
    projectId: projects?.[0]?.id || '',
    projectName: projects?.[0]?.nom || '',
    categoryId: categories?.[0]?.id || '', 
    categoryName: categories?.[0]?.nom || '',
    duration: "2.5",
    date: "2024-11-17",
    comments: "Dernière saisie"
  };

  // Track unsaved changes
  useEffect(() => {
    const hasChanges = selectedProject || selectedCategory || duration || comments || 
                      selectedDate !== new Date()?.toISOString()?.split('T')?.[0];
    setHasUnsavedChanges(hasChanges);
  }, [selectedProject, selectedCategory, duration, comments, selectedDate]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event?.ctrlKey || event?.metaKey) {
        if (event?.key === 's') {
          event?.preventDefault();
          handleSave();
        } else if (event?.key === 'Enter') {
          event?.preventDefault();
          handleSaveAndContinue();
        }
      } else if (event?.key === 'Escape') {
        handleCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedProject, selectedCategory, duration, selectedDate]);

  // Auto-save functionality
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const autoSaveTimer = setTimeout(() => {
      const formData = {
        selectedProject,
        selectedCategory, 
        duration,
        selectedDate,
        comments,
        timestamp: Date.now()
      };
      localStorage.setItem('timeEntry-autoSave', JSON.stringify(formData));
    }, 2000);

    return () => clearTimeout(autoSaveTimer);
  }, [selectedProject, selectedCategory, duration, selectedDate, comments, hasUnsavedChanges]);

  // Load auto-saved data on mount
  useEffect(() => {
    const autoSaved = localStorage.getItem('timeEntry-autoSave');
    if (autoSaved) {
      try {
        const data = JSON.parse(autoSaved);
        // Only load if saved within last hour
        if (Date.now() - data?.timestamp < 3600000) {
          setSelectedProject(data?.selectedProject || '');
          setSelectedCategory(data?.selectedCategory || '');
          setDuration(data?.duration || '');
          setSelectedDate(data?.selectedDate || new Date()?.toISOString()?.split('T')?.[0]);
          setComments(data?.comments || '');
        }
      } catch (error) {
        console.error('Error loading auto-saved data:', error);
      }
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!selectedProject) {
      newErrors.project = 'Veuillez sélectionner un projet';
    }

    if (!selectedCategory) {
      newErrors.category = 'Veuillez sélectionner une catégorie';
    }

    if (!duration) {
      newErrors.duration = 'Veuillez saisir une durée';
    } else {
      const durationNum = parseFloat(duration);
      if (isNaN(durationNum) || durationNum <= 0) {
        newErrors.duration = 'La durée doit être supérieure à 0';
      } else if (durationNum > 24) {
        newErrors.duration = 'La durée ne peut pas dépasser 24 heures';
      }
    }

    if (!selectedDate) {
      newErrors.date = 'Veuillez sélectionner une date';
    } else {
      const entryDate = new Date(selectedDate);
      const today = new Date();
      if (entryDate > today) {
        newErrors.date = 'La date ne peut pas être dans le futur';
      }
    }

    // Validate project-category relationship
    if (selectedProject && selectedCategory) {
      const category = categories?.find(c => c?.id === selectedCategory);
      if (!category || category?.projetId !== selectedProject) {
        newErrors.category = 'Cette catégorie ne correspond pas au projet sélectionné';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const resetForm = () => {
    setSelectedProject('');
    setSelectedCategory('');
    setDuration('');
    setSelectedDate(new Date()?.toISOString()?.split('T')?.[0]);
    setComments('');
    setErrors({});
    setHasUnsavedChanges(false);
    localStorage.removeItem('timeEntry-autoSave');
  };

  // ✅ FIX: Replace simulated save with actual Supabase call
  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // ✅ FIX: Actually save to database using saisieTempsService
      await saisieTempsService?.create({
        projetId: selectedProject || null,
        categorieId: selectedCategory || null,
        date: selectedDate,
        dureeHeures: parseFloat(duration),
        commentaire: comments || null
      });
      
      setShowSuccess(true);
      resetForm();
      
      setTimeout(() => {
        setShowSuccess(false);
        navigate('/personal-time-entries');
      }, 2000);
    } catch (error) {
      console.error('Error saving time entry:', error);
      setErrors({ submit: `Erreur lors de la sauvegarde: ${error?.message || 'Veuillez réessayer.'}` });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ FIX: Replace simulated save with actual Supabase call
  const handleSaveAndContinue = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // ✅ FIX: Actually save to database using saisieTempsService
      await saisieTempsService?.create({
        projetId: selectedProject || null,
        categorieId: selectedCategory || null,
        date: selectedDate,
        dureeHeures: parseFloat(duration),
        commentaire: comments || null
      });
      
      setShowSuccess(true);
      
      // Reset form but keep project and category for quick re-entry
      const currentProject = selectedProject;
      const currentCategory = selectedCategory;
      resetForm();
      setSelectedProject(currentProject);
      setSelectedCategory(currentCategory);
      
      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error saving time entry:', error);
      setErrors({ submit: `Erreur lors de la sauvegarde: ${error?.message || 'Veuillez réessayer.'}` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('Vous avez des modifications non sauvegardées. Voulez-vous vraiment annuler ?')) {
        resetForm();
        navigate('/personal-time-entries');
      }
    } else {
      navigate('/personal-time-entries');
    }
  };

  const handleQuickProjectSelect = (project) => {
    setSelectedProject(project?.id);
    setSelectedCategory(''); // Reset category when project changes
  };

  const handleDuplicateLastEntry = () => {
    setSelectedProject(lastEntry?.projectId);
    setSelectedCategory(lastEntry?.categoryId);
    setDuration(lastEntry?.duration);
    setComments(lastEntry?.comments);
    // Keep current date for new entry
  };

  // ✅ FIX: Show loading state while fetching data
  if (loadingData) {
    return (
      <>
        <NavigationHeader />
        <div className="min-h-screen bg-background pt-20 px-4 flex items-center justify-center">
          <div className="text-center">
            <Icon name="Loader" size={48} className="animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Chargement des données...</p>
          </div>
        </div>
      </>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-background pt-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-success/10 border border-success/20 p-8 rounded-lg text-center space-y-4">
            <Icon name="CheckCircle" size={48} className="text-success mx-auto" />
            <h2 className="text-xl font-semibold text-success">Saisie enregistrée avec succès !</h2>
            <p className="text-muted-foreground">
              Votre saisie de temps a été enregistrée et sera visible dans vos saisies personnelles.
            </p>
            <div className="flex justify-center space-x-4 pt-4">
              <Button
                variant="default"
                onClick={() => setShowSuccess(false)}
                iconName="Plus"
                iconPosition="left"
              >
                Nouvelle saisie
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/personal-time-entries')}
                iconName="ArrowLeft"
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
                <Icon name="Plus" size={28} />
                <span>Nouvelle saisie de temps</span>
              </h1>
              <p className="text-muted-foreground mt-1">
                Enregistrez votre temps de travail sur vos projets
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

          {/* Error display */}
          {errors?.submit && (
            <div className="bg-error/10 border border-error/20 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Icon name="AlertCircle" size={16} className="text-error" />
                <span className="text-error font-medium">{errors?.submit}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick entry toolbar */}
              <QuickEntryToolbar
                recentProjects={recentProjects}
                onQuickProjectSelect={handleQuickProjectSelect}
                onDuplicateLastEntry={handleDuplicateLastEntry}
                lastEntry={lastEntry}
              />

              {/* Form fields */}
              <div className="bg-card p-6 rounded-lg border border-border card-shadow space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Project selection */}
                  <ProjectSelector
                    projects={projects}
                    selectedProject={selectedProject}
                    onProjectChange={setSelectedProject}
                    error={errors?.project}
                  />

                  {/* Category selection */}
                  <CategorySelector
                    categories={categories}
                    selectedProject={selectedProject}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    error={errors?.category}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Duration input */}
                  <DurationInput
                    duration={duration}
                    onDurationChange={setDuration}
                    error={errors?.duration}
                  />

                  {/* Date selection */}
                  <DateSelector
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
                    error={errors?.date}
                  />
                </div>

                {/* Comments section */}
                <CommentsSection
                  comments={comments}
                  onCommentsChange={setComments}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Validation summary */}
              <ValidationSummary
                selectedProject={selectedProject}
                selectedCategory={selectedCategory}
                duration={duration}
                selectedDate={selectedDate}
                comments={comments}
                projects={projects}
                categories={categories}
              />

              {/* Form actions */}
              <div className="bg-card p-6 rounded-lg border border-border card-shadow">
                <FormActions
                  onSave={handleSave}
                  onSaveAndContinue={handleSaveAndContinue}
                  onCancel={handleCancel}
                  isLoading={isLoading}
                  hasUnsavedChanges={hasUnsavedChanges}
                />
              </div>

              {/* Help section */}
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <h3 className="text-sm font-medium text-foreground flex items-center space-x-2">
                  <Icon name="HelpCircle" size={16} />
                  <span>Aide</span>
                </h3>
                <div className="text-xs text-muted-foreground space-y-2">
                  <p>• Sélectionnez d'abord un projet, puis une catégorie associée</p>
                  <p>• La durée peut être saisie en heures décimales (ex: 1.5 pour 1h30)</p>
                  <p>• Les commentaires sont optionnels mais recommandés</p>
                  <p>• Vos données sont sauvegardées automatiquement</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TimeEntryCreation;