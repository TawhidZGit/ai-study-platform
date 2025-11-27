import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { ArrowLeft, Loader2 } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

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

  // LIFTED STATE: AI Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const generatingRef = useRef(false);

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <p className="text-rose-600 mb-4 text-lg">{error || 'Project not found'}</p>
          <button onClick={() => navigate('/projects')} className="text-indigo-600 hover:underline font-medium">
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 selection:bg-indigo-100 selection:text-indigo-700 transition-colors duration-300">
      
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm px-4 py-3 flex-shrink-0 z-20 supports-[backdrop-filter]:bg-white/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/projects')} 
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition text-slate-500 dark:text-slate-400 hover:text-slate-700"
              title="Back to Projects"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              {/* Colored Dot */}
              <div 
                className="w-3 h-3 rounded-full ring-2 ring-offset-1 ring-slate-100 dark:ring-slate-800" 
                style={{ backgroundColor: project.color || '#4F46E5' }} 
              />
              <div>
                <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-tight">
                  {project.name}
                </h1>
                {project.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md font-medium">
                    {project.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* User info */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{user?.name}</span>
          </div>
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
                <Panel defaultSize={25} minSize={20} maxSize={40} order={1} className="bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
                  <div className="h-full flex flex-col">
                    <SourcesPanel projectId={id} onSourcesUpdate={fetchSources} />
                  </div>
                </Panel>
                
                {/* Left Resize Handle */}
                <PanelResizeHandle 
                  className="w-2 bg-transparent hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors cursor-col-resize flex items-center justify-center z-10 group"
                  onDoubleClick={() => setSourcesCollapsed(true)}
                  title="Double-click to collapse sources"
                >
                  <div className="w-0.5 h-8 bg-slate-300 dark:bg-slate-700 rounded-full group-hover:bg-indigo-400 transition-colors" />
                </PanelResizeHandle>
              </>
            )}

            {/* === MIDDLE PANEL (CHAT) === */}
            <Panel order={2} minSize={30} className="bg-white dark:bg-slate-900 flex flex-col relative z-0">
              <div className="flex-1 overflow-hidden">
                <ChatPanel projectId={id} />
              </div>
            </Panel>

            {/* === RIGHT PANEL (NOTES & TOOLS) === */}
            {!notesCollapsed && (
              <>
                {/* Right Resize Handle */}
                <PanelResizeHandle 
                  className="w-2 bg-transparent hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors cursor-col-resize flex items-center justify-center z-10 group"
                  onDoubleClick={() => setNotesCollapsed(true)}
                  title="Double-click to collapse notes"
                >
                  <div className="w-0.5 h-8 bg-slate-300 dark:bg-slate-700 rounded-full group-hover:bg-indigo-400 transition-colors" />
                </PanelResizeHandle>

                <Panel defaultSize={25} minSize={20} maxSize={40} order={3} className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800">
                  <div className="h-full flex flex-col">
                    <NotesToolsPanel 
                      projectId={id} 
                      onNotesUpdate={fetchNotes}
                      isGenerating={isGenerating}
                      setIsGenerating={setIsGenerating}
                      generatingRef={generatingRef}
                    />
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