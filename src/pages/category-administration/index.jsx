import React, { useState, useEffect } from 'react';
import NavigationHeader from '../navigation-header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import ProjectSelector from './components/ProjectSelector';
import CategoryTreeView from './components/CategoryTreeView';
import CategoryDetailEditor from './components/CategoryDetailEditor';
import BulkOperationsPanel from './components/BulkOperationsPanel';
import CategoryUsageChart from './components/CategoryUsageChart';

const CategoryAdministration = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showChart, setShowChart] = useState(false);
  const [chartType, setChartType] = useState('bar');
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState('projects'); // 'projects', 'categories', 'details'

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Event listeners for chart type changes
  useEffect(() => {
    const handleChartTypeChange = (event) => {
      setChartType(event?.detail);
    };

    const handleClearSelection = () => {
      setSelectedCategories([]);
    };

    window.addEventListener('changeChartType', handleChartTypeChange);
    window.addEventListener('clearSelection', handleClearSelection);

    return () => {
      window.removeEventListener('changeChartType', handleChartTypeChange);
      window.removeEventListener('clearSelection', handleClearSelection);
    };
  }, []);

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setSelectedCategory(null);
    setSelectedCategories([]);
    if (isMobile) {
      setMobileView('categories');
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    if (isMobile) {
      setMobileView('details');
    }
  };

  const handleCreateProject = (projectData) => {
    console.log('Creating project:', projectData);
    // In real app, this would make an API call
  };

  const handleCreateCategory = (projectId) => {
    console.log('Creating category for project:', projectId);
    // In real app, this would open a create category modal
  };

  const handleCreateSubcategory = (parentId) => {
    console.log('Creating subcategory for parent:', parentId);
    // In real app, this would create a subcategory
  };

  const handleUpdateCategory = (categoryId, updates) => {
    console.log('Updating category:', categoryId, updates);
    // In real app, this would make an API call
  };

  const handleDeleteCategory = (categoryId) => {
    console.log('Deleting category:', categoryId);
    setSelectedCategory(null);
    if (isMobile) {
      setMobileView('categories');
    }
  };

  const handleBulkUpdate = (categoryIds, updates) => {
    console.log('Bulk updating categories:', categoryIds, updates);
    setSelectedCategories([]);
  };

  const handleBulkDelete = (categoryIds) => {
    console.log('Bulk deleting categories:', categoryIds);
    setSelectedCategories([]);
  };

  const handleBulkMove = (categoryIds, targetProjectId) => {
    console.log('Moving categories to project:', categoryIds, targetProjectId);
    setSelectedCategories([]);
  };

  const toggleChart = () => {
    setShowChart(!showChart);
  };

  // Mobile navigation
  const renderMobileNavigation = () => (
    <div className="flex items-center justify-between p-4 bg-card border-b border-border lg:hidden">
      <div className="flex items-center space-x-2">
        {mobileView === 'categories' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileView('projects')}
            iconName="ChevronLeft"
          />
        )}
        {mobileView === 'details' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileView('categories')}
            iconName="ChevronLeft"
          />
        )}
        <h1 className="text-lg font-semibold text-foreground">
          {mobileView === 'projects' && 'Projets'}
          {mobileView === 'categories' && 'Catégories'}
          {mobileView === 'details' && 'Détails'}
        </h1>
      </div>

      <div className="flex items-center space-x-2">
        {selectedProject && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleChart}
            iconName="BarChart3"
          />
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.history?.back()}
          iconName="X"
        />
      </div>
    </div>
  );

  // Desktop layout
  const renderDesktopLayout = () => (
    <div className="flex h-full">
      {/* Left Panel - Project Selector (20%) */}
      <div className="w-1/5 min-w-64">
        <ProjectSelector
          selectedProject={selectedProject}
          onProjectSelect={handleProjectSelect}
          onCreateProject={handleCreateProject}
        />
      </div>

      {/* Center Panel - Category Tree (40%) */}
      <div className="w-2/5">
        <CategoryTreeView
          selectedProject={selectedProject}
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
          onCreateCategory={handleCreateCategory}
          onDeleteCategory={handleDeleteCategory}
          onUpdateCategory={handleUpdateCategory}
        />
      </div>

      {/* Right Panel - Details or Chart (40%) */}
      <div className="w-2/5">
        {showChart ? (
          <div className="h-full p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Statistiques</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleChart}
                iconName="X"
              />
            </div>
            <CategoryUsageChart
              selectedProject={selectedProject}
              chartType={chartType}
            />
          </div>
        ) : (
          <CategoryDetailEditor
            selectedCategory={selectedCategory}
            selectedProject={selectedProject}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
            onCreateSubcategory={handleCreateSubcategory}
          />
        )}
      </div>
    </div>
  );

  // Mobile layout
  const renderMobileLayout = () => (
    <div className="h-full">
      {mobileView === 'projects' && (
        <ProjectSelector
          selectedProject={selectedProject}
          onProjectSelect={handleProjectSelect}
          onCreateProject={handleCreateProject}
        />
      )}

      {mobileView === 'categories' && (
        <CategoryTreeView
          selectedProject={selectedProject}
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
          onCreateCategory={handleCreateCategory}
          onDeleteCategory={handleDeleteCategory}
          onUpdateCategory={handleUpdateCategory}
        />
      )}

      {mobileView === 'details' && (
        <>
          {showChart ? (
            <div className="h-full p-4">
              <CategoryUsageChart
                selectedProject={selectedProject}
                chartType={chartType}
              />
            </div>
          ) : (
            <CategoryDetailEditor
              selectedCategory={selectedCategory}
              selectedProject={selectedProject}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
              onCreateSubcategory={handleCreateSubcategory}
            />
          )}
        </>
      )}
    </div>
  );

  return (
    <>
      <NavigationHeader />
      <div className="min-h-screen bg-background p-6">
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between p-6 bg-card border-b border-border">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Administration des catégories</h1>
            <p className="text-muted-foreground mt-1">
              Gérez les catégories de temps par projet et organisez votre structure de facturation
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {selectedProject && (
              <Button
                variant="outline"
                onClick={toggleChart}
                iconName="BarChart3"
                iconPosition="left"
              >
                {showChart ? 'Masquer' : 'Statistiques'}
              </Button>
            )}
            
            <Button
              variant="default"
              onClick={() => handleCreateCategory(selectedProject?.id)}
              disabled={!selectedProject}
              iconName="Plus"
              iconPosition="left"
            >
              Nouvelle catégorie
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobile && renderMobileNavigation()}

        {/* Main Content */}
        <div className="h-full" style={{ height: 'calc(100vh - 64px)' }}>
          {isMobile ? renderMobileLayout() : renderDesktopLayout()}
        </div>

        {/* Bulk Operations Panel */}
        <BulkOperationsPanel
          selectedCategories={selectedCategories}
          onBulkUpdate={handleBulkUpdate}
          onBulkDelete={handleBulkDelete}
          onBulkMove={handleBulkMove}
          availableProjects={[
            { id: 1, name: "Site E-commerce Luxe" },
            { id: 2, name: "Application Mobile Banking" },
            { id: 3, name: "Plateforme CRM Interne" }
          ]}
        />

        {/* Mobile Quick Actions */}
        {isMobile && selectedProject && mobileView === 'categories' && (
          <Button
            variant="default"
            size="icon"
            onClick={() => handleCreateCategory(selectedProject?.id)}
            className="fixed bottom-6 right-6 z-150 w-14 h-14 rounded-full modal-shadow"
          >
            <Icon name="Plus" size={24} />
          </Button>
        )}
      </div>
    </>
  );
};

export default CategoryAdministration;