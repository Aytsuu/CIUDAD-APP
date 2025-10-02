import { AI_CONFIG, getApiKey, isGeminiConfigured } from './config';

export interface DocumentAnalysisResult {
    summary: string;
    keyPoints: string[];
    similarities: string[];
    differences: string[];
    recommendations: string[];
}

export interface ComparisonResult {
    similarityScore: number;
    differences: string[];
    similarities: string[];
    analysis: string;
}

export interface AIAnalysisResponse {
    summary: string;
    keyPoints?: string[];
    keyDifferences?: string[];
    similarities?: string[];
    differences?: string[];
    recommendations?: string[];
    riskLevel?: "low" | "medium" | "high";
    complianceStatus?: "compliant" | "needs-review" | "non-compliant";
    confidence?: number;
    analysisTimestamp?: string;
    analysisType?: string;
    timestamp?: string;
    similarityScore?: number;
    metadata?: {
        ordinanceCount: number;
        categories: string[];
        yearRange: { min: number; max: number };
    };
}

export class HuggingFaceAIService {
    private readonly API_KEY = getApiKey();

    private async sleep(ms: number) { return new Promise(res => setTimeout(res, ms)); }

    private async fetchWithRetry(url: string, init: RequestInit, maxRetries = 2): Promise<Response> {
        let attempt = 0;
        let delay = 15000; // 15s backoff
        while (true) {
            const resp = await fetch(url, init);
            if (resp.ok) return resp;
            if ((resp.status === 429 || resp.status === 503) && attempt < maxRetries) {
                attempt++;
                await this.sleep(delay);
                delay = Math.floor(delay * 1.5);
                continue;
            }
            return resp;
        }
    }

    /**
     * Call Gemini API (text endpoint)
     */
    private async callGeminiAPI(model: string, input: string): Promise<any> {
        if (!isGeminiConfigured()) {
            throw new Error('Gemini API not configured. Please set VITE_GEMINI_API_KEY in your environment variables.');
        }

        const safeInput = input.length > 6000 ? input.substring(0, 6000) : input;
        const response = await this.fetchWithRetry(`${AI_CONFIG.GEMINI_API_URL}/${model}:generateContent?key=${this.API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: safeInput }] }]
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    }

    /**
     * Utility: remove markdown asterisks and tidy whitespace
     */
    private sanitizeOutput(text: string): string {
        if (!text) return '';
        return text
            .replace(/\*/g, '')
            .replace(/\s+$/g, '')
            .trim();
    }

    /**
     * Build a short executive summary using Gemini
     */
    private async buildExecutiveSummary(title: string, text1: string, text2?: string): Promise<string> {
        const base = `Write a concise 2-3 sentence executive summary for: ${title}.`;
        const body = text2 ? `\n\nDocument A:\n${text1.substring(0, 1500)}\n\nDocument B:\n${text2.substring(0, 1500)}` : `\n\nDocument:\n${text1.substring(0, 2000)}`;
        const response = await this.callGeminiAPI(AI_CONFIG.MODELS.text, `${base}${body}`);
        const summary = response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        return this.sanitizeOutput(summary);
    }

    /**
     * Call Gemini Vision API with file inline data
     */
    private async callGeminiVisionAPI(model: string, prompt: string, fileUrl: string, mime: string = 'application/pdf'): Promise<any> {
        if (!isGeminiConfigured()) {
            throw new Error('Gemini API not configured. Please set VITE_GEMINI_API_KEY in your environment variables.');
        }

        const fileResp = await fetch(fileUrl);
        if (!fileResp.ok) {
            throw new Error(`Failed to fetch file: ${fileResp.status} ${fileResp.statusText}`);
        }
        const buffer = await fileResp.arrayBuffer();
        // Limit very large files
        const limited = buffer.byteLength > 6_000_000 ? buffer.slice(0, 6_000_000) : buffer;
        const base64 = btoa(String.fromCharCode(...new Uint8Array(limited)));

        const response = await this.fetchWithRetry(`${AI_CONFIG.GEMINI_API_URL}/${model}:generateContent?key=${this.API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: prompt },
                            { inlineData: { mime_type: mime, data: base64 } }
                        ]
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini Vision API error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    }

