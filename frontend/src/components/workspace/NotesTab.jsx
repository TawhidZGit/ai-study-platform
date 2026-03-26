import { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, StickyNote, Clock } from 'lucide-react';
import api from '../../utils/api';
import NoteEditor from './NoteEditor';

const NotesTab = ({ projectId, onNotesUpdate }) => {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedView, setExpandedView] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [projectId]);

  const fetchNotes = async () => {
    try {
      const response = await api.get(`/notes/project/${projectId}`);
      setNotes(response.data.notes);
      if (onNotesUpdate) onNotesUpdate();
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async () => {
    try {
      const response = await api.post(`/notes/project/${projectId}`, {
        title: 'Untitled Note',
        content: ''
      });
      await fetchNotes();
      setSelectedNote(response.data.note);
      setExpandedView(false);
    } catch (error) {
      console.error('Create note error:', error);
      alert('Failed to create note');
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!confirm('Delete this note?')) return;

    try {
      await api.delete(`/notes/${noteId}`);
      await fetchNotes();
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
        setExpandedView(false);
      }
    } catch (error) {
      console.error('Delete note error:', error);
      alert('Failed to delete note');
    }
  };

  const handleNoteUpdate = async () => {
    await fetchNotes();
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  if (selectedNote) {
    return (
      <NoteEditor
        note={selectedNote}
        onBack={() => {
          setSelectedNote(null);
          setExpandedView(false);
        }}
        onUpdate={handleNoteUpdate}
        onDelete={() => handleDeleteNote(selectedNote.id)}
        expanded={expandedView}
        onToggleExpand={() => setExpandedView(!expandedView)}
      />
    );
  }

  return (
    <div className="h-full flex flex-col bg-transparent">
      {/* Action Bar */}
      <div className="p-4 flex-shrink-0">
        <button
          onClick={handleCreateNote}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full hover:scale-105 active:scale-95 transition-all text-sm font-semibold shadow-lg shadow-slate-900/20 dark:shadow-white/10"
        >
          <Plus className="h-4 w-4" />
          New Note
        </button>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-4 pt-0">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-12 bg-white/30 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl shadow-sm">
            <div className="h-16 w-16 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
               <StickyNote className="h-8 w-8 text-amber-400" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">No notes yet</p>
            <p className="text-xs text-slate-500 mt-1">Click "New Note" to start writing</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className="group relative bg-white/60 dark:bg-[#1A1A1A]/60 backdrop-blur-md border border-white/60 dark:border-white/10 rounded-2xl p-4 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer overflow-hidden"
                onClick={() => setSelectedNote(note)}
              >
                {/* Soft ambient glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="relative flex items-start justify-between z-10">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="p-2.5 bg-white/80 dark:bg-white/10 rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform shadow-sm border border-white/50 dark:border-white/5">
                      <StickyNote className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                    </div>
                    
                    <div className="flex-1 min-w-0 pt-0.5">
                      <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {note.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimeAgo(note.updated_at)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNote(note.id);
                    }}
                    className="p-2 opacity-0 group-hover:opacity-100 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-full text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesTab;