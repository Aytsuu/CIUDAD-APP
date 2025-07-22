// utils/exportToDocx.ts
import htmlToDocx from 'html-to-docx';
import { saveAs } from 'file-saver';

export async function exportHtmlToDocx(html: string, fileName: string = 'document.docx') {
  const docxBlob = await htmlToDocx(html, {
    orientation: 'portrait',
    margins: { top: 720, right: 720, bottom: 720, left: 720 },
    footer: true,
    pageNumber: true,
  });

  saveAs(docxBlob, fileName);
}
