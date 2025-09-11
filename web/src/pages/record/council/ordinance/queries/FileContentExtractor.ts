// Dynamic imports to avoid type resolution issues at build time
let pdfjsLib: any;
let Tesseract: any;
let mammoth: any;

export interface ExtractedContent {
    text: string;
    confidence: number;
    fileType: string;
    extractionMethod: string;
    error?: string;
}

export class FileContentExtractor {
    private static instance: FileContentExtractor;

    private constructor() { }

    public static getInstance(): FileContentExtractor {
        if (!FileContentExtractor.instance) {
            FileContentExtractor.instance = new FileContentExtractor();
        }
        return FileContentExtractor.instance;
    }

    /**
     * Extract text content from a file URL
     */
    public async extractContent(fileUrl: string): Promise<ExtractedContent> {
        try {
            const fileType = this.getFileType(fileUrl);

            switch (fileType) {
                case 'pdf':
                    return await this.extractFromPDF(fileUrl);
                case 'doc':
                case 'docx':
                    return await this.extractFromWord(fileUrl);
                case 'txt':
                    return await this.extractFromText(fileUrl);
                case 'image':
                    return await this.extractFromImage(fileUrl);
                default:
                    return {
                        text: '',
                        confidence: 0,
                        fileType,
                        extractionMethod: 'unsupported',
                        error: `File type ${fileType} is not supported for text extraction`
                    };
            }
        } catch (error) {
            console.error('Error extracting file content:', error);
            return {
                text: '',
                confidence: 0,
                fileType: 'unknown',
                extractionMethod: 'failed',
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    /**
     * Extract text from PDF files
     */
    private async extractFromPDF(fileUrl: string): Promise<ExtractedContent> {
        try {
            if (!pdfjsLib) {
                // @ts-ignore
                pdfjsLib = await import('pdfjs-dist/build/pdf');
            }
            // Set worker source for PDF.js
            pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

            const loadingTask = pdfjsLib.getDocument(fileUrl);
            const pdf = await loadingTask.promise;

            let fullText = '';
            let totalPages = pdf.numPages;

            for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const textContent = await page.getTextContent();
                const pageText = textContent.items
                    .map((item: any) => item.str)
                    .join(' ');
                fullText += pageText + '\n';
            }

            return {
                text: fullText.trim(),
                confidence: 0.95,
                fileType: 'pdf',
                extractionMethod: 'pdf.js'
            };
        } catch (error) {
            console.error('PDF extraction failed:', error);
            return {
                text: '',
                confidence: 0,
                fileType: 'pdf',
                extractionMethod: 'pdf.js',
                error: error instanceof Error ? error.message : 'PDF extraction failed'
            };
        }
    }

    /**
     * Extract text from Word documents
     */
    private async extractFromWord(fileUrl: string): Promise<ExtractedContent> {
        try {
            if (!mammoth) {
                try {
                    // @ts-ignore - try ESM build first
                    mammoth = await import('mammoth');
                } catch (_err) {
                    // Fallback: load browser build via script tag (works with Vite)
                    await this.loadScript('https://unpkg.com/mammoth/mammoth.browser.min.js');
                    // @ts-ignore
                    mammoth = (window as any).mammoth;
                }
            }
            const response = await fetch(fileUrl);
            const arrayBuffer = await response.arrayBuffer();

            // Use mammoth.js to extract text from Word documents
            const result = await mammoth.extractRawText({ arrayBuffer });

            return {
                text: result.value.trim(),
                confidence: 0.9,
                fileType: 'docx',
                extractionMethod: 'mammoth.js'
            };
        } catch (error) {
            console.error('Word document extraction failed:', error);
            return {
                text: '',
                confidence: 0,
                fileType: 'docx',
                extractionMethod: 'mammoth.js',
                error: error instanceof Error ? error.message : 'Word document extraction failed'
            };
        }
    }

    private loadScript(src: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const existing = document.querySelector(`script[src="${src}"]`);
            if (existing) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
            document.head.appendChild(script);
        });
    }

    /**
     * Extract text from plain text files
     */
    private async extractFromText(fileUrl: string): Promise<ExtractedContent> {
        try {
            const response = await fetch(fileUrl);
            const text = await response.text();

            return {
                text: text.trim(),
                confidence: 1.0,
                fileType: 'txt',
                extractionMethod: 'fetch'
            };
        } catch (error) {
            console.error('Text file extraction failed:', error);
            return {
                text: '',
                confidence: 0,
                fileType: 'txt',
                extractionMethod: 'fetch',
                error: error instanceof Error ? error.message : 'Text file extraction failed'
            };
        }
    }

    /**
     * Extract text from images using OCR
     */
    private async extractFromImage(fileUrl: string): Promise<ExtractedContent> {
        try {
            if (!Tesseract) {
                try {
                    // @ts-ignore
                    Tesseract = (await import('tesseract.js')).default || (await import('tesseract.js'));
                } catch (_err) {
                    // Fallback: load browser build via CDN
                    await this.loadScript('https://unpkg.com/tesseract.js@4.1.1/dist/tesseract.min.js');
                    // @ts-ignore
                    Tesseract = (window as any).Tesseract;
                }
            }
            // Use Tesseract.js for image OCR
            const result = await Tesseract.recognize(fileUrl, 'eng', {
                logger: (m: any) => console.log(m)
            });

            return {
                text: result.data.text.trim(),
                confidence: result.data.confidence / 100, // Convert percentage to decimal
                fileType: 'image',
                extractionMethod: 'tesseract.js'
            };
        } catch (error) {
            console.error('Image OCR failed:', error);
            return {
                text: '',
                confidence: 0,
                fileType: 'image',
                extractionMethod: 'tesseract.js',
                error: error instanceof Error ? error.message : 'Image OCR failed'
            };
        }
    }

    /**
     * Get file type from URL
     */
    private getFileType(fileUrl: string): string {
        const url = fileUrl.toLowerCase();

        if (url.includes('.pdf')) return 'pdf';
        if (url.includes('.doc') || url.includes('.docx')) return 'docx';
        if (url.includes('.txt')) return 'txt';
        if (url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') || url.includes('.gif')) return 'image';

        return 'unknown';
    }



    /**
     * Extract content from multiple files
     */
    public async extractMultipleFiles(fileUrls: string[]): Promise<ExtractedContent[]> {
        const results: ExtractedContent[] = [];

        for (const fileUrl of fileUrls) {
            const result = await this.extractContent(fileUrl);
            results.push(result);
        }

        return results;
    }

    /**
     * Combine extracted content from multiple files
     */
    public combineExtractedContent(contents: ExtractedContent[]): string {
        return contents
            .filter(content => content.text && content.confidence > 0.5)
            .map(content => `[${content.fileType.toUpperCase()}] ${content.text}`)
            .join('\n\n---\n\n');
    }

    /**
     * Test function to demonstrate file extraction capabilities
     */
    public async testExtraction(fileUrl: string): Promise<void> {
        console.log('🧪 Testing file content extraction...');
        console.log('File URL:', fileUrl);

        try {
            const result = await this.extractContent(fileUrl);
            console.log('✅ Extraction Result:', result);

            if (result.text) {
                console.log('📄 Extracted Text Preview:', result.text.substring(0, 200) + '...');
            }

            if (result.error) {
                console.warn('⚠️ Extraction Warning:', result.error);
            }
        } catch (error) {
            console.error('❌ Extraction Test Failed:', error);
        }
    }
}
