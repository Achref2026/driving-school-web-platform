import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Enrollment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  
  const [school, setSchool] = useState(location.state?.school || null);
  const [selectedInstructor, setSelectedInstructor] = useState(location.state?.selectedInstructor || null);
  const [loading, setLoading] = useState(!school);
  const [instructors, setInstructors] = useState([]);
  const [error, setError] = useState(null);
  const [enrollmentData, setEnrollmentData] = useState({
    drivingSchoolId: id,
    instructorId: location.state?.selectedInstructor?.id || '',
    includeCode: true,
    includeParking: true,
    includeRoad: true
  });
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('redirectAfterLogin', `/driving-schools/${id}/enroll`);
      navigate('/login');
      return;
    }

    if (!school) {
      // If we don't have the school data from the state, fetch it
      const fetchSchoolDetails = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/driving-schools/${id}`);
          setSchool(response.data);
          setInstructors(response.data.instructors || []);
          setLoading(false);
        } catch (err) {
          setError('Failed to load driving school details');
          setLoading(false);
          console.error(err);
        }
      };

      fetchSchoolDetails();
    } else {
      setInstructors(school.instructors || []);
    }
  }, [id, isAuthenticated, navigate, school]);

  const calculateTotalPrice = () => {
    if (!school) return 0;
    
    let total = 0;
    if (enrollmentData.includeCode) total += parseFloat(school.priceCode || 0);
    if (enrollmentData.includeParking) total += parseFloat(school.priceParking || 0);
    if (enrollmentData.includeRoad) total += parseFloat(school.priceRoad || 0);
    
    return total.toFixed(2);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEnrollmentData({
      ...enrollmentData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleInstructorSelect = (instructor) => {
    setSelectedInstructor(instructor);
    setEnrollmentData({
      ...enrollmentData,
      instructorId: instructor.id
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Create enrollment
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/enrollments`, 
        enrollmentData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      // Move to payment step
      setStep(3);
      
      // Set the enrollment ID for payment
      setEnrollmentData({
        ...enrollmentData,
        enrollmentId: response.data.enrollment.id
      });
      
      setLoading(false);
    } catch (err) {
      setError('Failed to create enrollment. Please try again.');
      setLoading(false);
      console.error(err);
    }
  };

  const handlePayment = async (paymentMethod) => {
    try {
      setLoading(true);
      
      // Process payment
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/payments/algerian`,
        {
          enrollmentId: enrollmentData.enrollmentId,
          amount: calculateTotalPrice(),
          cardType: paymentMethod,
          cardNumber: '1234567890123456', // This would be from a form in a real app
          cardHolderName: `${user.firstName} ${user.lastName}`,
          expiryDate: '12/25',
          cvv: '123'
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      // Move to success step
      setStep(4);
      setLoading(false);
    } catch (err) {
      setError('Payment failed. Please try again.');
      setLoading(false);
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-green-600 text-white">
          <h1 className="text-2xl font-bold">Enroll in {school?.name}</h1>
          <div className="flex mt-4">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= s ? 'bg-white text-green-700' : 'bg-green-500 text-white'
                  }`}
                >
                  {s}
                </div>
                {s < 4 && (
                  <div 
                    className={`h-1 w-8 mx-1 ${
                      step > s ? 'bg-white' : 'bg-green-500'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span>Select Courses</span>
            <span>Choose Instructor</span>
            <span>Payment</span>
            <span>Confirmation</span>
          </div>
        </div>

        <div className="p-6">
          {step === 1 && (
            <>
              <h2 className="text-xl font-semibold mb-4">Select Your Courses</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="border rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-green-700">Code Course</h3>
                    <input 
                      type="checkbox" 
                      name="includeCode" 
                      checked={enrollmentData.includeCode}
                      onChange={handleChange}
                      className="form-checkbox h-5 w-5 text-green-600"
                    />
                  </div>
                  <p className="text-lg font-bold">{school?.priceCode} DA</p>
                  <p className="text-gray-600 text-sm">Theory & Road Signs</p>
                </div>
                <div className="border rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-green-700">Parking Course</h3>
                    <input 
                      type="checkbox" 
                      name="includeParking" 
                      checked={enrollmentData.includeParking}
                      onChange={handleChange}
                      className="form-checkbox h-5 w-5 text-green-600"
                    />
                  </div>
                  <p className="text-lg font-bold">{school?.priceParking} DA</p>
                  <p className="text-gray-600 text-sm">Parking Skills</p>
                </div>
                <div className="border rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-green-700">Road Course</h3>
                    <input 
                      type="checkbox" 
                      name="includeRoad" 
                      checked={enrollmentData.includeRoad}
                      onChange={handleChange}
                      className="form-checkbox h-5 w-5 text-green-600"
                    />
                  </div>
                  <p className="text-lg font-bold">{school?.priceRoad} DA</p>
                  <p className="text-gray-600 text-sm">Practical Driving</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">Total Price:</span>
                  <span className="font-bold text-green-700">{calculateTotalPrice()} DA</span>
                </div>
                <p className="text-sm text-gray-600">
                  You must complete the courses in order: Code → Parking → Road
                </p>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  disabled={!enrollmentData.includeCode && !enrollmentData.includeParking && !enrollmentData.includeRoad}
                  className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-xl font-semibold mb-4">Choose Your Instructor</h2>
              
              {instructors.length > 0 ? (
                <>
                  <p className="text-gray-700 mb-4">
                    Select an instructor who will guide you through your practical driving lessons.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {instructors.map(instructor => (
                      <div 
                        key={instructor.id} 
                        className={`border rounded-lg p-4 shadow-sm cursor-pointer transition duration-300 ${
                          selectedInstructor?.id === instructor.id ? 'border-green-500 bg-green-50' : 'hover:border-green-300'
                        }`}
                        onClick={() => handleInstructorSelect(instructor)}
                      >
                        <div className="flex items-center">
                          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                            <img 
                              src={instructor.imageUrl || `https://ui-avatars.com/api/?name=${instructor.firstName}+${instructor.lastName}&background=0D8ABC&color=fff`} 
                              alt={`${instructor.firstName} ${instructor.lastName}`}
                              className="w-full h-full object-cover rounded-full" 
                            />
                          </div>
                          <div className="ml-4">
                            <h3 className="font-semibold">{instructor.firstName} {instructor.lastName}</h3>
                            <p className="text-sm text-gray-600">Gender: {instructor.gender}</p>
                            <p className="text-sm text-gray-600">
                              Car: {instructor.carModel || 'Standard Vehicle'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded mb-6">
                  <p>This driving school does not have any registered instructors yet. You can proceed with enrollment, and an instructor will be assigned to you later.</p>
                </div>
              )}

              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
                >
                  Proceed to Payment
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-xl font-semibold mb-4">Payment</h2>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-lg mb-2">Order Summary</h3>
                <div className="flex justify-between mb-1">
                  <span>Selected Courses:</span>
                  <span>
                    {[
                      enrollmentData.includeCode && 'Code',
                      enrollmentData.includeParking && 'Parking',
                      enrollmentData.includeRoad && 'Road'
                    ].filter(Boolean).join(', ')}
                  </span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Driving School:</span>
                  <span>{school?.name}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Instructor:</span>
                  <span>
                    {selectedInstructor 
                      ? `${selectedInstructor.firstName} ${selectedInstructor.lastName}`
                      : 'To be assigned'}
                  </span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2 mt-2">
                  <span>Total:</span>
                  <span className="text-green-700">{calculateTotalPrice()} DA</span>
                </div>
              </div>

              <h3 className="font-semibold mb-3">Select Payment Method</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div 
                  className="border rounded-lg p-4 shadow-sm cursor-pointer hover:border-green-300"
                  onClick={() => handlePayment('CIB')}
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-700 font-bold">CIB</span>
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold">CIB Card</h3>
                      <p className="text-sm text-gray-600">Pay with Carte Interbancaire</p>
                    </div>
                  </div>
                </div>
                
                <div 
                  className="border rounded-lg p-4 shadow-sm cursor-pointer hover:border-green-300"
                  onClick={() => handlePayment('Edahabia')}
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <span className="text-yellow-700 font-bold">ED</span>
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold">Edahabia Card</h3>
                      <p className="text-sm text-gray-600">Pay with Carte Edahabia</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
                >
                  Back
                </button>
              </div>
            </>
          )}

          {step === 4 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-green-700 mb-4">Enrollment Successful!</h2>
              <p className="text-gray-700 mb-6">
                Thank you for enrolling with {school?.name}. Your payment has been processed successfully.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6 max-w-md mx-auto text-left">
                <h3 className="font-semibold mb-2">What's Next?</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  <li>You can view your courses and schedule in your Student Dashboard</li>
                  <li>You will receive notifications for your upcoming classes</li>
                  <li>Your first Code course will start soon</li>
                </ul>
              </div>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-6 rounded-lg"
                >
                  Back to Home
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Enrollment;
