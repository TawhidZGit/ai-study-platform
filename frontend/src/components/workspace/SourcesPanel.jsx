import { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Trash2, Loader2, Eye, Maximize2, Minimize2, X, ZoomIn, ZoomOut, Download } from 'lucide-react';
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
    if (!confirm('Delete this source?')) return;

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
      <div className="h-full flex flex-col bg-white">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex-shrink-0">
          <h2 className="text-lg font-bold text-slate-800 mb-3">Sources</h2>
          
          {/* Upload Area */}
          <div className="space-y-3">
            <label className="block group">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer group-hover:border-indigo-400 group-hover:bg-indigo-50/30 transition-all">
                <div className="w-8 h-8 bg-slate-100 text-slate-400 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-white group-hover:text-indigo-500 transition-colors">
                   <Upload className="h-4 w-4" />
                </div>
                <p className="text-xs font-semibold text-slate-600">
                  {selectedFile ? selectedFile.name : 'Click to upload'}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">PDF or TXT (max 10MB)</p>
              </div>
            </label>

            {selectedFile && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 text-sm font-semibold shadow-md shadow-indigo-500/20 transition-all"
              >
                {uploading ? 'Uploading...' : 'Upload Source'}
              </button>
            )}

            {error && (
              <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-xs font-medium">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Sources List */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
            </div>
          ) : sources.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FileText className="h-10 w-10 mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-medium">No sources yet</p>
              <p className="text-xs mt-1">Upload files to begin</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sources.map((source) => (
                <div
                  key={source.id}
                  className="bg-white border border-slate-200 rounded-xl p-3 hover:border-indigo-200 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="p-1.5 bg-indigo-50 rounded-lg flex-shrink-0">
                        <FileText className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-slate-800 truncate">
                          {source.filename}
                        </h3>
                        <p className="text-[10px] font-medium text-slate-400 mt-0.5 uppercase tracking-wide">
                          {source.word_count} words • {source.file_type || 'FILE'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewSource(source.id)}
                      className="flex-1 px-3 py-1.5 text-xs font-medium bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-slate-100 hover:border-indigo-100"
                    >
                      <Eye className="h-3 w-3" />
                      View Content
                    </button>
                    <button
                      onClick={() => handleDelete(source.id)}
                      className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
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

// Source Viewer Component
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
      {/* Header */}
      <div className="p-3 border-b border-slate-200 flex items-center justify-between flex-shrink-0 bg-white/90 backdrop-blur z-10">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-500 hover:text-slate-800">
            <X className="h-5 w-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-slate-800 truncate">{source.filename}</h2>
            <p className="text-xs text-slate-500 truncate">{source.word_count} words</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Zoom Controls */}
          <div className="hidden sm:flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5">
            <button
              onClick={() => setZoom(Math.max(50, zoom - 10))}
              className="p-1.5 hover:bg-white hover:shadow-sm rounded text-slate-500 transition-all"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="px-2 text-[10px] font-medium text-slate-600 min-w-[36px] text-center">
              {zoom}%
            </span>
            <button
              onClick={() => setZoom(Math.min(200, zoom + 10))}
              className="p-1.5 hover:bg-white hover:shadow-sm rounded text-slate-500 transition-all"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="h-6 w-px bg-slate-200 mx-1"></div>

          <button onClick={handleDownload} className="p-2 hover:bg-slate-100 text-slate-500 rounded-lg transition" title="Download">
            <Download className="h-4 w-4" />
          </button>

          <button onClick={onExpand} className="p-2 hover:bg-slate-100 text-slate-500 rounded-lg transition" title={expanded ? "Minimize" : "Expand"}>
            {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>

          <button onClick={onDelete} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition" title="Delete">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-slate-100/50 p-4 sm:p-8">
        <div
          className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-sm border border-slate-200 min-h-[500px]"
          style={{ fontSize: `${zoom}%` }}
          onMouseUp={handleTextSelect}
        >
          <div className="prose prose-slate prose-sm max-w-none">
            {source.content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4 leading-relaxed text-slate-700">
                {paragraph || '\u00A0'}
              </p>
            ))}
          </div>
        </div>

        {/* Selected Text Indicator */}
        {selectedText && (
          <div className="fixed bottom-6 right-6 bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-lg shadow-amber-500/10 max-w-xs z-50 animate-in slide-in-from-bottom-2">
            <p className="text-xs font-bold text-amber-800 mb-1 uppercase tracking-wide">Selected Text</p>
            <p className="text-sm text-slate-700 line-clamp-3 italic bg-white/50 p-2 rounded-lg border border-amber-100">{selectedText}</p>
          </div>
        )}
      </div>
    </>
  );

  if (expanded) {
    return (
      <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col">
        {content}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {content}
    </div>
  );
};

export default SourcesPanel;