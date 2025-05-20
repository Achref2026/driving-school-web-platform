import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const DrivingSchoolDetails = () => {
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchSchoolDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/driving-schools/${id}`);
        setSchool(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load driving school details');
        setLoading(false);
        console.error(err);
      }
    };

    fetchSchoolDetails();
  }, [id]);

  const handleEnrollment = () => {
    if (!isAuthenticated) {
      // Save the intended destination
      localStorage.setItem('redirectAfterLogin', `/driving-schools/${id}/enroll`);
      navigate('/login');
      return;
    }

    // If user is already authenticated, proceed to enrollment
    navigate(`/driving-schools/${id}/enroll`, { 
      state: { 
        school, 
        selectedInstructor 
      } 
    });
  };

  const handleInstructorSelect = (instructor) => {
    setSelectedInstructor(instructor);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !school) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error || 'Failed to load driving school details'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* School Header */}
        <div className="relative">
          <div className="h-48 bg-gradient-to-r from-green-500 to-green-700"></div>
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black opacity-50"></div>
          <div className="absolute bottom-4 left-4 flex items-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center p-1 shadow-lg">
              <img 
                src={school.logoUrl || 'https://via.placeholder.com/150'} 
                alt={school.name} 
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="ml-4">
              <h1 className="text-white text-2xl font-bold">{school.name}</h1>
              <p className="text-white opacity-90">{school.region}</p>
            </div>
          </div>
        </div>

        {/* School Details */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold mb-4">About This Driving School</h2>
              <p className="text-gray-700 mb-4">{school.description || 'No description available.'}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-700">Address</h3>
                  <p className="text-gray-600">{school.address}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Contact</h3>
                  <p className="text-gray-600">{school.phoneNumber}</p>
                  <p className="text-gray-600">{school.email}</p>
                </div>
              </div>

              <h2 className="text-xl font-semibold mb-4">Courses & Pricing</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="border rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-green-700">Code Course</h3>
                  <p className="text-lg font-bold">{school.priceCode} DA</p>
                  <p className="text-gray-600 text-sm">Theory & Road Signs</p>
                </div>
                <div className="border rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-green-700">Parking Course</h3>
                  <p className="text-lg font-bold">{school.priceParking} DA</p>
                  <p className="text-gray-600 text-sm">Parking Skills</p>
                </div>
                <div className="border rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-green-700">Road Course</h3>
                  <p className="text-lg font-bold">{school.priceRoad} DA</p>
                  <p className="text-gray-600 text-sm">Practical Driving</p>
                </div>
              </div>

              {school.instructors && school.instructors.length > 0 && (
                <>
                  <h2 className="text-xl font-semibold mb-4">Instructors</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {school.instructors.map(instructor => (
                      <div 
                        key={instructor.id} 
                        className={`border rounded-lg p-4 shadow-sm cursor-pointer transition duration-300 ${
                          selectedInstructor?.id === instructor.id ? 'border-green-500 bg-green-50' : 'hover:border-green-300'
                        }`}
                        onClick={() => handleInstructorSelect(instructor)}
                      >
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <img 
                              src={instructor.imageUrl || `https://ui-avatars.com/api/?name=${instructor.firstName}+${instructor.lastName}&background=0D8ABC&color=fff`} 
                              alt={`${instructor.firstName} ${instructor.lastName}`}
                              className="w-full h-full object-cover rounded-full" 
                            />
                          </div>
                          <div className="ml-3">
                            <h3 className="font-semibold">{instructor.firstName} {instructor.lastName}</h3>
                            <p className="text-sm text-gray-600">Gender: {instructor.gender}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Summary</h2>
              <div className="mb-4">
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">License Since:</span> {school.licenseNumber}
                </p>
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">Rating:</span> {school.rating}/5
                </p>
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">Female Instructors:</span> {school.hasFemaleInstructors ? 'Yes' : 'No'}
                </p>
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">Male Instructors:</span> {school.hasMaleInstructors ? 'Yes' : 'No'}
                </p>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-2">Total Package Price</h3>
                <p className="text-2xl font-bold text-green-700">
                  {(parseFloat(school.priceCode) + parseFloat(school.priceParking) + parseFloat(school.priceRoad)).toFixed(2)} DA
                </p>
                <p className="text-sm text-gray-600 mb-4">All courses included</p>
                
                <button
                  onClick={handleEnrollment}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition duration-300 font-semibold"
                >
                  Start Enrollment
                </button>
                
                <p className="text-xs text-gray-500 mt-2 text-center">
                  You'll be able to choose specific courses during enrollment
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrivingSchoolDetails;
