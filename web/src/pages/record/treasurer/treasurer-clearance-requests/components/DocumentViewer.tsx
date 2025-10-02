import { useState, useEffect } from "react";
import { Download, X, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Spinner } from "@/components/ui/spinner";
import { getBusinessPermitFiles } from "../restful-api/permitClearanceGetAPI";

interface BusinessPermitFile {
  bpf_id: number;
  bpf_name: string;
  bpf_type: string;
  bpf_path: string | null;
  bpf_url: string;
}

interface DocumentViewerProps {
  bprId: string;
  businessName: string;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ bprId, businessName }) => {
  const [files, setFiles] = useState<BusinessPermitFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<BusinessPermitFile | null>(null);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    fetchFiles();
  }, [bprId]);

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getBusinessPermitFiles(bprId);
      setFiles(response.files || []);
    } catch (err: any) {
      console.error("Error fetching files:", err);
      setError(err.message || "Failed to load documents");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (file: BusinessPermitFile) => {
    const link = document.createElement('a');
    link.href = file.bpf_url;
    link.download = file.bpf_name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const resetImageView = () => {
    setZoom(100);
    setRotation(0);
  };

  const getFileTypeLabel = (type: string) => {
    switch (type) {
      case 'previous_permit':
        return 'Previous Permit';
      case 'assessment':
        return 'Assessment Document';
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
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchFiles}
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-600 font-medium">No documents uploaded</p>
        <p className="text-gray-500 text-sm mt-2">
          This business permit request doesn't have any uploaded documents.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{businessName}</h3>
        <p className="text-sm text-gray-600">Business Permit ID: {bprId}</p>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h4 className="font-semibold text-gray-800">
                  {getFileTypeLabel(selectedImage.bpf_type)}
                </h4>
                <p className="text-sm text-gray-600">{selectedImage.bpf_name}</p>
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
                  onClick={handleRotate}
                >
                  <RotateCw size={16} />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDownload(selectedImage)}
                >
                  <Download size={16} />
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
            <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center p-4">
              <img
                src={selectedImage.bpf_url}
                alt={selectedImage.bpf_name}
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transition: 'transform 0.3s ease',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {files.map((file) => (
          <div 
            key={file.bpf_id} 
            className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Document Header */}
            <div className="bg-gray-50 px-4 py-3 border-b">
              <h4 className="font-medium text-gray-800">
                {getFileTypeLabel(file.bpf_type)}
              </h4>
              <p className="text-xs text-gray-600 mt-1">{file.bpf_name}</p>
            </div>

            {/* Image Preview */}
            <div 
              className="relative h-64 bg-gray-100 cursor-pointer overflow-hidden group"
              onClick={() => setSelectedImage(file)}
            >
              <img
                src={file.bpf_url}
                alt={file.bpf_name}
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

