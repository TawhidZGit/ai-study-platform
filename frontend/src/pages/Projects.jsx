import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import ThemeToggle from '../components/ThemeToggle'; 
import { 
  WandSparkles, Plus, FolderOpen, FileText, StickyNote, Loader2, 
  Trash2, Settings, Edit2, ChevronDown, 
  Calendar, ArrowUpNarrowWide, ArrowDownNarrowWide, Type, Clock,
  Search, LayoutGrid, List as ListIcon, X,
} from 'lucide-react';

const Projects = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Data State
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);

  // Filter state
  const [sortBy, setSortBy] = useState('updated'); 
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);

  // Filter Options Definition
  const sortOptions = [
    { id: 'updated', label: 'Last Updated', icon: Calendar },
    { id: 'newest', label: 'Newest Created', icon: ArrowDownNarrowWide },
    { id: 'oldest', label: 'Oldest Created', icon: ArrowUpNarrowWide },
    { id: 'name', label: 'Name (A-Z)', icon: Type },
  ];

  const currentSort = sortOptions.find(o => o.id === sortBy);

  useEffect(() => {
    fetchProjects();
  }, []);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data.projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 1. Filter by Search Query
  const filteredProjects = useMemo(() => {
    return projects.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [projects, searchQuery]);

  // 2. Sort the Filtered Results
  const sortedProjects = useMemo(() => {
    return [...filteredProjects].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'updated':
        default:
          return new Date(b.updated_at) - new Date(a.updated_at);
      }
    });
  }, [filteredProjects, sortBy]);

  // Handle Create/Edit Open
  const openCreateModal = () => {
    setProjectToEdit(null);
    setIsModalOpen(true);
  };

  const openEditModal = (project) => {
    setProjectToEdit(project);
    setIsModalOpen(true);
  };

  // Handle Modal Submit
  const handleProjectSaved = (savedProject, isEdit) => {
    if (isEdit) {
      setProjects(prev => prev.map(p => {
        if (p.id === savedProject.id) {
          return {
            ...savedProject,
            source_count: p.source_count || 0,
            note_count: p.note_count || 0
          };
        }
        return p;
      }));
    } else {
      const newProject = { ...savedProject, source_count: 0, note_count: 0 };
      setProjects(prev => [newProject, ...prev]);
      navigate(`/workspace/${savedProject.id}`);
    }
    setIsModalOpen(false);
  };

  const handleDeleteProject = async (projectId) => {
    if (!confirm('Are you sure? This will delete all sources, notes, and chat history.')) {
      return;
    }

    try {
      await api.delete(`/projects/${projectId}`);
      setProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-100 selection:text-indigo-700 transition-colors duration-300">
      
      {/* Header */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <WandSparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-none">SynthLearn</h1>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Workspace</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <ThemeToggle />

            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-rose-600 hover:border-rose-100 transition-all text-sm font-medium shadow-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Page Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">My Projects</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Manage your research, notes, and AI conversations.</p>
          </div>
          
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95 transition-all duration-200 font-medium"
          >
            <Plus className="h-5 w-5" />
            <span>Create Project</span>
          </button>
        </div>

        {/* Filters Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {/* Functional Search Bar */}
          <div className="relative flex-1 w-full sm:max-w-xs ml-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..." 
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/20 rounded-lg text-sm text-slate-900 dark:text-white transition-all outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto pr-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-2 hidden sm:block">Sort By</span>
            
            {/* Aesthetic Filter Dropdown */}
            <div className="relative flex-1 sm:flex-none" ref={filterRef}>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="w-full sm:w-auto flex items-center justify-between gap-3 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all text-sm font-medium text-slate-600 dark:text-slate-300 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  {currentSort && <currentSort.icon className="h-4 w-4" />}
                  <span>{currentSort?.label}</span>
                </div>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-1.5 z-20 animate-in fade-in zoom-in-95 duration-100">
                  {sortOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setSortBy(option.id);
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition ${
                        sortBy === option.id 
                          ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' 
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <option.icon className={`h-4 w-4 ${sortBy === option.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                      <span className="flex-1 font-medium">{option.label}</span>
                      {sortBy === option.id && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2 hidden sm:block"></div>
            
            {/* Functional View Toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg hidden sm:flex">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded shadow-sm transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded shadow-sm transition-all ${
                  viewMode === 'list' 
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <ListIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Projects Display Logic (Grid vs List) */}
        {sortedProjects.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
            {searchQuery ? (
               // No results found for search
               <>
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                   <Search className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No matches found</h3>
                <p className="text-slate-500 dark:text-slate-400">Try adjusting your search terms</p>
               </>
            ) : (
               // No projects at all
               <>
                <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <FolderOpen className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No projects yet</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">
                  Create your first project to start organizing your notes, PDFs, and AI chats.
                </p>
                <button
                  onClick={openCreateModal}
                  className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 transition font-medium shadow-lg shadow-indigo-500/30"
                >
                  <Plus className="h-5 w-5" />
                  Create First Project
                </button>
               </>
            )}
          </div>
        ) : (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onOpen={() => navigate(`/workspace/${project.id}`)}
                  onEdit={() => openEditModal(project)}
                  onDelete={() => handleDeleteProject(project.id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col space-y-3">
               {sortedProjects.map((project) => (
                <ProjectRow
                  key={project.id}
                  project={project}
                  onOpen={() => navigate(`/workspace/${project.id}`)}
                  onEdit={() => openEditModal(project)}
                  onDelete={() => handleDeleteProject(project.id)}
                />
              ))}
            </div>
          )
        )}
      </div>

      {/* Reusable Create/Edit Project Modal */}
      {isModalOpen && (
        <ProjectModal
          project={projectToEdit}
          onClose={() => setIsModalOpen(false)}
          onSaved={handleProjectSaved}
        />
      )}
    </div>
  );
};

// HELPER: Format Time
const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Never';
    const getDiff = (d) => Math.floor((new Date() - d) / 1000);

    let dateStr = dateString.replace(' ', 'T');
    if (!dateStr.endsWith('Z') && !dateStr.includes('+')) dateStr += 'Z';
    let date = new Date(dateStr);
    let diff = getDiff(date);

    if (diff < -60) {
      date = new Date(dateString); 
      diff = getDiff(date);
    }

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

// HELPER: Pluralize
const pluralize = (count, noun) => {
    const num = Number(count) || 0;
    return `${num} ${noun}${num === 1 ? '' : 's'}`;
};

// COMPONENT: Grid View Card
const ProjectCard = ({ project, onOpen, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  return (
    <div
      className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 cursor-pointer flex flex-col h-full"
      onClick={onOpen}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105"
            style={{ backgroundColor: project.color || '#4F46E5' }} 
          >
            <FolderOpen className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
              {project.name}
            </h3>
            <p className="text-xs font-medium text-slate-400 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTimeAgo(project.updated_at)}
            </p>
          </div>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className={`p-2 rounded-full transition-colors ${
                showMenu 
                ? 'bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400' 
                : 'text-slate-300 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Settings className="h-5 w-5" />
          </button>

          {showMenu && (
            <div
              className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 py-1 origin-top-right animate-in fade-in zoom-in-95 duration-100"
              style={{ transform: 'translateX(-10px)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-50 dark:border-slate-800 mb-1">
                Actions
              </div>
              <button
                onClick={() => { setShowMenu(false); onEdit(); }}
                className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-2 transition-colors"
              >
                <Edit2 className="h-4 w-4" />
                Edit Details
              </button>
              <button
                onClick={() => { setShowMenu(false); onDelete(); }}
                className="w-full px-4 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-2 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete Project
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 mb-6">
        {project.description ? (
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
            {project.description}
          </p>
        ) : (
          <p className="text-sm text-slate-300 dark:text-slate-600 italic">No description added.</p>
        )}
      </div>

      <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700 group-hover:bg-white dark:group-hover:bg-slate-800 group-hover:border-indigo-100 dark:group-hover:border-indigo-900 transition-colors">
          <FileText className="h-3.5 w-3.5 text-indigo-500" />
          <span>{pluralize(project.source_count, 'Source')}</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700 group-hover:bg-white dark:group-hover:bg-slate-800 group-hover:border-indigo-100 dark:group-hover:border-indigo-900 transition-colors">
          <StickyNote className="h-3.5 w-3.5 text-violet-500" />
          <span>{pluralize(project.note_count, 'Note')}</span>
        </div>
      </div>
    </div>
  );
};

// COMPONENT: List View Row
const ProjectRow = ({ project, onOpen, onEdit, onDelete }) => {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);
  
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
          setShowMenu(false);
        }
      };
      if (showMenu) document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showMenu]);

    return (
        <div 
            onClick={onOpen}
            className="group flex items-center p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm cursor-pointer transition-all"
        >
            {/* Icon */}
            <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm flex-shrink-0 mr-4"
                style={{ backgroundColor: project.color || '#4F46E5' }} 
            >
                <FolderOpen className="h-5 w-5" />
            </div>

            {/* Title & Desc */}
            <div className="flex-1 min-w-0 mr-4">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                    {project.name}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                    {project.description || <span className="text-slate-300 dark:text-slate-600 italic">No description</span>}
                </p>
            </div>

            {/* Counts */}
            <div className="hidden sm:flex items-center gap-3 mr-6">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 w-20">
                    <FileText className="h-3.5 w-3.5" />
                    {pluralize(project.source_count, 'Source')}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 w-20">
                    <StickyNote className="h-3.5 w-3.5" />
                    {pluralize(project.note_count, 'Note')}
                </div>
            </div>

            {/* Date */}
            <div className="hidden md:flex flex-col items-end mr-4 min-w-[80px]">
                <span className="text-xs text-slate-400 dark:text-slate-500">Updated</span>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{formatTimeAgo(project.updated_at)}</span>
            </div>

            {/* Settings */}
            <div className="relative" ref={menuRef}>
                <button
                    onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                    }}
                    className="p-2 rounded-full text-slate-300 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                    <Settings className="h-5 w-5" />
                </button>

                 {showMenu && (
                    <div
                    className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 py-1 origin-top-right"
                    onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => { setShowMenu(false); onEdit(); }}
                            className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-2"
                        >
                            <Edit2 className="h-4 w-4" />
                            Edit Details
                        </button>
                        <button
                            onClick={() => { setShowMenu(false); onDelete(); }}
                            className="w-full px-4 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-2"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete Project
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// COMPONENT: Project Modal
const ProjectModal = ({ project, onClose, onSaved }) => {
  const isEditMode = !!project;
  
  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');
  const [color, setColor] = useState(project?.color || '#4F46E5');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const colors = [
    '#4F46E5', '#8B5CF6', '#EC4899', '#F43F5E', 
    '#F59E0B', '#10B981', '#0EA5E9', '#64748B'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Project name is required'); return; }
    setLoading(true);

    try {
      let response;
      const payload = { name: name.trim(), description: description.trim(), color };
      if (isEditMode) {
        response = await api.put(`/projects/${project.id}`, payload);
      } else {
        response = await api.post('/projects', payload);
      }
      onSaved(response.data.project, isEditMode);
    } catch (error) {
      console.error('Project save error:', error);
      setError(error.response?.data?.error || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-200 border border-slate-100 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {isEditMode ? 'Edit Project' : 'Create Project'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Configure your workspace details.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
             <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Project Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Biology 101"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none text-slate-900 dark:text-white font-medium placeholder:text-slate-400"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are you studying?"
              rows={3}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none text-slate-900 dark:text-white resize-none placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Theme Color</label>
            <div className="flex gap-3 flex-wrap">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-9 h-9 rounded-full transition-all duration-200 shadow-sm ${
                    color === c 
                      ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' 
                      : 'hover:scale-110 hover:shadow-md'
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-3 rounded-xl text-sm font-medium flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-rose-600 dark:bg-rose-400 rounded-full" />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white px-4 py-3 font-semibold rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
            >
              {loading ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Project')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Projects;