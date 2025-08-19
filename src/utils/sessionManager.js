// Session management utilities

export const getSessionInfo = () => {
  const token = localStorage.getItem('token');
  const expiresAt = localStorage.getItem('tokenExpiresAt');
  
  if (!token || !expiresAt) {
    return { isValid: false, timeRemaining: 0 };
  }
  
  const now = new Date().getTime();
  const expiry = parseInt(expiresAt);
  const timeRemaining = expiry - now;
  
  return {
    isValid: timeRemaining > 0,
    timeRemaining,
    expiresAt: new Date(expiry),
    hoursRemaining: Math.ceil(timeRemaining / (1000 * 60 * 60)),
    minutesRemaining: Math.ceil(timeRemaining / (1000 * 60))
  };
};

export const formatTimeRemaining = (timeRemaining) => {
  const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export const isSessionExpiringSoon = (thresholdMinutes = 30) => {
  const { timeRemaining } = getSessionInfo();
  return timeRemaining > 0 && timeRemaining < (thresholdMinutes * 60 * 1000);
};
