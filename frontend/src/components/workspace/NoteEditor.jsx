import { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  ChevronLeft, Trash2, 
  Bold, Italic, List, ListOrdered, 
  Maximize2, Minimize2, X,
  Undo, Redo, ChevronDown, Check
} from 'lucide-react';
import api from '../../utils/api';

const NoteEditor = ({ note, onBack, onUpdate, onDelete, expanded, onToggleExpand }) => {
  const [title, setTitle] = useState(note.title);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [initialContent, setInitialContent] = useState(note.content || '');
  const [hasChanges, setHasChanges] = useState(false);
  const [showHeadingDropdown, setShowHeadingDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
  // Force re-render on cursor movement to update toolbar states
  const [, setSelectionTick] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your notes...',
      }),
    ],
    content: note.content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4',
      },
    },
    onUpdate: () => {
      setHasChanges(true);
    },
    onSelectionUpdate: () => {
      setSelectionTick(prev => prev + 1);
    },
    onTransaction: () => {
      setSelectionTick(prev => prev + 1);
    }
  });

  // Custom CSS to restore Heading and List styles destroyed by Tailwind Reset
  // We inject this style block directly to guarantee the editor looks right
  const editorStyles = `
    .ProseMirror h1 {
      font-size: 1.875rem;
      line-height: 2.25rem;
      font-weight: 700;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      color: #111827;
    }
    .ProseMirror h2 {
      font-size: 1.5rem;
      line-height: 2rem;
      font-weight: 600;
      margin-top: 1.2em;
      margin-bottom: 0.5em;
      color: #374151;
    }
    .ProseMirror h3 {
      font-size: 1.25rem;
      line-height: 1.75rem;
      font-weight: 600;
      margin-top: 1em;
      margin-bottom: 0.5em;
      color: #4B5563;
    }
    .ProseMirror ul {
      list-style-type: disc;
      padding-left: 1.625em;
      margin-top: 0.5em;
      margin-bottom: 0.5em;
    }
    .ProseMirror ol {
      list-style-type: decimal;
      padding-left: 1.625em;
      margin-top: 0.5em;
      margin-bottom: 0.5em;
    }
    .ProseMirror li {
      margin-top: 0.25em;
      margin-bottom: 0.25em;
    }
    .ProseMirror p {
      margin-top: 0.5em;
      margin-bottom: 0.5em;
    }
  `;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowHeadingDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (title !== note.title) {
      setHasChanges(true);
    }
  }, [title, note.title]);

  useEffect(() => {
    if (!hasChanges) return;
    const timeout = setTimeout(() => {
      handleSave();
    }, 2000);
    return () => clearTimeout(timeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, hasChanges]); 

  const handleSave = async () => {
    if (!editor || !hasChanges) return;
    const content = editor.getHTML();
    setSaving(true);
    try {
      await api.put(`/notes/${note.id}`, { title, content });
      setLastSaved(new Date());
      setHasChanges(false);
      setInitialContent(content);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Save note error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!editor) return <div className="p-4">Loading editor...</div>;

  // Helper to get current heading label
  const getCurrentHeadingLabel = () => {
    if (editor.isActive('heading', { level: 1 })) return 'Heading 1';
    if (editor.isActive('heading', { level: 2 })) return 'Heading 2';
    if (editor.isActive('heading', { level: 3 })) return 'Heading 3';
    return 'Normal Text';
  };

  const setHeading = (level) => {
    if (level === 0) {
      editor.chain().focus().setParagraph().run();
    } else {
      editor.chain().focus().toggleHeading({ level }).run();
    }
    setShowHeadingDropdown(false);
  };

  const content = (
    <>
      {/* Inject Custom Styles */}
      <style>{editorStyles}</style>

      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between flex-shrink-0 bg-white">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition">
          {expanded ? <X className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>

        <div className="flex items-center gap-2">
          {saving && <span className="text-xs text-gray-500">Saving...</span>}
          {lastSaved && !saving && (
            <span className="text-xs text-gray-500">Saved {lastSaved.toLocaleTimeString()}</span>
          )}
          <button onClick={onToggleExpand} className="p-2 hover:bg-gray-100 rounded-lg transition" title={expanded ? "Minimize" : "Expand"}>
            {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          <button onClick={onDelete} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete Note">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Title Input */}
      <div className="px-4 pt-4 flex-shrink-0 bg-white">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-2xl font-bold border-none focus:outline-none focus:ring-0 p-0 bg-transparent"
          placeholder="Note Title"
        />
      </div>

      {/* Toolbar */}
      <div className="px-4 py-2 border-b flex items-center gap-1 flex-shrink-0 bg-white flex-wrap z-20 relative">
        {/* Undo/Redo */}
        <div className="flex items-center gap-0.5 mr-2">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-2 rounded hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent transition"
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-2 rounded hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent transition"
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Custom Heading Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowHeadingDropdown(!showHeadingDropdown)}
            className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-md hover:bg-gray-100 text-sm font-medium text-gray-700 w-40 transition border border-gray-200 shadow-sm"
          >
            <span className="truncate">{getCurrentHeadingLabel()}</span>
            <ChevronDown className="h-3 w-3 opacity-50" />
          </button>
          
          {showHeadingDropdown && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50">
              {[
                { label: 'Normal Text', value: 0 },
                { label: 'Heading 1', value: 1 },
                { label: 'Heading 2', value: 2 },
                { label: 'Heading 3', value: 3 },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setHeading(option.value)}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-50 transition ${
                    (option.value === 0 && !editor.isActive('heading')) || editor.isActive('heading', { level: option.value })
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-700'
                  }`}
                >
                  <span className={option.value === 0 ? 'font-normal' : `font-bold text-${option.value === 1 ? 'lg' : option.value === 2 ? 'base' : 'sm'}`}>
                    {option.label}
                  </span>
                  {((option.value === 0 && !editor.isActive('heading')) || editor.isActive('heading', { level: option.value })) && (
                    <Check className="h-3 w-3" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Text Styles */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-100 transition ${
            editor.isActive('bold') ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
          }`}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-100 transition ${
            editor.isActive('italic') ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
          }`}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Lists */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-100 transition ${
            editor.isActive('bulletList') ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
          }`}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-100 transition ${
            editor.isActive('orderedList') ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
          }`}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto bg-white" onClick={() => editor.chain().focus().run()}>
        <EditorContent editor={editor} />
      </div>
    </>
  );

  if (expanded) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
        {content}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col border rounded-lg bg-white">
      {content}
    </div>
  );
};

export default NoteEditor;