import jsPDF from 'jspdf';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialize the Supabase client directly here
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for dynamic purpose and rates
export type PurposeAndRate = {
  pr_id: number;
  pr_purpose: string;
  pr_rate: number;
  pr_category: string;
  pr_date: string;
  pr_is_archive: boolean;
};

export const formatDate = (dateString: string) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  } catch (error) {
    return dateString;
  }
};

export const formatPurpose = (purpose: string) => {
  // Convert purpose to proper case for display
  return purpose.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const adjustTextForField = (text: string, maxLength: number = 50) => {
  if (!text) return "";
  
  // If text is longer than maxLength, try to fit it by reducing font size or wrapping
  if (text.length > maxLength) {
    // For very long names, try to fit them by using initials for middle names
    const words = text.split(' ');
    if (words.length > 2) {
      // Keep first and last name, abbreviate middle names
      const firstName = words[0];
      const lastName = words[words.length - 1];
      const middleNames = words.slice(1, -1).map(name => name.charAt(0) + '.');
      return `${firstName} ${middleNames.join(' ')} ${lastName}`;
    }
  }
  
  return text;
};

export const getOptimalFontSize = (text: string, fieldWidth: number, defaultSize: number = 12) => {
  if (!text || text.length < 20) return defaultSize;
  
  // Estimate font size based on text length and field width
  const estimatedSize = Math.max(8, Math.min(defaultSize, (fieldWidth * 0.8) / text.length));
  return estimatedSize;
};

// Fetch purpose and rates data dynamically
export const fetchPurposeAndRates = async (): Promise<PurposeAndRate[]> => {
  try {
    const response = await fetch('http://localhost:8000/treasurer/purpose-and-rate/');
    if (!response.ok) {
      throw new Error(`Failed to fetch purpose and rates: ${response.statusText}`);
    }
    const data = await response.json();
    return data.filter((item: PurposeAndRate) => !item.pr_is_archive);
  } catch (error) {
    console.error('Error fetching purpose and rates:', error);
    return [];
  }
};

// Enhanced template matching using purpose and rates data
export const findBestTemplateMatch = (purpose: string, templateDataArr: any[], purposeAndRates: PurposeAndRate[]) => {
  const normalizedPurpose = (purpose || '').toLowerCase().trim();
  let template = null;
  let bestMatchScore = 0;

  // 1. First try: Exact purpose match from purpose_and_rates
  const exactPurposeMatch = purposeAndRates.find(pr => 
    pr.pr_purpose.toLowerCase().trim() === normalizedPurpose
  );
  
  if (exactPurposeMatch) {
    template = templateDataArr.find((t: any) => 
      t.temp_filename?.toLowerCase().includes(exactPurposeMatch.pr_purpose.toLowerCase()) ||
      t.temp_title?.toLowerCase().includes(exactPurposeMatch.pr_purpose.toLowerCase()) ||
      t.temp_body?.toLowerCase().includes(exactPurposeMatch.pr_purpose.toLowerCase())
    );
    if (template) {
      console.log('Found template by exact purpose match:', exactPurposeMatch.pr_purpose);
      return template;
    }
  }

  // 2. Second try: Category-based matching
  const purposeRate = purposeAndRates.find(pr => 
    pr.pr_purpose.toLowerCase().includes(normalizedPurpose) ||
    normalizedPurpose.includes(pr.pr_purpose.toLowerCase())
  );

  if (purposeRate) {
    const category = purposeRate.pr_category.toLowerCase();
    
    // Map categories to template keywords
    const categoryMappings: { [key: string]: string[] } = {
      'personal and others': ['personal', 'clearance', 'certificate', 'employment', 'birth', 'medical', 'residency', 'police', 'burial', 'death', 'indigency', 'insurance', 'scholarship'],
      'permit clearance': ['permit', 'commercial', 'residential', 'business', 'water', 'electrical'],
      'service charge': ['service', 'filing', 'certificate to file', 'complaint']
    };

    const keywords = categoryMappings[category] || [];
    
    for (const keyword of keywords) {
      template = templateDataArr.find((t: any) => 
        t.temp_filename?.toLowerCase().includes(keyword) ||
        t.temp_title?.toLowerCase().includes(keyword) ||
        t.temp_body?.toLowerCase().includes(keyword)
      );
      if (template) {
        console.log('Found template by category mapping:', category, 'keyword:', keyword);
        return template;
      }
    }
  }

  // 3. Third try: Smart keyword matching based on purpose
  const smartKeywords: { [key: string]: string[] } = {
    'employment': ['employment', 'work', 'job', 'personal'],
    'birth certificate': ['birth', 'nso', 'personal'],
    'medical assistance': ['medical', 'hospitalization', 'personal'],
    'residency': ['residency', 'resident', 'personal'],
    'police requirement': ['police', 'requirement', 'personal'],
    'burial': ['burial', 'death', 'indigency', 'personal'],
    'death': ['burial', 'death', 'indigency', 'personal'],
    'indigency': ['burial', 'death', 'indigency', 'personal'],
    'insurance': ['insurance', 'claim', 'personal'],
    'scholarship': ['scholarship', 'personal'],
    'commercial building permit': ['commercial', 'permit', 'building'],
    'residential permit': ['residential', 'permit'],
    'business permit': ['business', 'permit'],
    'water connection': ['water', 'connection', 'permit'],
    'electrical permit': ['electrical', 'permit'],
    'certificate to file action': ['certificate to file', 'filing', 'service'],
    'filing fee': ['filing', 'service', 'fee']
  };

  for (const [purposeKey, keywords] of Object.entries(smartKeywords)) {
    if (normalizedPurpose.includes(purposeKey) || purposeKey.includes(normalizedPurpose)) {
      for (const keyword of keywords) {
        template = templateDataArr.find((t: any) => 
          t.temp_filename?.toLowerCase().includes(keyword) ||
          t.temp_title?.toLowerCase().includes(keyword) ||
          t.temp_body?.toLowerCase().includes(keyword)
        );
        if (template) {
          console.log('Found template by smart keyword matching:', purposeKey, 'keyword:', keyword);
          return template;
        }
      }
    }
  }

  // 4. Fourth try: Partial matching with scoring
  for (const t of templateDataArr) {
    let score = 0;
    const templateText = `${t.temp_filename || ''} ${t.temp_title || ''} ${t.temp_body || ''}`.toLowerCase();
    
    // Check for partial matches
    if (templateText.includes(normalizedPurpose)) score += 3;
    if (normalizedPurpose.includes(t.temp_filename?.toLowerCase() || '')) score += 2;
    if (normalizedPurpose.includes(t.temp_title?.toLowerCase() || '')) score += 2;
    
    // Check for common words
    const commonWords = ['clearance', 'certificate', 'permit', 'personal', 'business'];
    for (const word of commonWords) {
      if (templateText.includes(word) && normalizedPurpose.includes(word)) {
        score += 1;
      }
    }
    
    if (score > bestMatchScore) {
      bestMatchScore = score;
      template = t;
    }
  }

  if (template && bestMatchScore > 0) {
    console.log('Found template by partial matching with score:', bestMatchScore);
    return template;
  }

  // 5. Fallback: Use default templates based on category
  const fallbackTemplates: { [key: string]: string } = {
    'personal': 'Other Personal Related Clearances',
    'permit': 'Commercial Building Permit',
    'service': 'Certificate To File Action'
  };

  for (const [category, templateName] of Object.entries(fallbackTemplates)) {
    if (normalizedPurpose.includes(category)) {
      template = templateDataArr.find((t: any) => 
        t.temp_filename === templateName
      );
      if (template) {
        console.log('Found template by fallback category:', category);
        return template;
      }
    }
  }

  // 6. Final fallback: Return first available template
  if (templateDataArr.length > 0) {
    console.log('Using first available template as final fallback');
    return templateDataArr[0];
  }

  return null;
};

export const generatePdfFromTemplate = async (templateData: any, requestData: any) => {
  try {
    // Create a new PDF document using jsPDF
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "letter", // 8.5×11 in (in points)
    });

    // Page dimensions
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 72; // 1 inch margin
    const lineHeight = 14;
    const sectionGap = 20;

    let yPos = margin;

    // Add header image if available
    if (templateData.temp_header && templateData.temp_header !== "no-image-url-fetched") {
      const imageHeight = 130;
      try {
        doc.addImage(templateData.temp_header, "PNG", margin, yPos, pageWidth - margin * 2, imageHeight);
        yPos += imageHeight + 30;
      } catch (e) {
        console.error("Error adding header image:", e);
      }
      yPos += 10;
    }

    // Add below header content if available
    if (templateData.temp_below_headerContent) {
      doc.setFontSize(10);
      doc.setFont("times", "normal");
      const belowHeaderLines = doc.splitTextToSize(templateData.temp_below_headerContent, pageWidth - margin * 2);
      for (let i = 0; i < belowHeaderLines.length; i++) {
        if (yPos + lineHeight > pageHeight - margin) {
          doc.addPage();
          yPos = margin;
        }
        doc.text(belowHeaderLines[i], margin, yPos);
        yPos += lineHeight;
      }
      yPos += 20;
    }

    // Add title
    if (templateData.temp_title) {
      doc.setFont("times", "bold");
      doc.setFontSize(16);
      const titleWidth = doc.getTextWidth(templateData.temp_title);
      doc.text(templateData.temp_title, (pageWidth - titleWidth) / 2, yPos);
      yPos += lineHeight;
    } else {
      // Add a default title if none exists
      doc.setFont("times", "bold");
      doc.setFontSize(16);
      const defaultTitle = "BARANGAY CLEARANCE";
      const titleWidth = doc.getTextWidth(defaultTitle);
      doc.text(defaultTitle, (pageWidth - titleWidth) / 2, yPos);
      yPos += lineHeight;
    }

    // Add subtitle if available
    if (templateData.temp_subtitle) {
      doc.setFont("times", "normal");
      doc.setFontSize(9);
      const subtitleWidth = doc.getTextWidth(templateData.temp_subtitle);
      doc.text(templateData.temp_subtitle, (pageWidth - subtitleWidth) / 2, yPos);
      yPos += 10;
    }

    // Process body content
    if (templateData.temp_body) {
      let bodyText = templateData.temp_body;
      console.log('Original body text:', bodyText);
      
      // Get the actual values for placeholders
      const nameValue = requestData.name || 'Unknown';
      const purposeValue = formatPurpose(requestData.purposes[0] || 'Unknown');
      const dateValue = formatDate(requestData.date) || 'Unknown';
      
      console.log('Processed values:', { nameValue, purposeValue, dateValue });
      
      doc.setFont("times", "normal");
      doc.setFontSize(10);
      yPos += sectionGap;

      const contentWidth = pageWidth - margin * 2;
      
      // Replace placeholders with actual values first
      let processedText = bodyText
        .replace(/\[NAME\]/g, nameValue)
        .replace(/\[PURPOSE\]/g, purposeValue)
        .replace(/\[DATE\]/g, dateValue);
      
      // Split the processed text into lines
      const lines = processedText.split('\n');
      
      for (const line of lines) {
        if (line.trim() === '') {
          yPos += lineHeight;
          continue;
        }
        
        // Use jsPDF's built-in text wrapping for each line
        const wrappedLines = doc.splitTextToSize(line, contentWidth);
        
        for (const wrappedLine of wrappedLines) {
          if (yPos + lineHeight > pageHeight - margin) {
            doc.addPage();
            yPos = margin;
          }
          
          // Check if this line contains any of our placeholder values to make them bold
          if (wrappedLine.includes(nameValue) || wrappedLine.includes(purposeValue) || wrappedLine.includes(dateValue)) {
            // Split the line by the placeholder values to apply bold formatting
            const parts = wrappedLine.split(new RegExp(`(${nameValue}|${purposeValue}|${dateValue})`, 'g'));
            let currentX = margin;
            
            for (const part of parts) {
              if (part === nameValue || part === purposeValue || part === dateValue) {
                // Make placeholder values bold
                doc.setFont("times", "bold");
                doc.text(part, currentX, yPos);
                currentX += doc.getTextWidth(part);
              } else if (part.trim() !== '') {
                // Regular text
                doc.setFont("times", "normal");
                doc.text(part, currentX, yPos);
                currentX += doc.getTextWidth(part);
              }
            }
          } else {
            // Regular line without placeholders
            doc.setFont("times", "normal");
            doc.text(wrappedLine, margin, yPos);
          }
          
          yPos += lineHeight;
        }
      }
    } else {
      // Add default body content if none exists
      doc.setFont("times", "normal");
      doc.setFontSize(10);
      yPos += sectionGap;
      
      const nameValue = requestData.name || 'Unknown';
      const purposeValue = formatPurpose(requestData.purposes[0] || 'Unknown');
      const dateValue = formatDate(requestData.date) || 'Unknown';
      
      const defaultBody = `TO WHOM IT MAY CONCERN:\n\nThis is to certify that [NAME] is a resident of this barangay and is hereby issued this clearance for the purpose of [PURPOSE].\n\nIssued this [DATE] at Barangay San Roque Ciudad, Cebu City, Philippines.`;
      
      // Replace placeholders with actual values first
      let processedText = defaultBody
        .replace(/\[NAME\]/g, nameValue)
        .replace(/\[PURPOSE\]/g, purposeValue)
        .replace(/\[DATE\]/g, dateValue);
      
      // Split the processed text into lines
      const lines = processedText.split('\n');
      
      for (const line of lines) {
        if (line.trim() === '') {
          yPos += lineHeight;
          continue;
        }
        
        // Use jsPDF's built-in text wrapping for each line
        const wrappedLines = doc.splitTextToSize(line, pageWidth - margin * 2);
        
        for (const wrappedLine of wrappedLines) {
          if (yPos + lineHeight > pageHeight - margin) {
            doc.addPage();
            yPos = margin;
          }
          
          // Check if this line contains any of our placeholder values to make them bold
          if (wrappedLine.includes(nameValue) || wrappedLine.includes(purposeValue) || wrappedLine.includes(dateValue)) {
            // Split the line by the placeholder values to apply bold formatting
            const parts = wrappedLine.split(new RegExp(`(${nameValue}|${purposeValue}|${dateValue})`, 'g'));
            let currentX = margin;
            
            for (const part of parts) {
              if (part === nameValue || part === purposeValue || part === dateValue) {
                // Make placeholder values bold
                doc.setFont("times", "bold");
                doc.text(part, currentX, yPos);
                currentX += doc.getTextWidth(part);
              } else if (part.trim() !== '') {
                // Regular text
                doc.setFont("times", "normal");
                doc.text(part, currentX, yPos);
                currentX += doc.getTextWidth(part);
              }
            }
          } else {
            // Regular line without placeholders
            doc.setFont("times", "normal");
            doc.text(wrappedLine, margin, yPos);
          }
          
          yPos += lineHeight;
        }
      }
    }

    // Add signature and seal if required
    if (templateData.temp_w_sign) {
      yPos += 40;
      doc.setFontSize(10);
      const footerY = pageHeight - margin - 120;
      
      // Regular signature fields
      doc.setFont("times", "normal");
      doc.text("Name and signature of Applicant", margin, footerY);
      doc.text("Certified true and correct:", margin, footerY + 20);
      
      // Barangay captain info
      doc.setFont("times", "bold");
      doc.text("HON. VIRGINIA N. ABENOJA", margin, footerY + 60);
      doc.setFont("times", "normal");
      doc.text("Punong Barangay, San Roque Ciudad", margin, footerY + 80);
    }

    const blob = doc.output("blob");
    console.log('Generated PDF blob size:', blob.size);
    console.log('PDF blob type:', blob.type);
    return blob;
  } catch (error) {
    console.error('Error generating PDF from template:', error);
    throw error;
  }
};

