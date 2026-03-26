import { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Trash2, Loader2, Eye, Maximize2, Minimize2, X, ZoomIn, ZoomOut, Download, Plus } from 'lucide-react';
import api from '../../utils/api';

const SourcesPanel = ({ projectId, onSourcesUpdate }) => {
  const [sources, setSources] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [viewingSource, setViewingSource] = useState(null);
  const [expandedView, setExpandedView] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchSources();
  }, [projectId]);

  const fetchSources = async () => {
    try {
      const response = await api.get(`/sources/project/${projectId}`);
      setSources(response.data.sources);
      if (onSourcesUpdate) onSourcesUpdate();
    } catch (error) {
      console.error('Error fetching sources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.endsWith('.pdf') && !file.name.endsWith('.txt')) {
        setError('Only PDF and TXT files are supported');
        setSelectedFile(null);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      await api.post(`/sources/upload/${projectId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      await fetchSources();
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.response?.data?.error || 'Failed to upload source');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (sourceId) => {
    if (!confirm('Permanently delete this source? This action cannot be undone.')) return;

    try {
      await api.delete(`/sources/${sourceId}`);
      await fetchSources();
      if (viewingSource?.id === sourceId) {
        setViewingSource(null);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete source');
    }
  };

  const handleViewSource = async (sourceId) => {
    try {
      const response = await api.get(`/sources/${sourceId}`);
      setViewingSource(response.data.source);
      setExpandedView(false);
    } catch (error) {
      console.error('Error loading source:', error);
      alert('Failed to load source');
    }
  };

  // Inline viewer in panel
  if (viewingSource && !expandedView) {
    return (
      <SourceViewer
        source={viewingSource}
        onClose={() => setViewingSource(null)}
        onExpand={() => setExpandedView(true)}
        onDelete={() => handleDelete(viewingSource.id)}
        expanded={false}
      />
    );
  }

  return (
    <>
      <div className="h-full flex flex-col bg-white/40 dark:bg-[#1A1A1A]/40 backdrop-blur-2xl border-r border-white/60 dark:border-white/10 transition-colors z-10 relative shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
        
        {/* Header & Upload */}
        <div className="p-6 border-b border-white/60 dark:border-white/10 flex-shrink-0 bg-white/20 dark:bg-white/5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold tracking-tight text-slate-800 dark:text-slate-100">
              Sources
            </h2>
          </div>
          
          <div className="space-y-4">
            <label className="block group cursor-pointer relative">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="border border-dashed border-slate-300 dark:border-white/20 rounded-3xl p-6 text-center bg-white/30 dark:bg-black/20 backdrop-blur-sm group-hover:bg-white/60 dark:group-hover:bg-white/10 group-hover:border-indigo-400 dark:group-hover:border-indigo-500/50 transition-all duration-300">
                <div className="w-12 h-12 bg-white/80 dark:bg-white/10 text-slate-400 dark:text-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-110 group-hover:text-indigo-500 transition-all duration-300">
                   <Upload className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {selectedFile ? selectedFile.name : 'Upload Document'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">PDF or TXT up to 10MB</p>
              </div>
            </label>

            {selectedFile && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 text-sm font-semibold shadow-lg shadow-slate-900/20 dark:shadow-white/10 transition-all flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</>
                ) : (
                  <><Plus className="h-4 w-4" /> Add to Space</>
                )}
              </button>
            )}

            {error && (
              <div className="bg-rose-50/80 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 p-3.5 rounded-2xl text-sm font-medium backdrop-blur-md">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Sources List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
          ) : sources.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-white/50 dark:bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-white/60 dark:border-white/10 shadow-sm backdrop-blur-md">
                <FileText className="h-8 w-8 text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No sources yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sources.map((source) => (
                <div
                  key={source.id}
                  className="bg-white/60 dark:bg-[#222]/60 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-3xl p-5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:-translate-y-0.5 transition-all duration-300 group"
                >
                  <div className="flex items-start gap-4 mb-5">
                    <div className="p-3 bg-white/80 dark:bg-black/20 shadow-sm border border-white/50 dark:border-white/5 rounded-2xl flex-shrink-0 group-hover:scale-105 group-hover:text-indigo-600 transition-all">
                      <FileText className="h-5 w-5 text-indigo-500" />
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">
                        {source.filename}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-white/50 dark:bg-white/5 px-2 py-0.5 rounded-md border border-slate-200/50 dark:border-white/5">
                          {source.file_type || 'DOC'}
                        </span>
                        <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                          {source.word_count} words
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewSource(source.id)}
                      className="flex-1 py-2 text-xs font-semibold bg-white/50 dark:bg-white/5 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-white/10 rounded-xl transition-all flex items-center justify-center gap-2 border border-white/60 dark:border-white/10 shadow-sm hover:shadow"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View Document
                    </button>
                    <button
                      onClick={() => handleDelete(source.id)}
                      className="p-2.5 text-slate-400 hover:text-rose-500 bg-white/50 dark:bg-white/5 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-white/60 dark:border-white/10 rounded-xl transition-all shadow-sm"
                      title="Delete Source"
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

      {/* Expanded Viewer Modal */}
      {viewingSource && expandedView && (
        <SourceViewer
          source={viewingSource}
          onClose={() => {
            setViewingSource(null);
            setExpandedView(false);
          }}
          onExpand={() => setExpandedView(false)}
          onDelete={() => handleDelete(viewingSource.id)}
          expanded={true}
        />
      )}
    </>
  );
};

// Source Viewer Component (Glassmorphism Styled)
const SourceViewer = ({ source, onClose, onExpand, onDelete, expanded }) => {
  const [zoom, setZoom] = useState(100);
  const [selectedText, setSelectedText] = useState('');

  const handleTextSelect = () => {
    const selection = window.getSelection();
    const text = selection.toString();
    if (text) {
      setSelectedText(text);
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([source.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = source.filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const content = (
    <>
      {/* Header - Glassy */}
      <div className="p-4 border-b border-white/60 dark:border-white/10 flex items-center justify-between flex-shrink-0 bg-white/40 dark:bg-[#1A1A1A]/60 backdrop-blur-2xl z-20">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <button 
            onClick={onClose} 
            className="p-2 bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-white/60 dark:border-white/10 rounded-full transition-all text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 shadow-sm"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{source.filename}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{source.word_count} words</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          {/* Zoom Controls */}
          <div className="hidden sm:flex items-center gap-1 bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 shadow-sm rounded-full p-1">
            <button
              onClick={() => setZoom(Math.max(50, zoom - 10))}
              className="p-1.5 hover:bg-white dark:hover:bg-white/10 rounded-full text-slate-500 dark:text-slate-400 transition-all"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="px-2 text-[11px] font-bold text-slate-700 dark:text-slate-200 min-w-[40px] text-center">
              {zoom}%
            </span>
            <button
              onClick={() => setZoom(Math.min(200, zoom + 10))}
              className="p-1.5 hover:bg-white dark:hover:bg-white/10 rounded-full text-slate-500 dark:text-slate-400 transition-all"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="h-6 w-px bg-slate-300/50 dark:bg-white/10 mx-1"></div>

          <button onClick={handleDownload} className="p-2.5 bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-white/60 dark:border-white/10 shadow-sm text-slate-500 dark:text-slate-300 rounded-full transition-all" title="Download">
            <Download className="h-4 w-4" />
          </button>

          <button onClick={onExpand} className="p-2.5 bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-white/60 dark:border-white/10 shadow-sm text-slate-500 dark:text-slate-300 rounded-full transition-all" title={expanded ? "Minimize" : "Expand"}>
            {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>

          <button onClick={onDelete} className="p-2.5 bg-white/50 dark:bg-white/5 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-white/60 dark:border-white/10 shadow-sm text-rose-500 rounded-full transition-all" title="Delete">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content - Document Body */}
      <div className="flex-1 overflow-y-auto bg-slate-50/30 dark:bg-black/20 p-4 sm:p-8 relative">
        <div
          className="max-w-4xl mx-auto p-8 sm:p-12 bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-white/60 dark:border-white/10 min-h-[500px]"
          style={{ fontSize: `${zoom}%` }}
          onMouseUp={handleTextSelect}
        >
          <div className="prose prose-slate dark:prose-invert prose-sm max-w-none dark:[&_*]:!text-slate-300">
            {source.content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-5 leading-relaxed text-slate-700 dark:text-slate-300">
                {paragraph || '\u00A0'}
              </p>
            ))}
          </div>
        </div>

        {/* Selected Text Popover */}
        {selectedText && (
          <div className="fixed bottom-8 right-8 bg-white/90 dark:bg-[#222]/90 backdrop-blur-2xl border border-white/60 dark:border-white/10 rounded-3xl p-5 shadow-2xl max-w-xs z-50 animate-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                Selected Text
              </p>
              <button onClick={() => setSelectedText('')} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-4 italic bg-slate-50 dark:bg-black/20 p-3 rounded-2xl border border-slate-200/50 dark:border-white/5">
              "{selectedText}"
            </p>
          </div>
        )}
      </div>
    </>
  );

  // Expanded Mode uses a fixed backdrop
  if (expanded) {
    return (
      <div className="fixed inset-0 bg-slate-900/20 dark:bg-black/40 backdrop-blur-md z-50 flex items-center justify-center sm:p-6">
        <div className="w-full h-full max-w-7xl flex flex-col bg-white/60 dark:bg-[#1A1A1A]/80 backdrop-blur-3xl sm:rounded-[2.5rem] border border-white/60 dark:border-white/10 overflow-hidden shadow-2xl">
          {content}
        </div>
      </div>
    );
  }

  // Inline mode is transparent to blend with the panel
  return (
    <div className="h-full flex flex-col bg-transparent relative z-10">
      {content}
    </div>
  );
};

export default SourcesPanel;