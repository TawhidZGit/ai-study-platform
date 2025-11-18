import { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, ChevronLeft } from 'lucide-react';
import api from '../../utils/api';
import NoteEditor from './NoteEditor';

const NotesTab = ({ projectId, onNotesUpdate }) => {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [loading, setLoading] = useState(true);

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
      }
    } catch (error) {
      console.error('Delete note error:', error);
      alert('Failed to delete note');
    }
  };

  const handleNoteUpdate = async () => {
    await fetchNotes();
  };

  // If a note is selected, show the editor
  if (selectedNote) {
    return (
      <NoteEditor
        note={selectedNote}
        onBack={() => setSelectedNote(null)}
        onUpdate={handleNoteUpdate}
        onDelete={() => handleDeleteNote(selectedNote.id)}
      />
    );
  }

  // Otherwise show notes list
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex-shrink-0">
        <button
          onClick={handleCreateNote}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="h-5 w-5" />
          New Note
        </button>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-sm">No notes yet</p>
            <p className="text-xs mt-2">Click "New Note" to start</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notes.map((note) => (
              <button
                key={note.id}
                onClick={() => setSelectedNote(note)}
                className="w-full text-left group border border-gray-200 rounded-lg p-3 hover:border-blue-400 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-gray-800 truncate mb-1">
                      {note.title}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {new Date(note.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNote(note.id);
                    }}
                    className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded text-red-600 transition"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesTab;