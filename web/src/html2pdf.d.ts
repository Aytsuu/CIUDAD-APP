declare module 'html2pdf.js' {
    interface Html2PdfOptions {
        margin?: number | [number, number, number, number];
        filename?: string;
        image?: { type: string; quality: number };
        html2canvas?: any; // You can specify more detailed types if needed
        jsPDF?: { unit: string; format: string; orientation: string };
        pagebreak?: { mode?: string | string[]; before?: string | string[]; after?: string | string[]; avoid?: string | string[] };
        [key: string]: any; // Allow additional options used by html2pdf.js
        // Add any other options you need
    }

    interface Html2Pdf {
        set: (options: Html2PdfOptions) => Html2Pdf;
        from: (element: HTMLElement) => {
            save: (filename?: string) => Promise<void>;
            // Add other methods if needed
        };
    }

    const html2pdf: () => Html2Pdf;
    export default html2pdf;
}