export const getPdfPathByPurpose = (purpose: string) => {
  switch (purpose.toLowerCase()) {
    case "barangay clearance":
    case "clearance":
    case "certification":
    case "employment":
    case "nso-gsis-sss":
    case "hospitalization-champ":
    case "birth certificate":
    case "medical assistance":
    case "residency":
    case "police requirement":
    case "burial":
    case "death":
    case "indigency-claim":
    case "complaint":
    case "filing-fee":
    case "certificate-to-file-action":
      return "clearance"; // Special flag for clearance templates
    case "indigency":
      return "indigency"; // File name in Supabase bucket
    default:
      return "Default.pdf"; // Default fallback file in Supabase bucket
  }
};

export const modifySinglePdf = async (purpose: string, requestData: any) => {
  try {
    // Fetch both template data and purpose/rates data
    const [templateResponse, purposeAndRates] = await Promise.all([
      fetch('http://localhost:8000/council/template/'),
      fetchPurposeAndRates()
    ]);

    if (!templateResponse.ok) {
      throw new Error(`Failed to fetch template: ${templateResponse.statusText}`);
    }
    
    const templateDataArr = await templateResponse.json();
    
    // Use enhanced template matching with purpose and rates data
    const template = findBestTemplateMatch(purpose, templateDataArr, purposeAndRates);
    
    if (!template) {
      throw new Error('No suitable template found');
    }
    
    console.log('Selected template:', {
      filename: template.temp_filename,
      title: template.temp_title,
      purpose: purpose,
      purposeAndRatesCount: purposeAndRates.length
    });
    
    // Generate PDF from template data
    const pdfBytes = await generatePdfFromTemplate(template, requestData);
    return pdfBytes;
    
  } catch (error) {
    console.error('Template matching failed:', error);
    
    // Fallback to static PDF from Supabase
    try {
      const { data, error: supaError } = await supabase
        .storage
        .from('clerk-documents')
        .download(getPdfPathByPurpose(purpose));
        
      if (supaError) throw supaError;
      if (!data) throw new Error('No PDF data returned');
      return data;
      
    } catch (fallbackError) {
      // Final fallback to local default PDF
      const fallbackResponse = await fetch("/src/assets/pdfs/Default.pdf");
      const fallbackBytes = await fallbackResponse.arrayBuffer();
      return new Blob([fallbackBytes], { type: "application/pdf" });
    }
  }
};

export const processPurposes = (purpose: string | string[]) => {
  if (!purpose) return ["unknown"];
  
  if (Array.isArray(purpose)) {
    return purpose.map((p: string) => p.toLowerCase().trim());
  }
  
  if (typeof purpose === 'string' && purpose.includes(',')) {
    return purpose.split(',').map((p: string) => p.toLowerCase().trim());
  }
  
  return [purpose.toLowerCase().trim()];
};
