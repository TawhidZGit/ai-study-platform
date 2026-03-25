import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import ThemeToggle from '../components/ThemeToggle'; 
import { 
  Plus, Loader2, Trash2, Edit2, 
  Calendar, ArrowUpNarrowWide, ArrowDownNarrowWide, Type,
  Search, LayoutGrid, List as ListIcon, X,
  Folder, FileText, Layers, MoreVertical, Sparkles, LogOut
} from 'lucide-react';

const Projects = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Data State
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); 
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);

  // Filter state
  const [sortBy, setSortBy] = useState('updated'); 
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);

  const sortOptions = [
    { id: 'updated', label: 'Recently Updated', icon: Calendar },
    { id: 'newest', label: 'Newest First', icon: ArrowDownNarrowWide },
    { id: 'oldest', label: 'Oldest First', icon: ArrowUpNarrowWide },
    { id: 'name', label: 'Alphabetical', icon: Type },
  ];

  const currentSort = sortOptions.find(o => o.id === sortBy);

  useEffect(() => {
    fetchProjects();
  }, []);

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

  const filteredProjects = useMemo(() => {
    return projects.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [projects, searchQuery]);

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

  const openCreateModal = () => {
    setProjectToEdit(null);
    setIsModalOpen(true);
  };

  const openEditModal = (project) => {
    setProjectToEdit(project);
    setIsModalOpen(true);
  };

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
    if (!confirm('Permanently delete this workspace? This action cannot be undone.')) {
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
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] dark:bg-[#09090B]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] text-slate-800 dark:text-slate-200 font-sans relative overflow-hidden transition-colors duration-300">
      
      {/* Ambient Painted Background Glows - Balanced Light Mode */}
      
      {/* Top Left - Indigo */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-400/20 dark:bg-indigo-600/20 blur-[120px] pointer-events-none" />
      
      {/* Top Right - Purple (Bleeds under the attached header) */}
      <div className="absolute top-[-5%] right-[-5%] w-[45%] h-[45%] rounded-full bg-purple-400/20 dark:bg-purple-800/20 blur-[120px] pointer-events-none" />
      
      {/* Bottom Left - Sky Blue */}
      <div className="absolute bottom-[-10%] left-[5%] w-[40%] h-[40%] rounded-full bg-sky-300/30 dark:bg-sky-900/20 blur-[140px] pointer-events-none" />

      {/* Bottom Right - Rose (Toned down and pushed out) */}
      <div className="absolute bottom-[-15%] right-[-10%] w-[35%] h-[35%] rounded-full bg-rose-200/20 dark:bg-rose-900/20 blur-[140px] pointer-events-none" />

      {/* Attached Top Nav - True Frosted Glass */}
      <div className="fixed top-0 w-full z-40 bg-white/40 dark:bg-[#1A1A1A]/60 backdrop-blur-2xl border-b border-white/60 dark:border-white/10 shadow-[0_4px_30px_rgb(0,0,0,0.05)] transition-all">
        <nav className="w-full max-w-7xl mx-auto h-16 px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-1.5 rounded-full shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-semibold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
              SynthLearn
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium hidden sm:block text-slate-700 dark:text-slate-300">
              {user?.name}
            </span>
            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 hidden sm:block"></div>
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors p-2 rounded-full hover:bg-white/60 dark:hover:bg-slate-800/50"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content Area - Correct Width (max-w-7xl) */}
      <div className="max-w-7xl mx-auto px-6 pt-28 pb-20 relative z-10">
      
      {/* ... the rest of your header and content stays the same ... */}
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl md:text-4xl font-medium tracking-tight mb-2">
              Your Spaces
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-base">
              A beautiful environment for your synthesized thoughts.
            </p>
          </div>
          
          <button
            onClick={openCreateModal}
            className="group flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-full hover:scale-105 active:scale-95 transition-all text-sm font-semibold shadow-lg shadow-slate-900/20 dark:shadow-white/10"
          >
            <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
            New Space
          </button>
        </div>

        {/* Frosted Command Bar */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-10">
          
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your spaces..." 
              className="w-full pl-12 pr-6 py-3.5 bg-white/50 dark:bg-[#1A1A1A]/50 backdrop-blur-md border border-white/60 dark:border-white/5 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent text-sm transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none" ref={filterRef}>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="w-full md:w-auto flex items-center justify-between gap-3 px-6 py-3.5 bg-white/50 dark:bg-[#1A1A1A]/50 backdrop-blur-md border border-white/60 dark:border-white/5 rounded-full shadow-sm hover:bg-white/80 dark:hover:bg-[#222]/50 transition-all text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                <currentSort.icon className="h-4 w-4 text-slate-400" />
                <span>{currentSort?.label}</span>
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 top-full mt-3 w-56 bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl shadow-xl py-2 z-20 overflow-hidden">
                  {sortOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setSortBy(option.id);
                        setIsFilterOpen(false);
                      }}
                      className="w-full text-left px-5 py-2.5 text-sm flex items-center gap-3 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <option.icon className={`h-4 w-4 ${sortBy === option.id ? 'text-indigo-500' : 'text-slate-400'}`} />
                      <span className={sortBy === option.id ? 'font-semibold' : 'font-medium text-slate-600 dark:text-slate-300'}>
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex bg-white/50 dark:bg-[#1A1A1A]/50 backdrop-blur-md border border-white/60 dark:border-white/5 rounded-full p-1.5 shadow-sm hidden sm:flex">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-full transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-full transition-all ${
                  viewMode === 'list' 
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <ListIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Display */}
        {sortedProjects.length === 0 ? (
          <div className="text-center py-24 bg-white/30 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl shadow-sm">
            {searchQuery ? (
               <div className="flex flex-col items-center">
                <Search className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-4" strokeWidth={1.5} />
                <h3 className="text-lg font-semibold mb-1">No spaces found</h3>
                <p className="text-slate-500">We couldn't find anything matching "{searchQuery}"</p>
               </div>
            ) : (
               <div className="flex flex-col items-center">
                <div className="h-20 w-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-6">
                  <Folder className="h-10 w-10 text-indigo-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-semibold mb-2">Your canvas is blank</h3>
                <p className="text-slate-500 mb-8 max-w-sm">
                  Create a new space to start organizing your documents and synthesizing your notes.
                </p>
                <button
                  onClick={openCreateModal}
                  className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-full hover:scale-105 active:scale-95 transition-all text-sm font-semibold shadow-md"
                >
                  Create your first Space
                </button>
               </div>
            )}
          </div>
        ) : (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
    if (!dateString) return 'Just now';
    const getDiff = (d) => Math.floor((new Date() - d) / 1000);
    let dateStr = dateString.replace(' ', 'T');
    if (!dateStr.endsWith('Z') && !dateStr.includes('+')) dateStr += 'Z';
    let date = new Date(dateStr);
    let diff = getDiff(date);
    if (diff < -60) { date = new Date(dateString); diff = getDiff(date); }
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
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

  // Generate a soft glowing gradient based on the selected hex color
  const glowStyle = {
    background: `radial-gradient(circle at top left, ${project.color}40 0%, transparent 70%)`
  };

  return (
    <div
      className="group relative bg-white/60 dark:bg-[#1A1A1A]/60 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.2)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full overflow-hidden"
      onClick={onOpen}
    >
      {/* Internal Glow Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-50 dark:opacity-30 mix-blend-multiply dark:mix-blend-screen transition-opacity group-hover:opacity-100" style={glowStyle} />

      {/* FIXED: Removed the box wrapper, colored the icon directly */}
      <div className="relative z-20 flex justify-between items-start mb-6">
        <Folder 
          className="h-8 w-8 drop-shadow-sm transition-transform group-hover:scale-105" 
          style={{ color: project.color || '#3730a3' }} 
        />

        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-white/50 dark:hover:bg-white/10 dark:hover:text-slate-200 transition-all"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {showMenu && (
            <div
              className="absolute right-0 top-full mt-2 w-44 bg-white/95 dark:bg-[#222]/90 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-2xl shadow-xl z-50 py-1.5 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => { setShowMenu(false); onEdit(); }}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-white/5 flex items-center gap-2 transition-colors"
              >
                <Edit2 className="h-3.5 w-3.5" />
                Edit Space
              </button>
              <button
                onClick={() => { setShowMenu(false); onDelete(); }}
                className="w-full px-4 py-2 text-left text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-500/10 flex items-center gap-2 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Space
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 flex-1 mb-6">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2 truncate">
          {project.name}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {project.description || "No description provided."}
        </p>
      </div>

      {/* Glassy Footer Meta */}
      <div className="relative z-10 flex items-center gap-4 text-xs font-medium text-slate-500 pt-5 border-t border-slate-200/50 dark:border-white/5">
        <div className="flex items-center gap-1.5 bg-white/50 dark:bg-white/5 px-2.5 py-1 rounded-full border border-white/50 dark:border-white/5">
          <Layers className="h-3.5 w-3.5" />
          <span>{project.source_count || 0}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white/50 dark:bg-white/5 px-2.5 py-1 rounded-full border border-white/50 dark:border-white/5">
          <FileText className="h-3.5 w-3.5" />
          <span>{project.note_count || 0}</span>
        </div>
        <div className="ml-auto">
          {formatTimeAgo(project.updated_at)}
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

    const glowStyle = {
      background: `radial-gradient(circle at left center, ${project.color}40 0%, transparent 60%)`
    };

    return (
        <div 
            onClick={onOpen}
            // FIXED: Removed overflow-hidden from this parent wrapper. 
            // Toggles between an extremely high z-index when open and a normal one when closed.
            className={`group relative flex items-center px-4 py-3.5 cursor-pointer transition-all ${showMenu ? 'z-[100]' : 'z-10'}`}
        >
            {/* NEW: Dedicated background layer that cleanly clips the glow but NOT the menu */}
            <div className="absolute inset-0 bg-white/60 dark:bg-[#1A1A1A]/60 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl group-hover:bg-white/80 dark:group-hover:bg-white/5 group-hover:shadow-md transition-all overflow-hidden -z-10">
               <div className="absolute inset-0 pointer-events-none opacity-50 dark:opacity-30 mix-blend-multiply dark:mix-blend-screen transition-opacity group-hover:opacity-100" style={glowStyle} />
            </div>

            {/* FIXED: Removed the box wrapper, colored the icon directly, kept alignment margins */}
            <Folder 
              className="relative z-10 h-6 w-6 flex-shrink-0 mr-4 drop-shadow-sm" 
              style={{ color: project.color || '#3730a3' }} 
            />

            <div className="relative z-10 flex-1 min-w-0 pr-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {project.name}
                  </h3>
                  <p className="text-sm text-slate-500 truncate hidden sm:inline-block">
                      {project.description || "No description"}
                  </p>
                </div>
            </div>

            <div className="relative z-10 hidden md:flex items-center gap-6 pr-6 text-sm text-slate-500">
                <div className="flex items-center gap-2 w-16 bg-white/40 dark:bg-white/5 px-2.5 py-1 rounded-full border border-white/50 dark:border-white/5">
                    <Layers className="h-4 w-4" />
                    <span>{project.source_count || 0}</span>
                </div>
                <div className="flex items-center gap-2 w-16 bg-white/40 dark:bg-white/5 px-2.5 py-1 rounded-full border border-white/50 dark:border-white/5">
                    <FileText className="h-4 w-4" />
                    <span>{project.note_count || 0}</span>
                </div>
                <div className="w-24 text-right text-xs font-medium">
                  {formatTimeAgo(project.updated_at)}
                </div>
            </div>

            <div className="relative z-20" ref={menuRef}>
                <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(!showMenu);
                    }}
                    className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${
                      showMenu 
                        ? 'bg-white/80 dark:bg-white/20 text-slate-900 dark:text-white shadow-sm' 
                        : 'text-slate-400 hover:text-slate-700 hover:bg-white/80 dark:hover:bg-white/10 dark:hover:text-slate-200'
                    }`}
                >
                    <MoreVertical className="h-4 w-4" />
                </button>

                 {showMenu && (
                    <div
                      className="absolute right-0 top-full mt-2 w-48 bg-white/95 dark:bg-[#222]/95 backdrop-blur-2xl border border-white/60 dark:border-white/10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] z-[200] py-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => { setShowMenu(false); onEdit(); }}
                            className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-white/5 flex items-center gap-3 transition-colors"
                        >
                            <Edit2 className="h-4 w-4 text-slate-400" />
                            Edit Space
                        </button>
                        
                        <div className="h-px w-full bg-slate-200/60 dark:bg-white/5 my-1" />

                        <button
                            onClick={() => { setShowMenu(false); onDelete(); }}
                            className="w-full px-4 py-2.5 text-left text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50/80 dark:hover:bg-rose-500/10 flex items-center gap-3 transition-colors"
                        >
                            <Trash2 className="h-4 w-4 text-rose-500 dark:text-rose-400" />
                            Delete Space
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// COMPONENT: Project Modal (Glassy)
const ProjectModal = ({ project, onClose, onSaved }) => {
  const isEditMode = !!project;
  
  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');
  const [color, setColor] = useState(project?.color || '#3b82f6');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

 const colors = [
    '#6366f1', // Vibrant Indigo
    '#a855f7', // Vibrant Purple
    '#e11d48', // Vibrant Rose
    '#ea580c', // Vibrant Orange
    '#10b981', // Vibrant Emerald
    '#0ea5e9', // Vibrant Sky Blue
    '#3b82f6', // Vibrant Blue
    '#64748b'  // Vibrant Slate
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Space name is required'); return; }
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
      setError(error.response?.data?.error || 'Failed to save space');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/20 dark:bg-black/40 backdrop-blur-md flex items-center justify-center z-[100] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full border border-white/60 dark:border-white/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-slate-200/50 dark:border-white/5">
          <h2 className="text-xl font-semibold">
            {isEditMode ? 'Edit Space' : 'Create New Space'}
          </h2>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
          >
             <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Space Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cognitive Psychology"
              className="w-full px-4 py-3 bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent text-sm transition-all placeholder:text-slate-400"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description <span className="text-slate-400 font-normal">(Optional)</span></label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will you learn here?"
              rows={3}
              className="w-full px-4 py-3 bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent text-sm resize-none transition-all placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Theme Color</label>
            <div className="flex gap-3 flex-wrap">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all shadow-sm ${
                    color === c 
                      ? 'ring-2 ring-offset-2 dark:ring-offset-[#1A1A1A] ring-indigo-500 scale-110' 
                      : 'hover:scale-110 border border-black/5 dark:border-white/10'
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-rose-50/80 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 p-3.5 rounded-2xl text-sm font-medium">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-full text-sm font-semibold hover:scale-105 active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditMode ? 'Save Changes' : 'Create Space'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Projects;