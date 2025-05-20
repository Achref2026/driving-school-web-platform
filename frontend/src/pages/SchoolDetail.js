import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const SchoolDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [school, setSchool] = useState(null);
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedInstructorId, setSelectedInstructorId] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  
  useEffect(() => {
    fetchSchoolData();
  }, [id]);
  
  const fetchSchoolData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch school details
      const schoolRes = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/driving-schools/${id}`);
      setSchool(schoolRes.data);
      
      // Fetch courses for this school
      const coursesRes = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/courses/school/${id}`);
      setCourses(coursesRes.data);
      
      // Fetch instructors for this school
      const instructorsRes = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/instructors/school/${id}`);
      setInstructors(instructorsRes.data);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching school data:', err);
      setError('Failed to load driving school details. Please try again later.');
      setLoading(false);
    }
  };
  
  const handleEnroll = async (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!selectedCourseId) {
      setEnrollmentError('Please select a course');
      return;
    }
    
    try {
      setEnrolling(true);
      setEnrollmentError(null);
      
      const enrollmentData = {
        courseId: selectedCourseId,
        drivingSchoolId: school.id
      };
      
      // Add instructor for parking and road courses
      const selectedCourse = courses.find(course => course.id === selectedCourseId);
      if (selectedCourse.type !== 'code' && selectedInstructorId) {
        enrollmentData.instructorId = selectedInstructorId;
      }
      
      // Create enrollment
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/enrollments`,
        enrollmentData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      // Redirect to dashboard
      navigate('/dashboard');
      
    } catch (err) {
      console.error('Enrollment error:', err);
      setEnrollmentError(err.response?.data?.error || 'Failed to create enrollment');
    } finally {
      setEnrolling(false);
    }
  };
  
  // Handle course selection
  const handleCourseChange = (e) => {
    setSelectedCourseId(parseInt(e.target.value));
    
    // Reset instructor selection
    setSelectedInstructorId(null);
  };
  
  // Handle instructor selection
  const handleInstructorChange = (e) => {
    setSelectedInstructorId(parseInt(e.target.value));
  };
  
  // Selected course object
  const selectedCourse = selectedCourseId ? courses.find(course => course.id === selectedCourseId) : null;
  
  // Filter instructors based on gender matching for selectedCourse
  const filteredInstructors = instructors.filter(instructor => {
    // If no course is selected or the course is code, show all instructors
    if (!selectedCourse || selectedCourse.type === 'code') {
      return true;
    }
    
    // If the user is logged in, filter by gender matching
    if (user) {
      if (user.gender === 'male' && instructor.User.gender === 'male') {
        return true;
      }
      if (user.gender === 'female' && instructor.User.gender === 'female') {
        return true;
      }
      return false;
    }
    
    // If no user is logged in, show all instructors
    return true;
  });
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-800"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button
          className="bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded"
          onClick={fetchSchoolData}
        >
          Try Again
        </button>
      </div>
    );
  }
  
  if (!school) {
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* School Header */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="bg-blue-800 text-white py-6 px-6">
          <h1 className="text-3xl font-bold">{school.name}</h1>
          <div className="flex items-center mt-2">
            <span className="text-yellow-400 mr-1">★</span>
            <span>{school.rating.toFixed(1)}</span>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Location</h3>
              <p className="text-gray-700">{school.address}, {school.region}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Contact</h3>
              <p className="text-gray-700">{school.email}</p>
              <p className="text-gray-700">{school.phoneNumber}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Instructors</h3>
              <div className="flex flex-wrap gap-2">
                {school.hasFemaleInstructors && (
                  <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded-full text-xs">
                    Female Instructors
                  </span>
                )}
                {school.hasMaleInstructors && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    Male Instructors
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {school.description && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">About</h3>
              <p className="text-gray-700">{school.description}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              className={`py-4 px-6 text-center ${
                activeTab === 'info'
                  ? 'border-b-2 border-blue-800 text-blue-800 font-semibold'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('info')}
            >
              Information
            </button>
            <button
              className={`py-4 px-6 text-center ${
                activeTab === 'courses'
                  ? 'border-b-2 border-blue-800 text-blue-800 font-semibold'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('courses')}
            >
              Courses
            </button>
            <button
              className={`py-4 px-6 text-center ${
                activeTab === 'instructors'
                  ? 'border-b-2 border-blue-800 text-blue-800 font-semibold'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('instructors')}
            >
              Instructors
            </button>
            <button
              className={`py-4 px-6 text-center ${
                activeTab === 'enroll'
                  ? 'border-b-2 border-blue-800 text-blue-800 font-semibold'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('enroll')}
            >
              Enroll
            </button>
          </nav>
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="mb-8">
        {/* Information Tab */}
        {activeTab === 'info' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">About {school.name}</h2>
            <p className="text-gray-700 mb-6">{school.description || 'No description available.'}</p>
            
            <h3 className="text-xl font-semibold mb-3">Facilities</h3>
            <ul className="list-disc pl-5 mb-6 text-gray-700">
              <li>Modern vehicles for practical training</li>
              <li>Classroom facilities for code theory courses</li>
              <li>Dedicated parking practice area</li>
              <li>Experienced instructors</li>
            </ul>
            
            <h3 className="text-xl font-semibold mb-3">License Information</h3>
            <p className="text-gray-700 mb-2">License Number: {school.licenseNumber}</p>
            <p className="text-gray-700">Certified by the Algerian Ministry of Transport</p>
          </div>
        )}
        
        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Available Courses</h2>
            
            {courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {courses.map(course => (
                  <div key={course.id} className="border rounded-lg shadow-md overflow-hidden">
                    <div className={`p-4 ${
                      course.type === 'code' ? 'bg-blue-100' :
                      course.type === 'parking' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <h3 className="text-xl font-semibold">{course.name}</h3>
                      <span className="inline-block px-2 py-1 rounded-full text-xs uppercase font-bold mt-1 ${
                        course.type === 'code' ? 'bg-blue-700 text-white' :
                        course.type === 'parking' ? 'bg-green-700 text-white' : 'bg-red-700 text-white'
                      }">
                        {course.type}
                      </span>
                    </div>
                    
                    <div className="p-4">
                      <p className="text-gray-700 mb-3">{course.description}</p>
                      
                      <div className="flex justify-between mb-3">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-semibold">{course.duration} hours</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-semibold">{course.price} DZD</span>
                      </div>
                      
                      <button
                        className="mt-4 w-full bg-blue-800 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded"
                        onClick={() => {
                          setActiveTab('enroll');
                          setSelectedCourseId(course.id);
                        }}
                      >
                        Enroll Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-700">No courses available at this time.</p>
            )}
          </div>
        )}
        
        {/* Instructors Tab */}
        {activeTab === 'instructors' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Our Instructors</h2>
            
            {instructors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {instructors.map(instructor => (
                  <div key={instructor.id} className="border rounded-lg shadow-md overflow-hidden">
                    <div className="h-48 bg-gray-200">
                      {instructor.imageUrl ? (
                        <img 
                          src={instructor.imageUrl} 
                          alt={`${instructor.User.firstName} ${instructor.User.lastName}`} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <span className="text-3xl font-bold text-gray-400">
                            {instructor.User.firstName.charAt(0)}{instructor.User.lastName.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <h3 className="text-xl font-semibold mb-2">
                        {instructor.User.firstName} {instructor.User.lastName}
                      </h3>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          instructor.User.gender === 'male' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-pink-100 text-pink-800'
                        }`}>
                          {instructor.User.gender === 'male' ? 'Male' : 'Female'}
                        </span>
                        
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                          {instructor.specialization === 'all' 
                            ? 'All Courses' 
                            : `${instructor.specialization.charAt(0).toUpperCase()}${instructor.specialization.slice(1)} Specialist`}
                        </span>
                      </div>
                      
                      {instructor.rating > 0 && (
                        <div className="mb-3 flex items-center">
                          <span className="text-yellow-500 mr-1">★</span>
                          <span>{instructor.rating.toFixed(1)}</span>
                        </div>
                      )}
                      
                      {instructor.licensedSince && (
                        <p className="text-gray-700 mb-2">
                          Licensed since: {new Date(instructor.licensedSince).getFullYear()}
                        </p>
                      )}
                      
                      {instructor.carModel && (
                        <p className="text-gray-700">
                          Car: {instructor.carModel}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-700">No instructors available at this time.</p>
            )}
          </div>
        )}
        
        {/* Enroll Tab */}
        {activeTab === 'enroll' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Enroll in a Course</h2>
            
            {!user && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
                <p>You need to login or create an account to enroll in a course.</p>
                <div className="mt-3">
                  <button
                    className="bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded mr-3"
                    onClick={() => navigate('/login')}
                  >
                    Login
                  </button>
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                    onClick={() => navigate('/register')}
                  >
                    Register
                  </button>
                </div>
              </div>
            )}
            
            {enrollmentError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                {enrollmentError}
              </div>
            )}
            
            <form onSubmit={handleEnroll}>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="course">
                  Select Course
                </label>
                <select
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="course"
                  value={selectedCourseId || ''}
                  onChange={handleCourseChange}
                  disabled={enrolling}
                >
                  <option value="">Select a course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.name} - {course.type.toUpperCase()} - {course.price} DZD
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedCourse && selectedCourse.type !== 'code' && (
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="instructor">
                    Select Instructor
                  </label>
                  <select
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="instructor"
                    value={selectedInstructorId || ''}
                    onChange={handleInstructorChange}
                    disabled={enrolling}
                  >
                    <option value="">Select an instructor</option>
                    {filteredInstructors.map(instructor => (
                      <option key={instructor.id} value={instructor.id}>
                        {instructor.User.firstName} {instructor.User.lastName} 
                        {instructor.User.gender === 'male' ? ' (Male)' : ' (Female)'}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {selectedCourse && (
                <div className="bg-gray-100 p-4 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold mb-2">Course Details</h3>
                  <p className="text-gray-700 mb-3">{selectedCourse.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600">Type:</p>
                      <p className="font-semibold">{selectedCourse.type.toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Duration:</p>
                      <p className="font-semibold">{selectedCourse.duration} hours</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Price:</p>
                      <p className="font-semibold">{selectedCourse.price} DZD</p>
                    </div>
                  </div>
                </div>
              )}
              
              <button
                className="bg-blue-800 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded w-full"
                type="submit"
                disabled={enrolling || !user}
              >
                {enrolling ? 'Processing...' : 'Enroll Now'}
              </button>
              
              <p className="mt-4 text-gray-600 text-sm">
                By enrolling, you agree to the terms and conditions of the driving school.
                Payment will be processed after your enrollment is confirmed.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolDetail;