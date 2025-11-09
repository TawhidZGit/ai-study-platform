import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Trash2, BookOpen, Brain, GraduationCap, X, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

/**
 * A reusable Modal component
 */
const Modal = ({ isOpen, onClose, onConfirm, title, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md transform rounded-lg bg-white p-6 shadow-xl transition-all">
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0">
              <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-semibold leading-6 text-gray-900" id="modal-title">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
          >
            <span className="sr-only">Close</span>
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="mt-4 text-sm text-gray-600">
          {children}
        </div>

        {/* Modal Footer */}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 sm:w-auto"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="w-full rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 sm:w-auto"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Action Button Component
 */
const ActionButton = ({ icon, label, href }) => {
  return (
    <a
      href={href}
      className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-700"
    >
      <span className="text-blue-600">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </a>
  );
};


/**
 * Document Card Component
 */
const DocumentCard = ({ document, onDeleteClick }) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <FileText className="h-10 w-10 flex-shrink-0 text-blue-600" />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-800 break-words">{document.filename}</h3>
            <p className="text-sm text-gray-500">
              Uploaded {new Date(document.upload_date).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex w-full flex-shrink-0 items-center gap-2 sm:w-auto">
          <button
            onClick={() => setShowActions(!showActions)}
            className="w-1/2 rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 sm:w-auto"
          >
            AI Tools
          </button>
          <button
            onClick={() => onDeleteClick(document.id)}
            className="w-1/2 rounded-lg p-2 text-red-600 transition hover:bg-red-50 sm:w-auto"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* AI Actions */}
      {showActions && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <ActionButton
              icon={<Brain />}
              label="Generate Summary"
              href={`/documents/${document.id}/summary`}
            />
            <ActionButton
              icon={<BookOpen />}
              label="Create Quiz"
              href={`/documents/${document.id}/quiz`}
            />
            <ActionButton
              icon={<GraduationCap />}
              label="Make Flashcards"
              href={`/documents/${document.id}/flashcards`}
            />
          </div>
        </div>
      )}
    </div>
  );
};


/**
 * Main Documents Component
 */
const Documents = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  
  // State for the delete confirmation modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);

  // Ref for the file input
  const fileInputRef = useRef(null);

  // Use React.useCallback to memoize fetchDocuments
  const fetchDocuments = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/documents');
      setDocuments(response.data.documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array, so this function is created once

  // Fetch documents on load
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]); // Now safe to include fetchDocuments in dependencies

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.pdf') && !file.name.endsWith('.txt')) {
        setError('Only PDF and TXT files are supported');
        setSelectedFile(null); // Clear invalid file
        return;
      }
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        setSelectedFile(null); // Clear invalid file
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
      await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Refresh document list
      await fetchDocuments();
      
      setSelectedFile(null);
      
      // Reset file input using the ref
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.response?.data?.error || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  // --- Delete Flow ---

  // 1. User clicks delete button on a card
  const handleDeleteClick = (documentId) => {
    setDocumentToDelete(documentId);
    setIsModalOpen(true);
  };

  // 2. User confirms deletion in the modal
  const handleConfirmDelete = async () => {
    if (!documentToDelete) return;

    try {
      await api.delete(`/documents/${documentToDelete}`);
      // Refresh the list from the "server" to ensure consistency
      await fetchDocuments();
    } catch (error) {
      console.error('Delete error:', error);
      setError('Failed to delete document');
    } finally {
      // 3. Close modal and reset state
      setIsModalOpen(false);
      setDocumentToDelete(null);
    }
  };

  // 4. User cancels deletion
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setDocumentToDelete(null);
  };
  // --- End of Delete Flow ---


  if (loading && documents.length === 0) { // Only show full-screen loader on initial load
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-gray-600">Loading documents...</div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">My Documents</h1>

          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload New Document</h2>
            
            <div className="flex items-center gap-4">
              <label className="flex-1">
                <input
                  id="file-input"
                  ref={fileInputRef} // Attach the ref
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                  aria-label="Upload document"
                />
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-gray-600 break-words">
                    {selectedFile ? selectedFile.name : 'Click to select a file'}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">PDF or TXT (max 10MB)</p>
                </div>
              </label>
            </div>

            {selectedFile && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload Document'}
              </button>
            )}

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}
          </div>

          {/* Documents List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Your Documents</h2>
              {loading && <div className="text-sm text-gray-500">Refreshing...</div>}
            </div>
            
            {documents.length === 0 && !loading ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="mx-auto h-16 w-16 mb-4 text-gray-300" />
                <p>No documents uploaded yet</p>
                <p className="text-sm mt-2">Upload your first document to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {documents.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    onDeleteClick={handleDeleteClick} // Pass the new click handler
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        title="Delete Document"
      >
        <p>Are you sure you want to delete this document? This action cannot be undone.</p>
      </Modal>
    </>
  );
};

export default Documents;