import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';

const ProjectTable = ({ 
  projects, 
  selectedProjects, 
  onSelectProject, 
  onSelectAll, 
  onEditProject, 
  onToggleStatus,
  searchTerm,
  onSearchChange 
}) => {
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedProjects = [...projects]?.sort((a, b) => {
    let aValue = a?.[sortField];
    let bValue = b?.[sortField];
    
    if (typeof aValue === 'string') {
      aValue = aValue?.toLowerCase();
      bValue = bValue?.toLowerCase();
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const filteredProjects = sortedProjects?.filter(project =>
    project?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
    project?.client?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
    project?.referent?.toLowerCase()?.includes(searchTerm?.toLowerCase())
  );

  const getStatusBadge = (status) => {
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        status === 'active' ?'bg-success text-success-foreground' :'bg-muted text-muted-foreground'
      }`}>
        <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          status === 'active' ? 'bg-success-foreground' : 'bg-muted-foreground'
        }`} />
        {status === 'active' ? 'Actif' : 'Inactif'}
      </span>
    );
  };

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <Icon name="ArrowUpDown" size={14} className="text-muted-foreground" />;
    }
    return sortDirection === 'asc' 
      ? <Icon name="ArrowUp" size={14} className="text-foreground" />
      : <Icon name="ArrowDown" size={14} className="text-foreground" />;
  };

  return (
    <div className="bg-card rounded-lg border border-border card-shadow">
      {/* Search Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Liste des projets</h3>
          <div className="flex items-center space-x-3">
            <Input
              type="search"
              placeholder="Rechercher un projet, client ou référent..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e?.target?.value)}
              className="w-80"
            />
            <span className="text-sm text-muted-foreground">
              {filteredProjects?.length} projet{filteredProjects?.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="w-12 px-4 py-3">
                <Checkbox
                  checked={selectedProjects?.length === filteredProjects?.length && filteredProjects?.length > 0}
                  onChange={onSelectAll}
                />
              </th>
              <th className="text-left px-4 py-3">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary nav-transition"
                >
                  <span>Nom du projet</span>
                  {getSortIcon('name')}
                </button>
              </th>
              <th className="text-left px-4 py-3">
                <button
                  onClick={() => handleSort('client')}
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary nav-transition"
                >
                  <span>Client</span>
                  {getSortIcon('client')}
                </button>
              </th>
              <th className="text-left px-4 py-3">
                <button
                  onClick={() => handleSort('referent')}
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary nav-transition"
                >
                  <span>Référent</span>
                  {getSortIcon('referent')}
                </button>
              </th>
              <th className="text-left px-4 py-3">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary nav-transition"
                >
                  <span>Statut</span>
                  {getSortIcon('status')}
                </button>
              </th>
              <th className="text-left px-4 py-3">
                <button
                  onClick={() => handleSort('teamCount')}
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary nav-transition"
                >
                  <span>Équipe</span>
                  {getSortIcon('teamCount')}
                </button>
              </th>
              <th className="text-left px-4 py-3">
                <button
                  onClick={() => handleSort('totalHours')}
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary nav-transition"
                >
                  <span>Heures</span>
                  {getSortIcon('totalHours')}
                </button>
              </th>
              <th className="text-right px-4 py-3">
                <span className="text-sm font-medium text-foreground">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects?.map((project) => (
              <tr key={project?.id} className="border-b border-border hover:bg-muted/30 nav-transition">
                <td className="px-4 py-3">
                  <Checkbox
                    checked={selectedProjects?.includes(project?.id)}
                    onChange={() => onSelectProject(project?.id)}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      project?.status === 'active' ? 'bg-success' : 'bg-muted-foreground'
                    }`} />
                    <div>
                      <div className="font-medium text-foreground">{project?.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Créé le {new Date(project.createdAt)?.toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-foreground">{project?.client}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                      <Icon name="User" size={12} color="white" />
                    </div>
                    <span className="text-sm text-foreground">{project?.referent}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {getStatusBadge(project?.status)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <Icon name="Users" size={14} className="text-muted-foreground" />
                    <span className="text-sm text-foreground">{project?.teamCount}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <Icon name="Clock" size={14} className="text-muted-foreground" />
                    <span className="text-sm text-foreground">{project?.totalHours}h</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleStatus(project?.id)}
                      title={project?.status === 'active' ? 'Désactiver' : 'Activer'}
                    >
                      <Icon 
                        name={project?.status === 'active' ? 'Pause' : 'Play'} 
                        size={14} 
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditProject(project)}
                      title="Modifier"
                    >
                      <Icon name="Edit" size={14} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filteredProjects?.length === 0 && (
        <div className="p-8 text-center">
          <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Aucun projet trouvé</h3>
          <p className="text-muted-foreground">
            {searchTerm 
              ? "Aucun projet ne correspond à votre recherche." :"Aucun projet n'a été créé pour le moment."
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default ProjectTable;