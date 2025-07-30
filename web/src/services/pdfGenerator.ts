import jsPDF from 'jspdf';
import 'jspdf-autotable';

export interface OrdinanceData {
    ordinanceNumber: string;
    title: string;
    content: string;
    dateCreated: string;
    category: string;
    withSeal: boolean;
    withSignature: boolean;
    headerMedia?: any;
}

export interface TemplateData {
    title: string;
    templateBody: string;
    withSeal: boolean;
    withSignature: boolean;
    headerMedia?: File;
}

export class OrdinancePDFGenerator {
    private doc: jsPDF;

    constructor() {
        this.doc = new jsPDF();
    }

    private addHeader() {
        this.doc.setFontSize(16);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('CITY GOVERNMENT', 105, 20, { align: 'center' });
        this.doc.setFontSize(12);
        this.doc.text('Official Document', 105, 30, { align: 'center' });
        this.doc.line(20, 35, 190, 35);
    }

    private addTitle(title: string) {
        this.doc.setFontSize(14);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(title, 105, 50, { align: 'center' });
    }

    private addContent(content: string) {
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'normal');

        const splitText = this.doc.splitTextToSize(content, 170);
        let yPosition = 70;

        splitText.forEach((line: string) => {
            if (yPosition > 250) {
                this.doc.addPage();
                yPosition = 20;
            }
            this.doc.text(line, 20, yPosition);
            yPosition += 7;
        });
    }

    private addFooter(withSeal: boolean, withSignature: boolean) {
        const yPosition = 250;

        if (withSeal) {
            this.doc.setFontSize(10);
            this.doc.text('Official Seal', 20, yPosition);
        }

        if (withSignature) {
            this.doc.setFontSize(10);
            this.doc.text('Signature: _________________', 120, yPosition);
        }
    }

    public generateOrdinancePDF(ordinanceData: OrdinanceData): jsPDF {
        this.addHeader();
        this.addTitle(ordinanceData.title);
        this.addContent(ordinanceData.content);
        this.addFooter(ordinanceData.withSeal, ordinanceData.withSignature);

        return this.doc;
    }

    public generateFromTemplate(templateData: TemplateData, ordinanceData: Partial<OrdinanceData>): jsPDF {
        let processedContent = templateData.templateBody;

        const replacements: { [key: string]: string } = {
            '[YEAR]': new Date().getFullYear().toString(),
            '[DATE]': new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            '[NUMBER]': ordinanceData.ordinanceNumber || '01',
            '[AMOUNT]': '150.00',
            '[BARANGAY_NAME]': ordinanceData.category || 'Barangay',
            '[CITY/MUNICIPALITY]': ordinanceData.category || 'City',
            '[PROVINCE]': 'Province',
            '[LOCATION]': ordinanceData.category || 'Location',
            '[CELEBRATION_NAME]': 'Annual Celebration',
            '[LEVEL]': 'Barangay',
            '[CITY_NAME]': ordinanceData.category || 'City',
            '[ACTION_DESCRIPTION]': 'Declaring Annual Celebration Day',
            '[LEGAL_BASIS]': 'Republic Act No. 7160',
            '[AUTHORITY_DESCRIPTION]': 'Local Government Code of 1991',
            '[CONTEXT_OR_BACKGROUND]': 'The community recognizes the importance of celebrating local heritage and culture',
            '[JUSTIFICATION_OR_REASONING]': 'It is necessary to establish an annual celebration to promote community unity',
            '[ADDITIONAL_JUSTIFICATION_IF_NEEDED]': 'This celebration will strengthen community bonds and cultural awareness',
            '[PRIMARY_ACTION]': 'Declare the annual celebration day',
            '[SECONDARY_ACTION]': 'Allocate funds for celebration activities',
            '[RECIPIENTS]': 'All concerned government agencies and community members',
            '[PRESIDENT_NAME]': 'President of the Philippines'
        };

        // Replace all placeholders with actual values
        Object.entries(replacements).forEach(([placeholder, value]) => {
            const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            processedContent = processedContent.replace(regex, value);
        });

        const fullOrdinanceData: OrdinanceData = {
            ordinanceNumber: ordinanceData.ordinanceNumber || '01',
            title: templateData.title,
            content: processedContent,
            dateCreated: ordinanceData.dateCreated || new Date().toLocaleDateString(),
            category: ordinanceData.category || '',
            withSeal: templateData.withSeal,
            withSignature: templateData.withSignature,
            headerMedia: ordinanceData.headerMedia
        };

        return this.generateOrdinancePDF(fullOrdinanceData);
    }

    public getPDFAsBlob(): Blob {
        return this.doc.output('blob');
    }

    public getPDFAsDataURL(): string {
        return this.doc.output('dataurlstring');
    }
}

// Utility functions
export const generateOrdinancePDF = (
    templateData: TemplateData,
    ordinanceData: Partial<OrdinanceData>,
    filename: string
): void => {
    const generator = new OrdinancePDFGenerator();
    const pdf = generator.generateFromTemplate(templateData, ordinanceData);
    pdf.save(filename);
};

export const generateOrdinancePDFAsBlob = (
    templateData: TemplateData,
    ordinanceData: Partial<OrdinanceData>
): Blob => {
    const generator = new OrdinancePDFGenerator();
    const pdf = generator.generateFromTemplate(templateData, ordinanceData);
    return generator.getPDFAsBlob();
};

export const generateOrdinancePDFAsDataURL = (
    templateData: TemplateData,
    ordinanceData: Partial<OrdinanceData>
): string => {
    const generator = new OrdinancePDFGenerator();
    const pdf = generator.generateFromTemplate(templateData, ordinanceData);
    return generator.getPDFAsDataURL();
}; 