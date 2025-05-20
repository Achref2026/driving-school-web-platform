import React, { useState, useContext, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

// Dashboard components
import StudentDashboard from '../components/dashboard/StudentDashboard';
import InstructorDashboard from '../components/dashboard/InstructorDashboard';
import ManagerDashboard from '../components/dashboard/ManagerDashboard';
import ProfileSettings from '../components/dashboard/ProfileSettings';
import NotFound from './NotFound';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  useEffect(() => {
    // Set active tab based on the current path
    const path = location.pathname.split('/')[2] || 'dashboard';
    setActiveTab(path);
  }, [location]);
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="md:w-1/4 bg-white rounded-lg shadow-md p-4">
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-blue-100 mx-auto flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-800">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </span>
            </div>
            <h2 className="text-xl font-bold mt-2">{user.firstName} {user.lastName}</h2>
            <p className="text-gray-600 capitalize">{user.role}</p>
          </div>
          
          <nav className="space-y-1">
            <Link
              to="/dashboard"
              className={`block px-4 py-2 rounded-md ${
                activeTab === 'dashboard' 
                  ? 'bg-blue-800 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </Link>
            
            {user.role === 'manager' && (
              <>
                <Link
                  to="/dashboard/school"
                  className={`block px-4 py-2 rounded-md ${
                    activeTab === 'school' 
                      ? 'bg-blue-800 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('school')}
                >
                  School Management
                </Link>
                <Link
                  to="/dashboard/instructors"
                  className={`block px-4 py-2 rounded-md ${
                    activeTab === 'instructors' 
                      ? 'bg-blue-800 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('instructors')}
                >
                  Instructors
                </Link>
                <Link
                  to="/dashboard/courses"
                  className={`block px-4 py-2 rounded-md ${
                    activeTab === 'courses' 
                      ? 'bg-blue-800 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('courses')}
                >
                  Courses
                </Link>
                <Link
                  to="/dashboard/enrollments"
                  className={`block px-4 py-2 rounded-md ${
                    activeTab === 'enrollments' 
                      ? 'bg-blue-800 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('enrollments')}
                >
                  Enrollments
                </Link>
                <Link
                  to="/dashboard/exams"
                  className={`block px-4 py-2 rounded-md ${
                    activeTab === 'exams' 
                      ? 'bg-blue-800 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('exams')}
                >
                  Exams
                </Link>
              </>
            )}
            
            {user.role === 'instructor' && (
              <>
                <Link
                  to="/dashboard/schedule"
                  className={`block px-4 py-2 rounded-md ${
                    activeTab === 'schedule' 
                      ? 'bg-blue-800 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('schedule')}
                >
                  Schedule
                </Link>
                <Link
                  to="/dashboard/students"
                  className={`block px-4 py-2 rounded-md ${
                    activeTab === 'students' 
                      ? 'bg-blue-800 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('students')}
                >
                  Students
                </Link>
                <Link
                  to="/dashboard/exams"
                  className={`block px-4 py-2 rounded-md ${
                    activeTab === 'exams' 
                      ? 'bg-blue-800 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('exams')}
                >
                  Exams
                </Link>
              </>
            )}
            
            {user.role === 'student' && (
              <>
                <Link
                  to="/dashboard/courses"
                  className={`block px-4 py-2 rounded-md ${
                    activeTab === 'courses' 
                      ? 'bg-blue-800 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('courses')}
                >
                  My Courses
                </Link>
                <Link
                  to="/dashboard/schedule"
                  className={`block px-4 py-2 rounded-md ${
                    activeTab === 'schedule' 
                      ? 'bg-blue-800 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('schedule')}
                >
                  Schedule
                </Link>
                <Link
                  to="/dashboard/exams"
                  className={`block px-4 py-2 rounded-md ${
                    activeTab === 'exams' 
                      ? 'bg-blue-800 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('exams')}
                >
                  Exams
                </Link>
              </>
            )}
            
            <Link
              to="/dashboard/profile"
              className={`block px-4 py-2 rounded-md ${
                activeTab === 'profile' 
                  ? 'bg-blue-800 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              Profile Settings
            </Link>
            
            <button
              className="block w-full text-left px-4 py-2 rounded-md text-red-600 hover:bg-red-100"
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              Logout
            </button>
          </nav>
        </div>
        
        {/* Main Content */}
        <div className="md:w-3/4 bg-white rounded-lg shadow-md p-6">
          <Routes>
            <Route 
              path="/" 
              element={
                user.role === 'student' ? <StudentDashboard /> :
                user.role === 'instructor' ? <InstructorDashboard /> :
                <ManagerDashboard />
              } 
            />
            <Route path="/profile" element={<ProfileSettings />} />
            
            {/* Add routes for each dashboard section */}
            {/* These would be implemented in separate components */}
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;