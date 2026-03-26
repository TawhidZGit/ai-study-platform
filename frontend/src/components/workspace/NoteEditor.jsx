import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  const [initialContent, setInitialContent] = useState(note.content || '');
  const [hasChanges, setHasChanges] = useState(false);
  const [showHeadingDropdown, setShowHeadingDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
  const [, setSelectionTick] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your notes...',
      }),
    ],
    content: note.content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-6 dark:prose-invert text-slate-800 dark:text-slate-200',
      },
    },
    onUpdate: () => setHasChanges(true),
    onSelectionUpdate: () => setSelectionTick(prev => prev + 1),
    onTransaction: () => setSelectionTick(prev => prev + 1)
  });

  const editorStyles = `
    .ProseMirror h1 { font-size: 1.875rem; line-height: 2.25rem; font-weight: 700; margin-top: 1.5em; margin-bottom: 0.5em; color: inherit; }
    .ProseMirror h2 { font-size: 1.5rem; line-height: 2rem; font-weight: 600; margin-top: 1.2em; margin-bottom: 0.5em; color: inherit; }
    .ProseMirror h3 { font-size: 1.25rem; line-height: 1.75rem; font-weight: 600; margin-top: 1em; margin-bottom: 0.5em; color: inherit; }
    .ProseMirror ul { list-style-type: disc; padding-left: 1.625em; margin-top: 0.5em; margin-bottom: 0.5em; }
    .ProseMirror ol { list-style-type: decimal; padding-left: 1.625em; margin-top: 0.5em; margin-bottom: 0.5em; }
    .ProseMirror li { margin-top: 0.25em; margin-bottom: 0.25em; }
    .ProseMirror p { margin-top: 0.5em; margin-bottom: 0.5em; }
    .dark .ProseMirror .is-editor-empty:before { color: #64748b; }
  `;

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
    if (title !== note.title) setHasChanges(true);
  }, [title, note.title]);

  useEffect(() => {
    if (!hasChanges) return;
    const timeout = setTimeout(() => handleSave(), 2000);
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

  if (!editor) return <div className="p-4 text-slate-500">Loading editor...</div>;

  const getCurrentHeadingLabel = () => {
    if (editor.isActive('heading', { level: 1 })) return 'Heading 1';
    if (editor.isActive('heading', { level: 2 })) return 'Heading 2';
    if (editor.isActive('heading', { level: 3 })) return 'Heading 3';
    return 'Normal Text';
  };

  const setHeading = (level) => {
    if (level === 0) editor.chain().focus().setParagraph().run();
    else editor.chain().focus().toggleHeading({ level }).run();
    setShowHeadingDropdown(false);
  };

  const content = (
    <>
      <style>{editorStyles}</style>

      {/* Header - Glassy */}
      <div className="px-4 py-3 border-b border-white/60 dark:border-white/10 flex items-center justify-between flex-shrink-0 bg-white/40 dark:bg-black/20 backdrop-blur-md">
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center hover:bg-white/60 dark:hover:bg-white/10 rounded-full transition text-slate-600 dark:text-slate-400">
          {expanded ? <X className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>

        <div className="flex items-center gap-3">
          {saving && <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Saving...</span>}
          {lastSaved && !saving && (
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Saved {lastSaved.toLocaleTimeString()}</span>
          )}
          <div className="flex bg-white/50 dark:bg-white/5 rounded-full p-1 border border-white/50 dark:border-white/5 shadow-sm">
            <button onClick={onToggleExpand} className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-full transition text-slate-600 dark:text-slate-300" title={expanded ? "Minimize" : "Expand"}>
              {expanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </button>
            <button onClick={onDelete} className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-full transition" title="Delete Note">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Title Input */}
      <div className="px-6 pt-6 pb-2 flex-shrink-0 bg-transparent">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-3xl font-bold border-none focus:outline-none focus:ring-0 p-0 bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400/50"
          placeholder="Note Title"
        />
      </div>

      {/* Toolbar - Floating Glassy Ribbon */}
      <div className="mx-6 my-2 px-2 py-1.5 border border-white/60 dark:border-white/10 rounded-2xl flex items-center gap-1 flex-shrink-0 bg-white/50 dark:bg-[#222]/50 backdrop-blur-xl shadow-sm z-20 relative overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-0.5">
          <button onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="p-2 rounded-xl hover:bg-white/80 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 disabled:opacity-30 disabled:hover:bg-transparent transition">
            <Undo className="h-4 w-4" />
          </button>
          <button onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="p-2 rounded-xl hover:bg-white/80 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 disabled:opacity-30 disabled:hover:bg-transparent transition">
            <Redo className="h-4 w-4" />
          </button>
        </div>

        <div className="w-px h-5 bg-slate-300/50 dark:bg-slate-700/50 mx-1" />

        {/* Dropdown Menu */}
        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setShowHeadingDropdown(!showHeadingDropdown)} className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl hover:bg-white/80 dark:hover:bg-white/10 text-sm font-medium text-slate-700 dark:text-slate-300 w-36 transition">
            <span className="truncate">{getCurrentHeadingLabel()}</span>
            <ChevronDown className="h-3 w-3 opacity-50" />
          </button>
          
          {showHeadingDropdown && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-white/95 dark:bg-[#1A1A1A]/95 backdrop-blur-2xl rounded-2xl shadow-xl border border-white/60 dark:border-white/10 py-1.5 z-50 overflow-hidden">
              {[
                { label: 'Normal Text', value: 0 },
                { label: 'Heading 1', value: 1 },
                { label: 'Heading 2', value: 2 },
                { label: 'Heading 3', value: 3 },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setHeading(option.value)}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors ${
                    (option.value === 0 && !editor.isActive('heading')) || editor.isActive('heading', { level: option.value })
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10 font-semibold' 
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className={option.value === 0 ? 'font-normal' : `font-bold text-${option.value === 1 ? 'lg' : option.value === 2 ? 'base' : 'sm'}`}>
                    {option.label}
                  </span>
                  {((option.value === 0 && !editor.isActive('heading')) || editor.isActive('heading', { level: option.value })) && (
                    <Check className="h-4 w-4" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-slate-300/50 dark:bg-slate-700/50 mx-1" />

        <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded-xl transition-all ${editor.isActive('bold') ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-white/10'}`}>
          <Bold className="h-4 w-4" />
        </button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded-xl transition-all ${editor.isActive('italic') ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-white/10'}`}>
          <Italic className="h-4 w-4" />
        </button>

        <div className="w-px h-5 bg-slate-300/50 dark:bg-slate-700/50 mx-1" />

        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 rounded-xl transition-all ${editor.isActive('bulletList') ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-white/10'}`}>
          <List className="h-4 w-4" />
        </button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-2 rounded-xl transition-all ${editor.isActive('orderedList') ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-white/10'}`}>
          <ListOrdered className="h-4 w-4" />
        </button>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 overflow-y-auto bg-transparent px-2" onClick={() => editor.chain().focus().run()}>
        <EditorContent editor={editor} />
      </div>
    </>
  );

  // Expanded View uses a heavily frosted backdrop and a floating glass window
  if (expanded) {
     return createPortal(
      <div className="fixed inset-0 bg-slate-900/20 dark:bg-black/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200">
        <div className="w-full max-w-5xl h-full max-h-[90vh] flex flex-col bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/60 dark:border-white/10 overflow-hidden animate-in zoom-in-95 duration-200">
          {content}
        </div>
      </div>,
      document.body
    );
  }

  // Normal view relies on parent container's glass styling
  return (
    <div className="h-full flex flex-col bg-transparent">
      {content}
    </div>
  );
};

export default NoteEditor;