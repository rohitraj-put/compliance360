import React from "react";

/**
 * Simple Loading component.
 * Props:
 * - message: optional string to display under the spinner
 */
const Loading = ({ message }) => {
  const spinnerStyle = {
    width: 48,
    height: 48,
    border: '6px solid #e5e7eb',
    borderTop: '6px solid #2563eb',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
  };

  return (
    <div style={containerStyle} role="status" aria-live="polite">
      <div style={spinnerStyle} />
      <div className="loading-message">{message}</div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Loading;