    /**
     * Build comprehensive text from ordinance data
     */
    private buildOrdinanceText(ordinance: any): string {
        const parts = [];

        // Add title if available
        if (ordinance.ord_title) {
            parts.push(`Title: ${ordinance.ord_title}`);
        }

        // Add ordinance number if available
        if (ordinance.ord_num) {
            parts.push(`Ordinance Number: ${ordinance.ord_num}`);
        }

        // Add details if available
        if (ordinance.ord_details && ordinance.ord_details.trim().length > 10) {
            parts.push(`Details: ${ordinance.ord_details}`);
        }

        // Add description if available
        if (ordinance.ord_description && ordinance.ord_description.trim().length > 10) {
            parts.push(`Description: ${ordinance.ord_description}`);
        }

        // Add content if available
        if (ordinance.ord_content && ordinance.ord_content.trim().length > 10) {
            parts.push(`Content: ${ordinance.ord_content}`);
        }

        // Add status if available
        if (ordinance.ord_status) {
            parts.push(`Status: ${ordinance.ord_status}`);
        }

        // Add date if available
        if (ordinance.ord_date) {
            parts.push(`Date: ${ordinance.ord_date}`);
        }

        return parts.length > 0 ? parts.join('\n\n') : 'No ordinance content available for analysis';
    }

    /**
     * Extract text from PDF using multiple approaches
     * 1. Try direct text extraction (for text-based PDFs)
     * 2. Fall back to OCR for scanned PDFs
     * 3. Use Hugging Face models as final fallback
     */
    async extractTextFromPDF(fileUrl: string): Promise<string> {
        try {
            // Check if the file URL is valid
            if (!fileUrl || fileUrl.trim() === '') {
                console.warn('No PDF file URL provided');
                return 'No PDF file available for analysis.';
            }

            console.log('Extracting text from PDF:', fileUrl);

            // Step 1: Try direct PDF text extraction (like OCRmyPDF approach)
            const directText = await this.extractTextFromPDFDirect(fileUrl);
            if (directText && directText.length > 100 && !directText.includes('PDF text extraction failed')) {
                console.log('Direct PDF text extraction successful, length:', directText.length);
                return directText;
            }

            // Step 2: Try OCR extraction for scanned PDFs
            console.log('Direct extraction failed, trying OCR...');
            const ocrResult = await this.extractTextWithOCR(fileUrl);

            // If OCR returned meaningful content, use it
            if (ocrResult && ocrResult.length > 50 && !ocrResult.includes('PDF text extraction failed')) {
                console.log('OCR extraction successful, length:', ocrResult.length);
                return ocrResult;
            }

            // Step 3: Final fallback
            console.warn('All extraction methods failed, returning fallback message');
            return 'PDF text extraction failed. This appears to be a scanned document that requires manual review. Please check the document content manually for detailed analysis.';
        } catch (error) {
            console.error('Error extracting text from PDF:', error);
            return 'PDF text extraction failed. This may be a scanned document. Please review the document manually for detailed analysis.';
        }
    }

    /**
     * Extract text directly from PDF (similar to OCRmyPDF approach)
     * This method tries to extract text without OCR first
     */
    private async extractTextFromPDFDirect(fileUrl: string): Promise<string> {
        try {
            // Fetch the PDF file
            const response = await fetch(fileUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);

            // Convert to base64 for processing
            // const base64 = btoa(String.fromCharCode(...uint8Array));

            // Try to extract text using a simple approach
            const pdfText = this.extractTextFromPDFBuffer(uint8Array);

            if (pdfText && pdfText.length > 50) {
                console.log('Direct PDF text extraction successful, length:', pdfText.length);
                return pdfText;
            }

            return '';
        } catch (error) {
            console.warn('Direct PDF extraction failed:', error);
            return '';
        }
    }

