import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer } from '@react-pdf/renderer';

// Type definitions
type Orientation = 'portrait' | 'landscape';

// Paper dimensions in points (1pt = 1/72 inch)
const PAPER_SIZES = {
  A4: { width: 595, height: 842 },
  LETTER: { width: 612, height: 792 },
  LEGAL: { width: 612, height: 1008 },
  A5: { width: 420, height: 595 }
} as const;

// PDF Document Component
const TemplateDocument = ({
  paperSize,
  orientation,
  content
}: {
  paperSize: keyof typeof PAPER_SIZES;
  orientation: Orientation;
  content: string;
}) => {
  // PDF-specific styles (not Tailwind)
  const styles = StyleSheet.create({
    page: {
      flexDirection: 'column',
      padding: 40,
      ...(orientation === 'landscape'
        ? { width: PAPER_SIZES[paperSize].height, height: PAPER_SIZES[paperSize].width }
        : PAPER_SIZES[paperSize])
    },
    header: {
      fontSize: 24,
      marginBottom: 20,
      textAlign: 'center',
      fontFamily: 'Helvetica-Bold'
    },
    content: {
      fontSize: 12,
      lineHeight: 1.5,
      fontFamily: 'Helvetica'
    },
    footer: {
      position: 'absolute',
      fontSize: 10,
      bottom: 30,
      left: 40,
      right: 40,
      textAlign: 'center',
      color: 'gray'
    }
  });

  return (
    <Document>
      <Page 
        size={paperSize}
        orientation={orientation}
        style={styles.page}
      >
        <View>
          <Text style={styles.header}>Professional Document</Text>
          <Text style={styles.content}>{content}</Text>
          <Text style={styles.footer}>
            Page: {paperSize} | {orientation} | {new Date().toLocaleDateString()}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

// Main Component with Tailwind Styling
export default function ReportDocument() {
  const [paperSize, setPaperSize] = React.useState<keyof typeof PAPER_SIZES>('A4');
  const [orientation, setOrientation] = React.useState<Orientation>('portrait');
  const [content, setContent] = React.useState<string>(
    'This is a professionally generated PDF document. You can edit this content before export.\n\n' +
    'Key Features:\n• Paper size selection (A4, Letter, Legal, A5)\n• Portrait/Landscape orientation\n• Live preview\n• Tailwind CSS styling'
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6 space-y-6">
        {/* Header */}
        <div className="border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-800">PDF Export Generator</h1>
          <p className="text-gray-600">Create and preview PDFs with custom settings</p>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Paper Size Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Paper Size</label>
            <select
              value={paperSize}
              onChange={(e) => setPaperSize(e.target.value as keyof typeof PAPER_SIZES)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.keys(PAPER_SIZES).map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          {/* Orientation Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Orientation</label>
            <select
              value={orientation}
              onChange={(e) => setOrientation(e.target.value as Orientation)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>
        </div>

        {/* Content Editor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Document Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* PDF Preview */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 border-b">
            <h2 className="font-medium text-gray-700">Live Preview</h2>
          </div>
          <div className="h-[500px]">
            <PDFViewer width="100%" height="100%">
              <TemplateDocument 
                paperSize={paperSize} 
                orientation={orientation} 
                content={content} 
              />
            </PDFViewer>
          </div>
        </div>
      </div>
    </div>
  );
};