import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-blue-800 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">Driving School Platform</Link>
          
          {/* Mobile menu button */}
          <button className="md:hidden flex items-center" onClick={toggleMenu}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="hover:text-blue-200">Home</Link>
            <Link to="/schools" className="hover:text-blue-200">Schools</Link>
            
            {user ? (
              <>
                <Link to="/dashboard" className="hover:text-blue-200">Dashboard</Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-200">Login</Link>
                <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">Register</Link>
              </>
            )}
            
            <Link to="/school-register" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md">
              Register School
            </Link>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 space-y-2">
            <Link to="/" className="block hover:text-blue-200">Home</Link>
            <Link to="/schools" className="block hover:text-blue-200">Schools</Link>
            
            {user ? (
              <>
                <Link to="/dashboard" className="block hover:text-blue-200">Dashboard</Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block hover:text-blue-200">Login</Link>
                <Link to="/register" className="block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">Register</Link>
              </>
            )}
            
            <Link to="/school-register" className="block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md">
              Register School
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;