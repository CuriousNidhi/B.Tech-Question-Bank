import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { getSessionInfo, formatTimeRemaining, isSessionExpiringSoon } from '../utils/sessionManager';
import { useAuth } from '../contexts/AuthContext';

const SessionStatus = () => {
  const { isAuthenticated } = useAuth();
  const [sessionInfo, setSessionInfo] = useState(getSessionInfo());
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const updateSessionInfo = () => {
      const info = getSessionInfo();
      setSessionInfo(info);
      
      // Auto-show status if session is expiring soon
      if (isSessionExpiringSoon(60)) { // Show when less than 1 hour remaining
        setShowStatus(true);
      }
    };

    // Update every minute
    const interval = setInterval(updateSessionInfo, 60000);
    updateSessionInfo(); // Initial update

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  if (!isAuthenticated || !sessionInfo.isValid) {
    return null;
  }

  const isExpiringSoon = isSessionExpiringSoon(60);

  return (
    <div className="relative">
      <button
        onClick={() => setShowStatus(!showStatus)}
        className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
          isExpiringSoon 
            ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
            : 'bg-green-100 text-green-700 hover:bg-green-200'
        }`}
        title="Click to toggle session info"
      >
        {isExpiringSoon ? (
          <AlertCircle className="h-3 w-3" />
        ) : (
          <Clock className="h-3 w-3" />
        )}
        {sessionInfo.hoursRemaining > 0 ? `${sessionInfo.hoursRemaining}h` : `${sessionInfo.minutesRemaining}m`}
      </button>

      {showStatus && (
        <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-48 z-50">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Session Status</h4>
          <div className="space-y-1 text-xs text-gray-600">
            <p>Time remaining: {formatTimeRemaining(sessionInfo.timeRemaining)}</p>
            <p>Expires at: {sessionInfo.expiresAt.toLocaleTimeString()}</p>
            {isExpiringSoon && (
              <p className="text-orange-600 font-medium">
                ⚠️ Session expiring soon!
              </p>
            )}
          </div>
          <button
            onClick={() => setShowStatus(false)}
            className="mt-2 text-xs text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default SessionStatus;
