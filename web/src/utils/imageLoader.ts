// Import the header image directly
import headerImage from '@/assets/images/SanRoqueHeader.png';

// Utility to load header image for PDF generation
export const loadHeaderImage = async (): Promise<string | null> => {
    try {
        // Convert the imported image to base64 for PDF generation
        const response = await fetch(headerImage);
        if (response.ok) {
            const blob = await response.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    resolve(reader.result as string);
                };
                reader.readAsDataURL(blob);
            });
        }
    } catch (error) {
        console.error('Error loading header image:', error);
    }
    return null;
}; 