import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 -mt-16">
      <div className="text-6xl font-bold text-blue-800 mb-4">404</div>
      <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
      <p className="text-gray-600 mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="bg-blue-800 hover:bg-blue-900 text-white px-6 py-3 rounded-md font-bold"
      >
        Go Back Home
      </Link>
    </div>
  );
};

export default NotFound;