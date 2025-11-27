// Utility functions to manage booking preferences across login flow
const BOOKING_PREFERENCES_KEY = 'legalbell_booking_preferences';

export const saveBookingPreferences = (preferences) => {
  try {
    localStorage.setItem(BOOKING_PREFERENCES_KEY, JSON.stringify(preferences));
    return true;
  } catch (error) {
    console.error('Error saving booking preferences:', error);
    return false;
  }
};

export const getBookingPreferences = () => {
  try {
    const preferences = localStorage.getItem(BOOKING_PREFERENCES_KEY);
    return preferences ? JSON.parse(preferences) : null;
  } catch (error) {
    console.error('Error retrieving booking preferences:', error);
    return null;
  }
};

export const clearBookingPreferences = () => {
  try {
    localStorage.removeItem(BOOKING_PREFERENCES_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing booking preferences:', error);
    return false;
  }
};

// Check if there are valid booking preferences
export const hasValidBookingPreferences = () => {
  const preferences = getBookingPreferences();
  return preferences && 
         preferences.consultationType && 
         preferences.city && 
         preferences.caseDescription &&
         preferences.selectedLawyer;
};