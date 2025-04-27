/**
 * Preload utility to improve performance by loading assets in the background
 */

/**
 * Preload an image in the background
 * @param {string} src - Image URL to preload
 * @returns {Promise} - Promise that resolves when the image is loaded
 */
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
};

/**
 * Preload multiple images in the background
 * @param {string[]} sources - Array of image URLs to preload
 * @returns {Promise} - Promise that resolves when all images are loaded
 */
export const preloadImages = async (sources) => {
  try {
    // Load images in parallel with Promise.all
    await Promise.all(sources.map(src => preloadImage(src)));
    return true;
  } catch (error) {
    console.warn('Some images failed to preload:', error);
    return false;
  }
};

/**
 * Preload videos in the background
 * @param {string} src - Video URL to preload
 * @returns {Promise} - Promise that resolves when the video is loaded
 */
export const preloadVideo = (src) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'auto';
    
    video.onloadeddata = () => resolve(video);
    video.onerror = () => reject(new Error(`Failed to load video: ${src}`));
    
    video.src = src;
    
    // Start loading but don't play
    video.load();
  });
};

/**
 * Preload key resources in the background
 * @param {Object} resources - Object containing arrays of resources to preload
 * @param {string[]} resources.images - Array of image URLs to preload
 * @param {string[]} resources.videos - Array of video URLs to preload
 */
export const preloadResources = async ({ images = [], videos = [] }) => {
  // Preload images
  if (images.length > 0) {
    try {
      await preloadImages(images);
    } catch (error) {
      console.warn('Failed to preload images:', error);
    }
  }
  
  // Preload videos
  if (videos.length > 0) {
    try {
      await Promise.all(videos.map(src => preloadVideo(src)));
    } catch (error) {
      console.warn('Failed to preload videos:', error);
    }
  }
};