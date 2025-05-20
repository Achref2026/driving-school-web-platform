import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h2 className="text-xl font-bold mb-4">Driving School Platform</h2>
            <p className="text-gray-300">
              Find the best driving schools in Algeria and start your journey to getting a driver's license.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-300 hover:text-white">Home</Link></li>
              <li><Link to="/schools" className="text-gray-300 hover:text-white">Find Schools</Link></li>
              <li><Link to="/login" className="text-gray-300 hover:text-white">Login</Link></li>
              <li><Link to="/register" className="text-gray-300 hover:text-white">Register</Link></li>
              <li><Link to="/school-register" className="text-gray-300 hover:text-white">Register School</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3">Contact Us</h3>
            <address className="not-italic text-gray-300">
              <p>Email: info@drivingschool.com</p>
              <p>Phone: +213 123 456 789</p>
              <p>Address: Algiers, Algeria</p>
            </address>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-6 pt-6 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Driving School Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;