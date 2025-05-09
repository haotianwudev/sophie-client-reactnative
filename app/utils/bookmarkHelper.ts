import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKMARKS_KEY = '@sophie_bookmarks';

/**
 * Get all bookmarked tickers from AsyncStorage
 */
export const getBookmarkedTickers = async (): Promise<string[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(BOOKMARKS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Error getting bookmarks:', error);
    return [];
  }
};

/**
 * Add a ticker to bookmarks
 */
export const addBookmark = async (ticker: string): Promise<void> => {
  try {
    const bookmarks = await getBookmarkedTickers();
    if (!bookmarks.includes(ticker)) {
      const updatedBookmarks = [...bookmarks, ticker];
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
    }
  } catch (error) {
    console.error('Error adding bookmark:', error);
  }
};

/**
 * Remove a ticker from bookmarks
 */
export const removeBookmark = async (ticker: string): Promise<void> => {
  try {
    const bookmarks = await getBookmarkedTickers();
    const updatedBookmarks = bookmarks.filter(item => item !== ticker);
    await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
  } catch (error) {
    console.error('Error removing bookmark:', error);
  }
};

/**
 * Toggle bookmark status of a ticker
 */
export const toggleBookmark = async (ticker: string): Promise<void> => {
  try {
    const bookmarks = await getBookmarkedTickers();
    if (bookmarks.includes(ticker)) {
      await removeBookmark(ticker);
    } else {
      await addBookmark(ticker);
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error);
  }
};

/**
 * Check if a ticker is bookmarked
 */
export const isTickerBookmarked = async (ticker: string): Promise<boolean> => {
  try {
    const bookmarks = await getBookmarkedTickers();
    return bookmarks.includes(ticker);
  } catch (error) {
    console.error('Error checking if ticker is bookmarked:', error);
    return false;
  }
}; 