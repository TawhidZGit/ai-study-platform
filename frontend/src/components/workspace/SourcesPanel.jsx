import { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import { Upload, FileText, Loader2, Trash2, Eye } from 'lucide-react';

const SourcesPanel = ({ projectId, onSourcesUpdate }) => {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedSource, setSelectedSource] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'view'
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchSources();
  }, [projectId]);

  const fetchSources = async () => {
    try {
      const response = await api.get(`/sources/project/${projectId}`);
      setSources(response.data.sources);
      if (onSourcesUpdate) onSourcesUpdate(); // Notify parent
    } catch (error) {
      console.error('Error fetching sources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.pdf') && !file.name.endsWith('.txt')) {
      alert('Only PDF and TXT files are supported');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post(`/sources/upload/${projectId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      await fetchSources();
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (sourceId) => {
    if (!confirm('Delete this source?')) return;

    try {
      await api.delete(`/sources/${sourceId}`);
      setSources(sources.filter(s => s.id !== sourceId));
      if (selectedSource?.id === sourceId) {
        setSelectedSource(null);
        setViewMode('list');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete source');
    }
  };

  const handleViewSource = async (source) => {
    try {
      const response = await api.get(`/sources/${source.id}`);
      setSelectedSource(response.data.source);
      setViewMode('view');
    } catch (error) {
      console.error('Error loading source:', error);
      alert('Failed to load source');
    }
  };

  if (viewMode === 'view' && selectedSource) {
    return (
      <div className="h-full flex flex-col bg-white">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <button
              onClick={() => {
                setViewMode('list');
                setSelectedSource(null);
              }}
              className="text-blue-600 hover:underline text-sm mb-1"
            >
              ← Back to sources
            </button>
            <h3 className="font-semibold text-gray-800">{selectedSource.filename}</h3>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">
              {selectedSource.content}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Sources</h2>
        
        {/* Upload Button */}
        <label className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition cursor-pointer">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          {uploading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <span className="text-sm text-blue-600">Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="h-5 w-5 text-gray-600" />
              <span className="text-sm text-gray-600">Upload PDF or TXT</span>
            </>
          )}
        </label>
      </div>

      {/* Sources List */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : sources.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No sources uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sources.map((source) => (
              <div
                key={source.id}
                className="group border border-gray-200 rounded-lg p-3 hover:border-blue-400 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <h3 className="font-medium text-sm text-gray-800 truncate">
                        {source.filename}
                      </h3>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{source.file_type?.toUpperCase()}</span>
                      <span>•</span>
                      <span>{source.word_count?.toLocaleString()} words</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => handleViewSource(source)}
                      className="p-1.5 hover:bg-blue-50 rounded text-blue-600"
                      title="View"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(source.id)}
                      className="p-1.5 hover:bg-red-50 rounded text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SourcesPanel;