/**
 * Document Extractor (PDF and TXT) for ReadFluently
 * Uses PDF.js to extract text from PDF files directly in the browser.
 */

class DocumentExtractor {
    /**
     * Extracts text from an uploaded File (PDF or TXT)
     */
    static async extractTextFromFile(file) {
        if (!file) {
            throw new Error('No file provided.');
        }

        const name = file.name.toLowerCase();

        // Plain text file
        if (name.endsWith('.txt')) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve({
                    title: file.name.replace(/\.txt$/i, ''),
                    text: e.target.result,
                    pageCount: 1
                });
                reader.onerror = () => reject(new Error('Failed to read text file.'));
                reader.readAsText(file);
            });
        }

        // PDF file
        if (name.endsWith('.pdf') || file.type === 'application/pdf') {
            return await DocumentExtractor.extractTextFromPdf(file);
        }

        throw new Error('Unsupported file type. Please upload a PDF or TXT file.');
    }

    /**
     * Extracts text from a PDF file using PDF.js
     */
    static async extractTextFromPdf(file) {
        if (typeof pdfjsLib === 'undefined') {
            throw new Error('PDF reader is loading. Please check your internet connection or paste text directly.');
        }

        // Configure PDF.js worker
        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }

        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        let fullText = '';
        const numPages = pdf.numPages;

        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            
            let lastY = null;
            let pageText = '';

            for (const item of textContent.items) {
                if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
                    pageText += '\n';
                } else if (pageText.length > 0 && !pageText.endsWith(' ') && !pageText.endsWith('\n')) {
                    pageText += ' ';
                }
                pageText += item.str;
                lastY = item.transform[5];
            }

            fullText += pageText + '\n\n';
        }

        // Clean up extracted PDF text
        const cleanedText = DocumentExtractor.cleanExtractedText(fullText);

        if (!cleanedText || cleanedText.length < 10) {
            throw new Error('Could not extract readable text from this PDF. It may be a scanned image without a text layer.');
        }

        return {
            title: file.name.replace(/\.pdf$/i, ''),
            text: cleanedText,
            pageCount: numPages
        };
    }

    static cleanExtractedText(raw) {
        if (!raw) return '';
        return raw
            // Join hyphenated words split across lines
            .replace(/(\w+)-\s*\n\s*(\w+)/g, '$1$2')
            // Normalize multiple whitespaces and newlines
            .replace(/[ \t]+/g, ' ')
            .replace(/\n\s*\n\s*\n+/g, '\n\n')
            .trim();
    }
}

window.DocumentExtractor = DocumentExtractor;
