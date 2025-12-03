import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const CategoryTreeView = ({ 
  selectedProject, 
  selectedCategory, 
  onCategorySelect, 
  onCreateCategory,
  onDeleteCategory,
  onUpdateCategory 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState('');

  // Mock category data with hierarchical structure
  const categories = selectedProject ? [
    {
      id: 1,
      name: "Développement Frontend",
      description: "Interface utilisateur et expérience client",
      projectId: selectedProject?.id,
      parentId: null,
      isActive: true,
      totalHours: 125.5,
      entryCount: 45,
      billingCode: "DEV-FRONT",
      children: [
        {
          id: 11,
          name: "Intégration HTML/CSS",
          description: "Conversion des maquettes en code",
          projectId: selectedProject?.id,
          parentId: 1,
          isActive: true,
          totalHours: 68.25,
          entryCount: 22,
          billingCode: "DEV-HTML"
        },
        {
          id: 12,
          name: "Développement React",
          description: "Composants et logique métier",
          projectId: selectedProject?.id,
          parentId: 1,
          isActive: true,
          totalHours: 57.25,
          entryCount: 23,
          billingCode: "DEV-REACT"
        }
      ]
    },
    {
      id: 2,
      name: "Développement Backend",
      description: "API et logique serveur",
      projectId: selectedProject?.id,
      parentId: null,
      isActive: true,
      totalHours: 89.75,
      entryCount: 31,
      billingCode: "DEV-BACK",
      children: [
        {
          id: 21,
          name: "API REST",
          description: "Endpoints et services web",
          projectId: selectedProject?.id,
          parentId: 2,
          isActive: true,
          totalHours: 45.5,
          entryCount: 18,
          billingCode: "DEV-API"
        },
        {
          id: 22,
          name: "Base de données",
          description: "Modélisation et requêtes",
          projectId: selectedProject?.id,
          parentId: 2,
          isActive: true,
          totalHours: 44.25,
          entryCount: 13,
          billingCode: "DEV-DB"
        }
      ]
    },
    {
      id: 3,
      name: "Tests et Qualité",
      description: "Tests automatisés et validation",
      projectId: selectedProject?.id,
      parentId: null,
      isActive: true,
      totalHours: 34.5,
      entryCount: 12,
      billingCode: "TEST",
      children: []
    },
    {
      id: 4,
      name: "Gestion de Projet",
      description: "Coordination et suivi",
      projectId: selectedProject?.id,
      parentId: null,
      isActive: false,
      totalHours: 22.0,
      entryCount: 8,
      billingCode: "MGMT",
      children: []
    }
  ] : [];

  const toggleExpanded = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded?.has(categoryId)) {
      newExpanded?.delete(categoryId);
    } else {
      newExpanded?.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const startEditing = (category) => {
    setEditingCategory(category?.id);
    setEditName(category?.name);
  };

  const saveEdit = () => {
    if (editName?.trim()) {
      onUpdateCategory(editingCategory, { name: editName?.trim() });
    }
    setEditingCategory(null);
    setEditName('');
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setEditName('');
  };

  const filterCategories = (categories, searchTerm) => {
    if (!searchTerm) return categories;
    
    return categories?.filter(category => {
      const matchesSearch = category?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                           category?.description?.toLowerCase()?.includes(searchTerm?.toLowerCase());
      const hasMatchingChildren = category?.children && 
                                 filterCategories(category?.children, searchTerm)?.length > 0;
      return matchesSearch || hasMatchingChildren;
    })?.map(category => ({
      ...category,
      children: category?.children ? filterCategories(category?.children, searchTerm) : []
    }));
  };

  const renderCategory = (category, level = 0) => {
    const hasChildren = category?.children && category?.children?.length > 0;
    const isExpanded = expandedCategories?.has(category?.id);
    const isSelected = selectedCategory?.id === category?.id;
    const isEditing = editingCategory === category?.id;

    return (
      <div key={category?.id}>
        <div
          className={`flex items-center p-2 rounded-md cursor-pointer nav-transition ${
            isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
          }`}
          style={{ paddingLeft: `${12 + level * 20}px` }}
        >
          {/* Expand/Collapse Button */}
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e?.stopPropagation();
                toggleExpanded(category?.id);
              }}
              className="w-6 h-6 p-0 mr-2"
            >
              <Icon 
                name="ChevronRight" 
                size={14} 
                className={`transform nav-transition ${isExpanded ? 'rotate-90' : ''}`}
              />
            </Button>
          )}

          {!hasChildren && <div className="w-8" />}

          {/* Category Icon */}
          <div className={`w-6 h-6 rounded flex items-center justify-center mr-3 ${
            category?.isActive 
              ? isSelected ? 'bg-success' : 'bg-success' : isSelected ?'bg-muted' : 'bg-muted'
          }`}>
            <Icon 
              name="Tag" 
              size={12} 
              color={category?.isActive ? 'white' : 'gray'}
            />
          </div>

          {/* Category Content */}
          <div 
            className="flex-1 min-w-0"
            onClick={() => onCategorySelect(category)}
          >
            {isEditing ? (
              <div className="flex items-center space-x-2" onClick={(e) => e?.stopPropagation()}>
                <Input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e?.target?.value)}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e?.key === 'Enter') saveEdit();
                    if (e?.key === 'Escape') cancelEdit();
                  }}
                  autoFocus
                />
                <Button variant="ghost" size="sm" onClick={saveEdit}>
                  <Icon name="Check" size={14} />
                </Button>
                <Button variant="ghost" size="sm" onClick={cancelEdit}>
                  <Icon name="X" size={14} />
                </Button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between">
                  <h4 className={`text-sm font-medium truncate ${
                    isSelected ? 'text-primary-foreground' : 'text-foreground'
                  }`}>
                    {category?.name}
                  </h4>
                  
                  <div className="flex items-center space-x-2">
                    {/* Quick Actions */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e?.stopPropagation();
                        startEditing(category);
                      }}
                      className="w-6 h-6 p-0 opacity-0 group-hover:opacity-100"
                    >
                      <Icon name="Edit2" size={12} />
                    </Button>

                    {category?.entryCount === 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e?.stopPropagation();
                          onDeleteCategory(category?.id);
                        }}
                        className="w-6 h-6 p-0 opacity-0 group-hover:opacity-100 text-error hover:text-error"
                      >
                        <Icon name="Trash2" size={12} />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-1">
                  <p className={`text-xs truncate ${
                    isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
                  }`}>
                    {category?.description}
                  </p>
                  
                  <div className="flex items-center space-x-3 text-xs">
                    <span className={`flex items-center space-x-1 ${
                      isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
                    }`}>
                      <Icon name="Clock" size={10} />
                      <span>{category?.totalHours}h</span>
                    </span>
                    <span className={`flex items-center space-x-1 ${
                      isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
                    }`}>
                      <Icon name="Hash" size={10} />
                      <span>{category?.entryCount}</span>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Children Categories */}
        {hasChildren && isExpanded && (
          <div className="ml-4">
            {category?.children?.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const filteredCategories = filterCategories(categories, searchTerm);

  if (!selectedProject) {
    return (
      <div className="h-full flex flex-col bg-card border-r border-border">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Icon name="FolderOpen" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Sélectionnez un projet pour voir ses catégories</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-card border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Catégories</h2>
            <p className="text-sm text-muted-foreground">{selectedProject?.name}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCreateCategory(selectedProject?.id)}
            iconName="Plus"
            iconPosition="left"
          >
            Nouvelle
          </Button>
        </div>

        {/* Search */}
        <Input
          type="search"
          placeholder="Rechercher une catégorie..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e?.target?.value)}
        />
      </div>
      {/* Category Tree */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1 group">
          {filteredCategories?.map(category => renderCategory(category))}
        </div>

        {filteredCategories?.length === 0 && (
          <div className="p-8 text-center">
            <Icon name="Tags" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-2">
              {searchTerm ? 'Aucune catégorie trouvée' : 'Aucune catégorie dans ce projet'}
            </p>
            {!searchTerm && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCreateCategory(selectedProject?.id)}
              >
                Créer la première catégorie
              </Button>
            )}
          </div>
        )}
      </div>
      {/* Footer Stats */}
      <div className="p-4 border-t border-border bg-muted/50">
        <div className="text-xs text-muted-foreground">
          <div className="flex justify-between mb-1">
            <span>Total catégories:</span>
            <span className="font-medium">{categories?.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Catégories actives:</span>
            <span className="font-medium text-success">
              {categories?.filter(c => c?.isActive)?.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryTreeView;