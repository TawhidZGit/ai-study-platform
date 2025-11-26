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

  // Helper: Time Ago Formatter
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  // If a note is selected, show the editor
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

  // Otherwise show notes list
  return (
    <div className="h-full flex flex-col bg-white">
      {/* Action Bar (Removed "My Notes" text) */}
      <div className="p-4 border-b border-slate-200 flex-shrink-0 bg-white">
        <button
          onClick={handleCreateNote}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-500/20 font-medium text-sm"
        >
          <Plus className="h-5 w-5" />
          New Note
        </button>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <StickyNote className="h-10 w-10 mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-medium">No notes yet</p>
            <p className="text-xs mt-1">Click "New Note" to start writing</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className="group bg-white border border-slate-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer"
                onClick={() => setSelectedNote(note)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Icon Badge */}
                    <div className="p-2 bg-amber-50 rounded-lg flex-shrink-0 group-hover:bg-amber-100 transition-colors">
                      <StickyNote className="h-5 w-5 text-amber-500" />
                    </div>
                    
                    <div className="flex-1 min-w-0 pt-0.5">
                      <h3 className="font-semibold text-sm text-slate-800 truncate mb-1 group-hover:text-indigo-600 transition-colors">
                        {note.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
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
                    className="p-2 opacity-0 group-hover:opacity-100 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-all"
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