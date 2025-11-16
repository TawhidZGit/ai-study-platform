import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Plus, FolderOpen, FileText, StickyNote, Loader2, Trash2, Settings } from 'lucide-react';

const Projects = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchProjects();
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">AI Study Platform</h1>
            <p className="text-sm text-gray-600">Your Learning Workspace</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {user?.name}!</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">My Projects</h2>
            <p className="text-gray-600 mt-1">Organize your study materials into projects</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-md"
          >
            <Plus className="h-5 w-5" />
            New Project
          </button>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-16">
            <FolderOpen className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No projects yet</h3>
            <p className="text-gray-600 mb-6">Create your first project to get started!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="h-5 w-5" />
              Create First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onOpen={() => navigate(`/workspace/${project.id}`)}
                onDelete={() => handleDeleteProject(project.id)}
                onRefresh={fetchProjects}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(project) => {
            setShowCreateModal(false);
            navigate(`/workspace/${project.id}`);
          }}
        />
      )}
    </div>
  );

  async function handleDeleteProject(projectId) {
    if (!confirm('Are you sure? This will delete all sources, notes, and chat history.')) {
      return;
    }

    try {
      await api.delete(`/projects/${projectId}`);
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    }
  }
};

// Project Card Component
const ProjectCard = ({ project, onOpen, onDelete, onRefresh }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition cursor-pointer group relative"
      onClick={onOpen}
    >
      {/* Color Bar */}
      <div
        className="h-2 rounded-t-lg"
        style={{ backgroundColor: project.color }}
      />

      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-800 mb-1 group-hover:text-blue-600 transition">
              {project.name}
            </h3>
            {project.description && (
              <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <Settings className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span>{project.source_count || 0} sources</span>
          </div>
          <div className="flex items-center gap-1">
            <StickyNote className="h-4 w-4" />
            <span>{project.note_count || 0} notes</span>
          </div>
        </div>

        {/* Last Updated */}
        <div className="mt-4 pt-4 border-t text-xs text-gray-500">
          Updated {new Date(project.updated_at).toLocaleDateString()}
        </div>
      </div>

      {/* Dropdown Menu */}
      {showMenu && (
        <div
          className="absolute right-4 top-16 bg-white rounded-lg shadow-lg border z-10 py-1 w-48"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
              setShowMenu(false);
            }}
            className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Project
          </button>
        </div>
      )}
    </div>
  );
};

// Create Project Modal Component
const CreateProjectModal = ({ onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const colors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Orange
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#6366F1', // Indigo
    '#14B8A6', // Teal
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/projects', {
        name: name.trim(),
        description: description.trim(),
        color
      });

      onCreated(response.data.project);
    } catch (error) {
      console.error('Create project error:', error);
      setError(error.response?.data?.error || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Create New Project</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Biology 101, History Final Prep"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this project..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color Theme
            </label>
            <div className="flex gap-2 flex-wrap">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-lg transition ${
                    color === c ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Projects;