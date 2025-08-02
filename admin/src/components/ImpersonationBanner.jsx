import React from 'react';

const ImpersonationBanner = ({ onExit }) => {
  const handleExit = () => {
    localStorage.removeItem('impersonationToken');
    onExit();
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-400 text-black p-3 text-center z-50">
      <span>You are currently impersonating a customer.</span>
      <button
        onClick={handleExit}
        className="ml-4 bg-black text-yellow-400 px-3 py-1 rounded hover:bg-gray-800"
      >
        Exit Impersonation
      </button>
    </div>
  );
};

export default ImpersonationBanner;
