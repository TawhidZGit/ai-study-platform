import { useState, useEffect } from 'react';
import { Loader2, ZoomIn, ZoomOut, Download, FileText, Eye } from 'lucide-react';

const PDFViewer = ({ source, onClose }) => {
  const [viewMode, setViewMode] = useState('pdf'); // 'pdf' or 'text'
  const [zoom, setZoom] = useState(100);
  const [selectedText, setSelectedText] = useState('');

  // For PDF viewing, we'll use an iframe with the PDF
  // For highlighting, we'll use the text mode

  const handleTextSelect = () => {
    const selection = window.getSelection();
    const text = selection.toString();
    if (text) {
      setSelectedText(text);
      // You could add functionality to save highlights here
    }
  };

  const handleDownload = () => {
    // Create a blob and download
    const element = document.createElement('a');
    const file = new Blob([source.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = source.filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{source.filename}</h2>
              <p className="text-xs text-gray-500">{source.word_count} words</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('pdf')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                  viewMode === 'pdf'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Eye className="h-4 w-4 inline mr-1" />
                PDF View
              </button>
              <button
                onClick={() => setViewMode('text')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                  viewMode === 'text'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <FileText className="h-4 w-4 inline mr-1" />
                Text View
              </button>
            </div>

            {/* Zoom Controls (for text view) */}
            {viewMode === 'text' && (
              <div className="flex items-center gap-1 border border-gray-300 rounded-lg">
                <button
                  onClick={() => setZoom(Math.max(50, zoom - 10))}
                  className="p-2 hover:bg-gray-100 rounded-l-lg"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <span className="px-3 text-sm font-medium text-gray-700 border-x">
                  {zoom}%
                </span>
                <button
                  onClick={() => setZoom(Math.min(200, zoom + 10))}
                  className="p-2 hover:bg-gray-100 rounded-r-lg"
                  title="Zoom In"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
              </div>
            )}

            <button
              onClick={handleDownload}
              className="p-2 hover:bg-gray-100 rounded-lg"
              title="Download"
            >
              <Download className="h-5 w-5" />
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
            >
              Close
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {viewMode === 'pdf' && source.file_type === 'pdf' ? (
            // PDF View - Show message since we can't embed PDFs easily without a library
            <div className="h-full flex items-center justify-center bg-gray-50 p-8">
              <div className="text-center max-w-md">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  PDF Preview Not Available
                </h3>
                <p className="text-gray-600 mb-6">
                  To view the original PDF, please download it or switch to Text View to see the extracted content.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Download PDF
                  </button>
                  <button
                    onClick={() => setViewMode('text')}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    View as Text
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Text View with Highlighting
            <div className="h-full overflow-y-auto bg-white">
              <div
                className="max-w-4xl mx-auto p-8"
                style={{ fontSize: `${zoom}%` }}
                onMouseUp={handleTextSelect}
              >
                <div className="prose prose-sm max-w-none">
                  {source.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 leading-relaxed text-gray-700 select-text">
                      {paragraph || '\u00A0'}
                    </p>
                  ))}
                </div>
              </div>

              {/* Selected Text Indicator */}
              {selectedText && (
                <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-300 rounded-lg p-3 shadow-lg max-w-xs">
                  <p className="text-xs font-medium text-yellow-800 mb-1">Selected Text:</p>
                  <p className="text-sm text-gray-700 line-clamp-3">{selectedText}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;