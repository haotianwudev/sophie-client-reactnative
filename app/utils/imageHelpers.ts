// Helper functions for handling images in React Native

/**
 * Extracts raw base64 data from a base64 data URI
 * @param dataURI The data URI string (e.g. data:image/png;base64,iVBORw0KGgo...)
 * @returns Raw base64 string without the prefix
 */
export const extractBase64Data = (dataURI: string): string => {
  // Check if it's a data URI
  if (dataURI.startsWith('data:')) {
    // Extract the base64 part
    const base64Marker = ';base64,';
    const base64Index = dataURI.indexOf(base64Marker) + base64Marker.length;
    return dataURI.substring(base64Index);
  }
  
  // Already a raw base64 string
  return dataURI;
};

/**
 * Creates a React Native compatible uri for Image component from base64 data
 * @param base64Data Raw base64 data or data URI
 * @param mimeType Optional MIME type (default: image/png)
 * @returns Object with uri property compatible with React Native Image
 */
export const base64ToImageSource = (base64Data: string, mimeType = 'image/png'): { uri: string } => {
  // If it's already a data URI, use it directly
  if (base64Data.startsWith('data:')) {
    return { uri: base64Data };
  }
  
  // Otherwise, create a data URI
  return { uri: `data:${mimeType};base64,${base64Data}` };
};

/**
 * Creates an SVG placeholder for when images fail to load
 * @param letter The letter to display in the center
 * @param bgColor Background color of the SVG
 * @param textColor Text color
 * @returns Data URI of the SVG image
 */
export const createLetterPlaceholder = (
  letter: string = 'S', 
  bgColor: string = '#7e22ce', 
  textColor: string = '#ffffff'
): string => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="100" fill="${bgColor}"/>
      <text x="50%" y="50%" font-size="80" text-anchor="middle" dy=".3em" fill="${textColor}" font-family="Arial, sans-serif" font-weight="bold">${letter}</text>
    </svg>
  `;
  
  // Convert SVG to base64
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
};

export default {
  extractBase64Data,
  base64ToImageSource,
  createLetterPlaceholder
}; 