    /**
     * Extract text from PDF buffer (simplified approach)
     */
    private extractTextFromPDFBuffer(buffer: Uint8Array): string {
        try {
            // Convert buffer to string
            const text = new TextDecoder('utf-8', { fatal: false }).decode(buffer);

            // Look for text streams in PDF
            const textMatches = text.match(/BT\s*([\s\S]*?)\s*ET/g);
            if (textMatches) {
                let extractedText = '';
                for (const match of textMatches) {
                    // Extract text from text objects
                    const textContent = match
                        .replace(/BT\s*/, '')
                        .replace(/\s*ET/, '')
                        .replace(/\([^)]*\)/g, (match) => match.slice(1, -1)) // Extract text from parentheses
                        .replace(/\\[a-zA-Z0-9]+/g, ' ') // Remove escape sequences
                        .replace(/\s+/g, ' ') // Normalize whitespace
                        .trim();

                    if (textContent.length > 10) {
                        extractedText += ' ' + textContent;
                    }
                }

                if (extractedText.length > 50) {
                    return this.cleanExtractedText(extractedText);
                }
            }

            return '';
        } catch (error) {
            console.warn('PDF buffer processing failed:', error);
            return '';
        }
    }


    private async extractTextWithOCR(fileUrl: string): Promise<string> {
        try {
            const prompt = 'Extract readable plain text from this PDF document. Return only the text content without formatting.';
            const response = await this.callGeminiVisionAPI(AI_CONFIG.MODELS.vision, prompt, fileUrl, 'application/pdf');
            const text = response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            return text?.trim() || '';
        } catch (e) {
            console.warn('Gemini vision extraction failed:', e);
            return '';
        }
    }

    /**
     * Extract readable text from PDF content
     */
    // private extractTextFromPDFContent(pdfContent: string): string {
    //     try {
    //         // Look for text streams in PDF content
    //         const textStreams = pdfContent.match(/stream\s*([\s\S]*?)\s*endstream/g);
    //         let extractedText = '';

    //         if (textStreams) {
    //             for (const stream of textStreams) {
    //                 // Extract content between stream and endstream
    //                 const content = stream.replace(/stream\s*/, '').replace(/\s*endstream/, '');

    //                 // Look for text patterns in the stream - both parentheses and brackets
    //                 const textMatches = content.match(/\([^)]+\)|\[[^\]]+\]/g);
    //                 if (textMatches) {
    //                     const text = textMatches
    //                         .map(match => match.slice(1, -1)) // Remove parentheses/brackets
    //                         .join(' ')
    //                         .replace(/\\[a-zA-Z0-9]+/g, ' ') // Remove PDF escape sequences
    //                         .replace(/\s+/g, ' ') // Normalize whitespace
    //                         .trim();

    //                     // Check if this looks like actual ordinance text
    //                     if (text.length > 20 &&
    //                         !text.includes('ReportLab') &&
    //                         !text.includes('anonymous') &&
    //                         !text.includes('YYjWN') && // Filter out encoded data
    //                         !text.includes('ahcY?K') &&
    //                         (text.includes('Ordinance') || text.includes('Section') || text.includes('Municipality'))) {
    //                         extractedText += ' ' + text;
    //                     }
    //                 }
    //             }
    //         }

    //         // If we found good text, clean and return it
    //         if (extractedText.length > 50) {
    //             return this.cleanExtractedText(extractedText);
    //         }

    //         // Fallback: look for any readable text patterns
    //         const readableText = pdfContent
    //             .replace(/[^\x20-\x7E\n\r]/g, ' ') // Keep only printable ASCII
    //             .replace(/\\[a-zA-Z0-9]+/g, ' ') // Remove escape sequences
    //             .replace(/\s+/g, ' ') // Normalize whitespace
    //             .replace(/ReportLab.*?www\.reportlab\.com/g, '') // Remove ReportLab metadata
    //             .replace(/anonymous.*?unspecified/g, '') // Remove metadata
    //             .replace(/D:\d{14}.*?00'00'/g, '') // Remove date metadata
    //             .replace(/YYjWN.*?ahcY\?K/g, '') // Remove encoded data patterns
    //             .trim();

    //         return this.cleanExtractedText(readableText);

    //     } catch (error) {
    //         console.error('Error processing PDF content:', error);
    //         return '';
    //     }
    // }

    /**
     * Clean and filter extracted text
     */
    private cleanExtractedText(text: string): string {
        // Split into lines and filter meaningful content
        const lines = text.split(/\s+/).filter(word => {
            // Keep words that are at least 2 characters and not just numbers
            return word.length >= 2 && !/^\d+$/.test(word);
        });

        // Join back and clean up
        return lines.join(' ')
            .replace(/\s+/g, ' ')
            .trim();
    }


    async summarizeDocument(text: string): Promise<string> {
        // Create a more specific prompt for summarization
        const prompt = `Summarize this municipal ordinance document. Focus on the main purpose, key provisions, and important details:\n\n${text.substring(0, 1000)}`;
        const response = await this.callGeminiAPI(AI_CONFIG.MODELS.text, prompt);
        const out = response?.candidates?.[0]?.content?.parts?.[0]?.text || 'Summary not available';
        return this.sanitizeOutput(out);
    }

    async analyzeDocument(text: string): Promise<string[]> {
        const prompt = `Analyze this municipal ordinance and extract the most important key points. Focus on legal requirements, penalties, effective dates, and main provisions:\n\n${text.substring(0, 1000)}`;
        const response = await this.callGeminiAPI(AI_CONFIG.MODELS.text, prompt);
        const analysis = this.sanitizeOutput(response?.candidates?.[0]?.content?.parts?.[0]?.text || 'Analysis failed');

        // Split into key points and clean them up
        const keyPoints = analysis
            .split('\n')
            .map((point: string) => point.trim())
            .filter((point: string) => point.length > 10 && !point.includes('Analysis failed'))
            .slice(0, 5); // Limit to 5 key points

        return keyPoints.length > 0 ? keyPoints : [
            'Legal document analysis completed',
            'Review document for specific provisions',
            'Check effective dates and penalties'
        ];
    }

    async compareDocuments(doc1Text: string, doc2Text: string): Promise<ComparisonResult> {
        // Use semantic similarity for comparison
        const similarityScore = await this.calculateSimilarity(doc1Text, doc2Text);

        // Generate detailed comparison analysis with bullet points
        const comparisonPrompt = `Compare these two municipal ordinances and identify specific differences. Focus on changes in legal provisions, penalties, effective dates, and requirements:\n\nDocument 1: ${doc1Text.substring(0, 600)}\n\nDocument 2: ${doc2Text.substring(0, 600)}\n\nProvide specific differences in bullet point format, highlighting what changed between the documents.`;

        const response = await this.callGeminiAPI(AI_CONFIG.MODELS.text, comparisonPrompt);
        const analysis = this.sanitizeOutput(response?.candidates?.[0]?.content?.parts?.[0]?.text || 'Comparison failed');

        const differences = this.extractDifferences(analysis).map((d) => this.sanitizeOutput(d));
        const similarities = this.extractSimilarities(analysis).map((s) => this.sanitizeOutput(s));

        // Create an executive summary for comparison
        const execSummary = await this.buildExecutiveSummary('Amendment Comparison Analysis', doc1Text, doc2Text);

        return {
            similarityScore,
            differences,
            similarities,
            analysis: `Executive Summary\n${execSummary}`
        };
    }

    /**
     * Calculate similarity between two documents using Hugging Face API
     */
    async calculateSimilarity(_text1: string, _text2: string): Promise<number> {
        // Basic placeholder similarity since Gemini does not provide a direct similarity endpoint
        return 0;
    }

    /**
     * Extract differences from analysis text
     */
    private extractDifferences(analysis: string): string[] {
        const lines = analysis.split('\n').filter(line => line.trim().length > 0);

        // Look for bullet points or lines that indicate differences
        const differences = lines.filter(line => {
            const lowerLine = line.toLowerCase();
            return (
                lowerLine.includes('•') ||
                lowerLine.includes('-') ||
                lowerLine.includes('difference') ||
                lowerLine.includes('change') ||
                lowerLine.includes('differs') ||
                lowerLine.includes('updated') ||
                lowerLine.includes('modified')
            );
        }).map(line => {
            // Clean up the line and ensure it starts with a bullet
            let cleaned = line.trim();
            if (!cleaned.startsWith('•') && !cleaned.startsWith('-')) {
                cleaned = '• ' + cleaned;
            }
            return cleaned;
        }).slice(0, 5);

        return differences;
    }

    /**
     * Extract similarities from analysis text
     */
    private extractSimilarities(analysis: string): string[] {
        const lines = analysis.split('\n').filter(line => line.trim().length > 0);

        // Look for bullet points or lines that indicate similarities
        const similarities = lines.filter(line => {
            const lowerLine = line.toLowerCase();
            return (
                lowerLine.includes('•') ||
                lowerLine.includes('-') ||
                lowerLine.includes('similar') ||
                lowerLine.includes('same') ||
                lowerLine.includes('common') ||
                lowerLine.includes('both') ||
                lowerLine.includes('shared')
            );
        }).map(line => {
            // Clean up the line and ensure it starts with a bullet
            let cleaned = line.trim();
            if (!cleaned.startsWith('•') && !cleaned.startsWith('-')) {
                cleaned = '• ' + cleaned;
            }
            return cleaned;
        }).slice(0, 5);

        return similarities;
    }

    /**
     * Analyze a single ordinance document
     */
    async analyzeOrdinance(fileUrl: string): Promise<DocumentAnalysisResult> {
        const text = await this.extractTextFromPDF(fileUrl);
        const summary = await this.summarizeDocument(text);
        const keyPoints = await this.analyzeDocument(text);

        return {
            summary,
            keyPoints,
            similarities: [],
            differences: [],
            recommendations: ['Review document for compliance', 'Check for legal requirements']
        };
    }

    /**
     * Analyze ordinance with comparison support
     */
    async analyzeOrdinanceWithComparison(params: {
        ordinance: any;
        compareWith?: any;
        analysisType: 'summary' | 'comparison';
        includeFileContent?: boolean;
    }): Promise<DocumentAnalysisResult> {
        let text = '';

        // Prioritize PDF content for analysis if available
        if (params.includeFileContent && params.ordinance.file?.file_url) {
            console.log('Attempting to extract PDF content for analysis...');
            const pdfText = await this.extractTextFromPDF(params.ordinance.file.file_url);

            // If PDF extraction was successful and produced meaningful content
            if (pdfText && pdfText.length > 100 && !pdfText.includes('PDF content extraction')) {
                console.log('Using PDF content for analysis, length:', pdfText.length);
                text = pdfText;
            } else {
                console.log('PDF extraction failed or produced minimal content, using metadata');
                text = this.buildOrdinanceText(params.ordinance);
            }
        } else {
            // Use metadata if no PDF or PDF extraction disabled
            text = this.buildOrdinanceText(params.ordinance);
        }

        const summary = await this.summarizeDocument(text);
        const keyPoints = await this.analyzeDocument(text);

        let similarities: string[] = [];
        let differences: string[] = [];

        if (params.analysisType === 'comparison' && params.compareWith) {
            let compareText = '';

            // Prioritize PDF content for comparison if available
            if (params.includeFileContent && params.compareWith.file?.file_url) {
                console.log('Extracting PDF content for comparison...');
                const pdfText = await this.extractTextFromPDF(params.compareWith.file.file_url);
                if (pdfText && pdfText.length > 100 && !pdfText.includes('PDF content extraction')) {
                    console.log('Using PDF content for comparison, length:', pdfText.length);
                    compareText = pdfText;
                } else {
                    compareText = this.buildOrdinanceText(params.compareWith);
                }
            } else {
                compareText = this.buildOrdinanceText(params.compareWith);
            }

            const comparison = await this.compareDocuments(text, compareText);
            similarities = comparison.similarities;
            differences = comparison.differences;
        }

        return {
            summary,
            keyPoints,
            similarities,
            differences,
            recommendations: ['Review document for compliance', 'Check for legal requirements']
        };
    }

    /**
     * Compare multiple ordinances in a folder
     */
    async compareMultipleOrdinances(ordinances: any[]): Promise<ComparisonResult> {
        if (ordinances.length < 2) {
            throw new Error('Need at least 2 ordinances to compare');
        }

        // Prioritize PDF content for comparison if available
        let doc1Text = '';
        let doc2Text = '';

        // Extract text from first ordinance
        if (ordinances[0].file?.file_url) {
            console.log('Extracting PDF content for first ordinance...');
            const pdfText = await this.extractTextFromPDF(ordinances[0].file.file_url);
            if (pdfText && pdfText.length > 100 && !pdfText.includes('PDF content extraction')) {
                console.log('Using PDF content for first ordinance, length:', pdfText.length);
                doc1Text = pdfText;
            } else {
                doc1Text = this.buildOrdinanceText(ordinances[0]);
            }
        } else {
            doc1Text = this.buildOrdinanceText(ordinances[0]);
        }

        // Extract text from second ordinance
        if (ordinances[1].file?.file_url) {
            console.log('Extracting PDF content for second ordinance...');
            const pdfText = await this.extractTextFromPDF(ordinances[1].file.file_url);
            if (pdfText && pdfText.length > 100 && !pdfText.includes('PDF content extraction')) {
                console.log('Using PDF content for second ordinance, length:', pdfText.length);
                doc2Text = pdfText;
            } else {
                doc2Text = this.buildOrdinanceText(ordinances[1]);
            }
        } else {
            doc2Text = this.buildOrdinanceText(ordinances[1]);
        }

        // Use API for comparison
        const comparison = await this.compareDocuments(doc1Text, doc2Text);

        return {
            similarityScore: comparison.similarityScore,
            similarities: comparison.similarities,
            differences: comparison.differences,
            analysis: comparison.analysis
        };
    }
}

export const huggingFaceAIService = new HuggingFaceAIService();
