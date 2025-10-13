import { useState, useRef, useEffect } from "react";
import { Download, X, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Spinner } from "@/components/ui/spinner";

interface DocumentFile {
  id: number;
  type: string;
  url: string;
}

interface DocumentViewerProps {
  files: DocumentFile[];
  title?: string;
  subtitle?: string;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ 
  files, 
  title, 
  subtitle, 
  isLoading = false, 
  error = null, 
  onRetry 
}) => {
  const [selectedImage, setSelectedImage] = useState<DocumentFile | null>(null);
  const [zoom, setZoom] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const handleDownload = (file: DocumentFile) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = `${getFileTypeLabel(file.type)}_${file.id}`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));

  const resetImageView = () => {
    setZoom(100);
    setImagePosition({ x: 0, y: 0 });
  };

  // Handle scroll wheel zoom
  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -10 : 10;
    setZoom(prev => Math.max(50, Math.min(200, prev + delta)));
  };

  // Attach wheel event listener with passive: false
  useEffect(() => {
    const container = imageContainerRef.current;
    if (container && selectedImage) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        container.removeEventListener('wheel', handleWheel);
      };
    }
  }, [selectedImage]);

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 100) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
    }
  };

  // Handle mouse move for dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 100) {
      e.preventDefault();
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  // Handle mouse up to stop dragging
  const handleMouseUp = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      setIsDragging(false);
    }
  };

  // Handle mouse leave to stop dragging
  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const getFileTypeLabel = (type: string) => {
    switch (type) {
      case 'permit':
        return 'Business Permit';
      case 'assessment':
        return 'Assessment Document';
      case 'previous_permit':
        return 'Previous Permit';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
        <span className="ml-3 text-gray-600">Loading documents...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700 font-medium">Error loading documents</p>
        <p className="text-red-600 text-sm mt-2">{error}</p>
        {onRetry && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            className="mt-4"
          >
            Retry
          </Button>
        )}
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-600 font-medium">No documents uploaded</p>
        <p className="text-gray-500 text-sm mt-2">
          This request doesn't have any uploaded documents.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold text-gray-800">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
      )}

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h4 className="font-semibold text-gray-800">
                  {getFileTypeLabel(selectedImage.type)}
                </h4>
                
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleZoomOut}
                  disabled={zoom <= 50}
                >
                  <ZoomOut size={16} />
                </Button>
                <span className="text-sm font-medium text-gray-600 min-w-[60px] text-center">
                  {zoom}%
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleZoomIn}
                  disabled={zoom >= 200}
                >
                  <ZoomIn size={16} />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDownload(selectedImage)}
                >
                  <Download size={16} />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={resetImageView}
                  disabled={zoom === 100 && imagePosition.x === 0 && imagePosition.y === 0}
                >
                  Reset
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setSelectedImage(null);
                    resetImageView();
                  }}
                >
                  <X size={20} />
                </Button>
              </div>
            </div>

            {/* Image Container */}
            <div 
              ref={imageContainerRef}
              className="flex-1 overflow-hidden bg-gray-100 flex items-center justify-center p-4 relative select-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              style={{ 
                cursor: isDragging ? 'grabbing' : (zoom > 100 ? 'grab' : 'default'),
                userSelect: 'none'
              }}
            >
              {/* Instructions overlay */}
              {zoom > 100 && (
                <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded z-10">
                  Drag to pan • Scroll to zoom
                </div>
              )}
              <img
                src={selectedImage.url}
                alt={getFileTypeLabel(selectedImage.type)}
                style={{
                  transform: `scale(${zoom / 100}) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                  transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  userSelect: 'none',
                  pointerEvents: 'none',
                  touchAction: 'none'
                }}
                draggable={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {files.map((file) => (
          <div 
            key={file.id} 
            className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Document Header */}
            <div className="bg-gray-50 px-4 py-3 border-b">
              <h4 className="font-medium text-gray-800">
                {getFileTypeLabel(file.type)}
              </h4>
             
            </div>

            {/* Image Preview */}
            <div 
              className="relative h-64 bg-gray-100 cursor-pointer overflow-hidden group"
              onClick={() => setSelectedImage(file)}
            >
              <img
                src={file.url}
                alt={getFileTypeLabel(file.type)}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3Ctext fill="%23999" x="50" y="50" font-size="14" text-anchor="middle" dominant-baseline="middle"%3EImage not found%3C/text%3E%3C/svg%3E';
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn size={32} className="text-white" />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-3 flex justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedImage(file)}
              >
                <ZoomIn size={14} className="mr-1" />
                View
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDownload(file)}
              >
                <Download size={14} className="mr-1" />
                Download
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
