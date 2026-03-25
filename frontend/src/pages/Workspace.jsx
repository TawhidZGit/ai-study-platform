import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { ArrowLeft, Loader2, Folder } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] dark:bg-[#09090B]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] dark:bg-[#09090B] font-sans">
        <div className="text-center bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur-xl border border-white/60 dark:border-white/10 p-10 rounded-3xl shadow-xl max-w-sm">
          <p className="text-rose-600 dark:text-rose-400 mb-6 font-medium">{error || 'Space not found'}</p>
          <button 
            onClick={() => navigate('/projects')} 
            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-full text-sm font-semibold hover:scale-105 active:scale-95 transition-all shadow-md"
          >
            Back to Spaces
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#09090B] text-slate-800 dark:text-slate-200 font-sans relative overflow-hidden transition-colors duration-300">
      
      {/* Ambient Painted Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-400/20 dark:bg-indigo-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute top-[-5%] right-[-5%] w-[45%] h-[45%] rounded-full bg-purple-400/20 dark:bg-purple-800/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[5%] w-[40%] h-[40%] rounded-full bg-sky-300/30 dark:bg-sky-900/20 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[35%] h-[35%] rounded-full bg-rose-200/20 dark:bg-rose-900/20 blur-[140px] pointer-events-none" />

      {/* Header - True Frosted Glass */}
      <header className="relative z-40 bg-white/40 dark:bg-[#1A1A1A]/60 backdrop-blur-2xl border-b border-white/60 dark:border-white/10 shadow-[0_4px_30px_rgb(0,0,0,0.05)] px-4 py-3 flex-shrink-0 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/projects')} 
              className="p-2 hover:bg-white/80 dark:hover:bg-white/10 rounded-full transition-all text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 group"
              title="Back to Spaces"
            >
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <div className="h-5 w-px bg-slate-300 dark:bg-slate-700 mx-1"></div>
            <div className="flex items-center gap-3 pl-1">
              {/* Clean folder icon mapped to project color */}
              <Folder 
                className="h-5 w-5 drop-shadow-sm" 
                style={{ color: project.color || '#3730a3', fill: `${project.color}20` || '#3730a320' }} 
              />
              <div>
                <h1 className="text-base font-bold text-slate-800 dark:text-slate-100 leading-tight">
                  {project.name}
                </h1>
              </div>
            </div>
          </div>

          {/* User info */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300 hidden sm:block">
              {user?.name}
            </span>
            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 hidden sm:block"></div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Workspace Area - Added min-h-0 to strictly constrain flex height */}
      <div className="flex-1 min-h-0 overflow-hidden flex relative z-10">
        
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

        {/* Main Panel Area - Added h-full and min-h-0 */}
        <div className="flex-1 min-h-0 h-full overflow-hidden">
          <PanelGroup direction="horizontal" autoSaveId={`workspace-layout-${id}`} className="h-full">
            
            {/* === LEFT PANEL (SOURCES) === */}
            {!sourcesCollapsed && (
              <>
                <Panel defaultSize={25} minSize={20} maxSize={40} order={1} className="bg-white/50 dark:bg-[#1A1A1A]/50 backdrop-blur-md border-r border-slate-200/50 dark:border-white/5 relative z-0">
                  <div className="h-full flex flex-col overflow-hidden">
                    <SourcesPanel projectId={id} onSourcesUpdate={fetchSources} />
                  </div>
                </Panel>
                
                {/* Left Resize Handle */}
                <PanelResizeHandle 
                  className="w-1.5 bg-transparent hover:bg-indigo-500/20 dark:hover:bg-indigo-500/30 transition-colors cursor-col-resize flex items-center justify-center z-20 group"
                  onDoubleClick={() => setSourcesCollapsed(true)}
                  title="Double-click to collapse sources"
                >
                  <div className="w-0.5 h-8 bg-slate-300/50 dark:bg-slate-600/50 rounded-full group-hover:bg-indigo-400 transition-colors" />
                </PanelResizeHandle>
              </>
            )}

            {/* === MIDDLE PANEL (CHAT) === */}
            <Panel order={2} minSize={30} className="bg-transparent relative z-0">
              {/* FIX: Added h-full, w-full, flex flex-col, and overflow-hidden here */}
              <div className="h-full w-full overflow-hidden flex flex-col">
                <ChatPanel projectId={id} />
              </div>
            </Panel>

            {/* === RIGHT PANEL (NOTES & TOOLS) === */}
            {!notesCollapsed && (
              <>
                {/* Right Resize Handle */}
                <PanelResizeHandle 
                  className="w-1.5 bg-transparent hover:bg-indigo-500/20 dark:hover:bg-indigo-500/30 transition-colors cursor-col-resize flex items-center justify-center z-20 group"
                  onDoubleClick={() => setNotesCollapsed(true)}
                  title="Double-click to collapse notes"
                >
                  <div className="w-0.5 h-8 bg-slate-300/50 dark:bg-slate-600/50 rounded-full group-hover:bg-indigo-400 transition-colors" />
                </PanelResizeHandle>

                <Panel defaultSize={25} minSize={20} maxSize={40} order={3} className="bg-white/50 dark:bg-[#1A1A1A]/50 backdrop-blur-md border-l border-slate-200/50 dark:border-white/5 relative z-0">
                  <div className="h-full flex flex-col overflow-hidden">
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