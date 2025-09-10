/**
 * Simple PDF text extractor that works with basic PDF files
 * This is a fallback when advanced PDF libraries fail
 */

export class SimplePDFExtractor {
    /**
     * Extract text from PDF using a simple approach
     * This works for basic PDFs with text content
     */
    async extractTextFromPDF(fileUrl: string): Promise<string> {
        try {
            // Fetch the PDF file
            const response = await fetch(fileUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch PDF: ${response.status}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);

            // Convert to string and extract text
            const text = this.extractTextFromPDFBytes(uint8Array);

            if (!text || text.trim().length === 0) {
                throw new Error('No text content found in PDF');
            }

            return this.cleanText(text);
        } catch (error) {
            console.error('Error extracting text from PDF:', error);
            throw new Error('Failed to extract text from PDF');
        }
    }

    /**
     * Extract text from PDF bytes using a simple approach
     */
    private extractTextFromPDFBytes(bytes: Uint8Array): string {
        const text = new TextDecoder('utf-8', { fatal: false }).decode(bytes);

        // Look for text between BT and ET markers (PDF text objects)
        const textMatches = text.match(/BT[\s\S]*?ET/g);

        if (textMatches) {
            let extractedText = '';
            for (const match of textMatches) {
                // Extract text between parentheses
                const textInParentheses = match.match(/\(([^)]+)\)/g);
                if (textInParentheses) {
                    for (const textMatch of textInParentheses) {
                        extractedText += textMatch.slice(1, -1) + ' ';
                    }
                }
            }
            return extractedText;
        }

        // Fallback: try to extract any readable text
        return this.extractReadableText(text);
    }

    /**
     * Extract readable text from PDF content
     */
    private extractReadableText(text: string): string {
        // Remove PDF-specific characters and commands
        let cleanText = text
            .replace(/\\[a-zA-Z0-9]+/g, ' ') // Remove PDF commands
            .replace(/[^\x20-\x7E\n\r]/g, ' ') // Keep only printable ASCII
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();

        // Try to find text patterns
        const words = cleanText.split(' ').filter(word =>
            word.length > 2 &&
            /^[a-zA-Z]+$/.test(word)
        );

        return words.join(' ');
    }

    /**
     * Clean and format extracted text
     */
    private cleanText(text: string): string {
        return text
            .replace(/\s+/g, ' ') // Normalize whitespace
            .replace(/[^\w\s.,!?;:()-]/g, ' ') // Remove special characters
            .replace(/\s+/g, ' ') // Normalize again
            .trim();
    }

    /**
     * Check if PDF contains extractable text
     */
    async isTextExtractable(fileUrl: string): Promise<boolean> {
        try {
            const text = await this.extractTextFromPDF(fileUrl);
            return text.length > 50; // Minimum text length to consider extractable
        } catch (error) {
            return false;
        }
    }
}

export const simplePDFExtractor = new SimplePDFExtractor();
