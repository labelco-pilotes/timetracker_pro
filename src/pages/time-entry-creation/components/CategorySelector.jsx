import React, { useEffect, useState } from 'react';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const CategorySelector = ({ 
  categories, 
  selectedProject, 
  selectedCategory, 
  onCategoryChange, 
  error 
}) => {
  const [filteredCategories, setFilteredCategories] = useState([]);

  useEffect(() => {
    if (selectedProject) {
      // 🔧 FIX: This correctly uses projetId (already properly mapped by service from projet_id)
      const projectCategories = categories?.filter(cat => cat?.projetId === selectedProject);
      setFilteredCategories(projectCategories);
      
      // Reset category if current selection doesn't belong to new project
      if (selectedCategory && !projectCategories?.find(cat => cat?.id === selectedCategory)) {
        onCategoryChange('');
      }
    } else {
      setFilteredCategories([]);
      onCategoryChange('');
    }
  }, [selectedProject, categories, selectedCategory, onCategoryChange]);

  // 🔧 FIX: Changed from category.name to category.nom (matches database schema)
  const categoryOptions = filteredCategories?.map(category => ({
    value: category?.id,
    label: category?.nom, // Changed from category.name
    description: category?.description || 'Catégorie de temps'
  }));

  return (
    <div className="space-y-2">
      <Select
        label="Catégorie *"
        description="Sélectionnez la catégorie de temps"
        placeholder={selectedProject ? "Choisir une catégorie..." : "Sélectionnez d'abord un projet"}
        options={categoryOptions}
        value={selectedCategory}
        onChange={onCategoryChange}
        error={error}
        required
        disabled={!selectedProject || filteredCategories?.length === 0}
        searchable
        className="w-full"
      />
      {/* 🔧 FIX: Better user feedback message */}
      {selectedProject && filteredCategories?.length === 0 && (
        <div className="flex items-center space-x-2 text-sm text-warning">
          <Icon name="AlertTriangle" size={14} />
          <span>Aucune catégorie disponible pour ce projet. Un administrateur doit créer des catégories pour ce projet.</span>
        </div>
      )}
    </div>
  );
};

export default CategorySelector;