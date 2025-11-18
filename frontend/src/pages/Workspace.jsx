import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { 
  ArrowLeft, Settings, Loader2, 
  PanelLeftClose, PanelLeftOpen,
  PanelRightClose, PanelRightOpen,
  FileText, StickyNote, Sparkles
} from 'lucide-react';

import SourcesPanel from '../components/workspace/SourcesPanel';
import ChatPanel from '../components/workspace/ChatPanel';
import NotesToolsPanel from '../components/workspace/NotesToolsPanel';
import SourcesDock from '../components/workspace/SourcesDock';
import NotesDock from '../components/workspace/NotesDock';

const Workspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [sourcesCollapsed, setSourcesCollapsed] = useState(false);
  const [notesCollapsed, setNotesCollapsed] = useState(false);

  // Data for docks
  const [sources, setSources] = useState([]);
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    fetchProject();
    fetchSources();
    fetchNotes();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await api.get(`/projects/${id}`);
      setProject(response.data.project);
    } catch (error) {
      console.error('Error fetching project:', error);
      setError('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const fetchSources = async () => {
    try {
      const response = await api.get(`/sources/project/${id}`);
      setSources(response.data.sources);
    } catch (error) {
      console.error('Error fetching sources:', error);
    }
  };

  const fetchNotes = async () => {
    try {
      const response = await api.get(`/notes/project/${id}`);
      setNotes(response.data.notes || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4 text-lg">{error || 'Project not found'}</p>
          <button onClick={() => navigate('/projects')} className="text-blue-600 hover:underline font-medium">
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm px-4 py-3 flex-shrink-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/projects')} className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full ring-2 ring-offset-1 ring-gray-100" style={{ backgroundColor: project.color || '#3b82f6' }} />
              <div>
                <h1 className="text-lg font-semibold text-gray-800 leading-tight">{project.name}</h1>
              </div>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600">
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Workspace Area */}
      <div className="flex-1 overflow-hidden flex">
        {/* Left Dock (when sources collapsed) */}
        {sourcesCollapsed && (
          <SourcesDock 
            sources={sources} 
            onExpand={() => setSourcesCollapsed(false)}
            onSourceClick={(sourceId) => {
              // Optionally auto-expand and select source
              setSourcesCollapsed(false);
            }}
          />
        )}

        {/* Main Panel Area */}
        <div className="flex-1 overflow-hidden">
          <PanelGroup direction="horizontal" autoSaveId={`workspace-layout-${id}`} className="h-full">
            
            {/* === LEFT PANEL (SOURCES) === */}
            {!sourcesCollapsed && (
              <>
                <Panel defaultSize={25} minSize={20} maxSize={40} order={1} className="bg-white">
                  <div className="h-full flex flex-col">
                    <SourcesPanel projectId={id} onSourcesUpdate={fetchSources} />
                  </div>
                </Panel>
                
                <PanelResizeHandle className="w-2 bg-transparent hover:bg-blue-100 transition-colors cursor-col-resize flex items-center justify-center z-10">
                  <div className="w-0.5 h-8 bg-gray-300 rounded-full" />
                </PanelResizeHandle>
              </>
            )}

            {/* === MIDDLE PANEL (CHAT) === */}
            <Panel order={2} minSize={30} className="bg-white flex flex-col relative">
              
              {/* Toolbar Header */}
              <div className="h-12 border-b border-gray-100 flex items-center justify-between px-4 bg-white flex-shrink-0">
                
                {/* Left Toggle */}
                <button
                  onClick={() => setSourcesCollapsed(!sourcesCollapsed)}
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition"
                  title={sourcesCollapsed ? "Expand Sources" : "Collapse Sources"}
                >
                  {sourcesCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
                </button>

                <span className="text-sm font-medium text-gray-400">Workspace Chat</span>

                {/* Right Toggle */}
                <button
                  onClick={() => setNotesCollapsed(!notesCollapsed)}
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition"
                  title={notesCollapsed ? "Expand Notes" : "Collapse Notes"}
                >
                  {notesCollapsed ? <PanelRightOpen className="h-5 w-5" /> : <PanelRightClose className="h-5 w-5" />}
                </button>
              </div>

              {/* Main Content */}
              <div className="flex-1 overflow-hidden">
                <ChatPanel projectId={id} />
              </div>
            </Panel>

            {/* === RIGHT PANEL (NOTES) === */}
            {!notesCollapsed && (
              <>
                <PanelResizeHandle className="w-2 bg-transparent hover:bg-blue-100 transition-colors cursor-col-resize flex items-center justify-center z-10">
                  <div className="w-0.5 h-8 bg-gray-300 rounded-full" />
                </PanelResizeHandle>

                <Panel defaultSize={25} minSize={20} maxSize={40} order={3} className="bg-white">
                  <div className="h-full flex flex-col">
                    <NotesToolsPanel projectId={id} onNotesUpdate={fetchNotes} />
                  </div>
                </Panel>
              </>
            )}
          </PanelGroup>
        </div>

        {/* Right Dock (when notes collapsed) */}
        {notesCollapsed && (
          <NotesDock 
            notes={notes} 
            onExpand={() => setNotesCollapsed(false)}
            onNoteClick={(noteId) => {
              setNotesCollapsed(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Workspace;