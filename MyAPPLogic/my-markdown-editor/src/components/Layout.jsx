import React from 'react';
import App from '../pages/App';

function Layout({ children }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 py-8">
      <div className="w-full max-w-4xl mx-4">{children}</div>
    </div>
  );
}

export default Layout;
