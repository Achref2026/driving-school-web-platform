import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [upcomingCourses, setUpcomingCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchStudentData = async () => {
      try {
        setLoading(true);
        
        // Fetch enrollments
        const enrollmentsResponse = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/enrollments/student`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        setEnrollments(enrollmentsResponse.data);
        
        // Fetch payments
        const paymentsResponse = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/payments/student`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        setPayments(paymentsResponse.data);
        
        // Fetch upcoming courses from all enrollments
        const coursesPromises = enrollmentsResponse.data.map(enrollment => 
          axios.get(
            `${process.env.REACT_APP_BACKEND_URL}/api/courses/enrollment/${enrollment.id}`,
            {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            }
          )
        );
        
        const coursesResponses = await Promise.all(coursesPromises);
        const allCourses = coursesResponses.flatMap(response => response.data);
        
        // Filter for upcoming courses (date in the future and not completed)
        const upcoming = allCourses.filter(course => 
          new Date(course.date) > new Date() && !course.completed
        ).sort((a, b) => new Date(a.date) - new Date(b.date));
        
        setUpcomingCourses(upcoming);
        setLoading(false);
      } catch (err) {
        setError('Failed to load dashboard data');
        setLoading(false);
        console.error(err);
      }
    };

    fetchStudentData();
  }, [isAuthenticated, navigate]);

  const getCourseStatusBadge = (enrollment) => {
    const { status, currentCourse, codeCompleted, parkingCompleted, roadCompleted } = enrollment;
    
    if (status === 'completed') {
      return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">All Courses Completed</span>;
    }
    
    if (status === 'pending') {
      return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Pending Payment</span>;
    }
    
    let badge;
    switch (currentCourse) {
      case 'code':
        badge = <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Code Course</span>;
        break;
      case 'parking':
        badge = <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">Parking Course</span>;
        break;
      case 'road':
        badge = <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Road Course</span>;
        break;
      default:
        badge = <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Unknown</span>;
    }
    
    return badge;
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6 bg-green-600 text-white">
          <h1 className="text-2xl font-bold">Student Dashboard</h1>
          <p>Welcome back, {user?.firstName} {user?.lastName}</p>
        </div>
        
        <div className="border-b">
          <nav className="flex">
            <button
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'overview' ? 'border-b-2 border-green-500 text-green-700' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'courses' ? 'border-b-2 border-green-500 text-green-700' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('courses')}
            >
              My Courses
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'schedule' ? 'border-b-2 border-green-500 text-green-700' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('schedule')}
            >
              Schedule
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'payments' ? 'border-b-2 border-green-500 text-green-700' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('payments')}
            >
              Payments
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="font-semibold text-blue-700 mb-2">Enrollments</h3>
                  <p className="text-3xl font-bold">{enrollments.length}</p>
                  <p className="text-sm text-blue-600">Total driving schools</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <h3 className="font-semibold text-green-700 mb-2">Upcoming Classes</h3>
                  <p className="text-3xl font-bold">{upcomingCourses.length}</p>
                  <p className="text-sm text-green-600">Scheduled sessions</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                  <h3 className="font-semibold text-purple-700 mb-2">Completed Courses</h3>
                  <p className="text-3xl font-bold">
                    {enrollments.reduce((total, enrollment) => {
                      let completed = 0;
                      if (enrollment.codeCompleted) completed++;
                      if (enrollment.parkingCompleted) completed++;
                      if (enrollment.roadCompleted) completed++;
                      return total + completed;
                    }, 0)}
                  </p>
                  <p className="text-sm text-purple-600">Successfully completed</p>
                </div>
              </div>
              
              <h2 className="text-xl font-semibold mb-4">Your Driving Schools</h2>
              {enrollments.length === 0 ? (
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <p className="text-gray-600 mb-4">You are not enrolled in any driving school yet.</p>
                  <button
                    onClick={() => navigate('/')}
                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
                  >
                    Find Driving Schools
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                        <th className="py-3 px-6 text-left">Driving School</th>
                        <th className="py-3 px-6 text-left">Status</th>
                        <th className="py-3 px-6 text-center">Progress</th>
                        <th className="py-3 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm">
                      {enrollments.map((enrollment) => (
                        <tr key={enrollment.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-3 px-6 text-left">
                            <div className="flex items-center">
                              <div className="mr-2">
                                <img 
                                  src={enrollment.drivingSchool?.logoUrl || 'https://via.placeholder.com/30'} 
                                  alt={enrollment.drivingSchool?.name} 
                                  className="w-8 h-8 rounded-full"
                                />
                              </div>
                              <span>{enrollment.drivingSchool?.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-6 text-left">
                            {getCourseStatusBadge(enrollment)}
                          </td>
                          <td className="py-3 px-6 text-center">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-green-600 h-2.5 rounded-full" 
                                style={{ 
                                  width: `${((enrollment.codeCompleted ? 1 : 0) + 
                                            (enrollment.parkingCompleted ? 1 : 0) + 
                                            (enrollment.roadCompleted ? 1 : 0)) * 33.33}%` 
                                }}
                              ></div>
                            </div>
                            <p className="text-xs mt-1">
                              {((enrollment.codeCompleted ? 1 : 0) + 
                               (enrollment.parkingCompleted ? 1 : 0) + 
                               (enrollment.roadCompleted ? 1 : 0))}/3 Completed
                            </p>
                          </td>
                          <td className="py-3 px-6 text-right">
                            <button className="bg-blue-500 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded">
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {upcomingCourses.length > 0 && (
                <>
                  <h2 className="text-xl font-semibold mt-8 mb-4">Upcoming Classes</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {upcomingCourses.slice(0, 4).map((course) => (
                      <div key={course.id} className="border rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{course.title}</h3>
                            <p className="text-sm text-gray-600">{formatDate(course.date)}</p>
                            <p className="text-sm text-gray-600">Duration: {course.duration} minutes</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            course.type === 'code' ? 'bg-blue-100 text-blue-800' :
                            course.type === 'parking' ? 'bg-purple-100 text-purple-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {course.type.charAt(0).toUpperCase() + course.type.slice(1)}
                          </span>
                        </div>
                        {course.meetLink && (
                          <div className="mt-4 pt-3 border-t">
                            <a 
                              href={course.meetLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="bg-green-600 hover:bg-green-700 text-white text-sm py-1 px-3 rounded inline-flex items-center"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                              </svg>
                              Join Online Class
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {upcomingCourses.length > 4 && (
                    <div className="text-center mt-4">
                      <button 
                        onClick={() => setActiveTab('schedule')}
                        className="text-green-600 hover:text-green-800"
                      >
                        View all scheduled classes
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
          
          {activeTab === 'courses' && (
            <>
              <h2 className="text-xl font-semibold mb-4">My Courses</h2>
              
              {enrollments.length === 0 ? (
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <p className="text-gray-600 mb-4">You are not enrolled in any courses yet.</p>
                  <button
                    onClick={() => navigate('/')}
                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
                  >
                    Find Driving Schools
                  </button>
                </div>
              ) : (
                <>
                  {enrollments.map((enrollment) => (
                    <div key={enrollment.id} className="mb-8 border rounded-lg overflow-hidden">
                      <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">{enrollment.drivingSchool?.name}</h3>
                          <p className="text-sm text-gray-600">
                            Enrolled: {new Date(enrollment.dateEnrolled).toLocaleDateString()}
                          </p>
                        </div>
                        {getCourseStatusBadge(enrollment)}
                      </div>
                      
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className={`border rounded-lg p-4 ${enrollment.codeCompleted ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold">Code Course</h4>
                              {enrollment.codeCompleted ? (
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Completed</span>
                              ) : enrollment.currentCourse === 'code' ? (
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">In Progress</span>
                              ) : (
                                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">Pending</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">Theory & Road Signs</p>
                            {enrollment.currentCourse === 'code' && (
                              <button className="mt-3 bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-2 rounded">
                                Access Course
                              </button>
                            )}
                          </div>
                          
                          <div className={`border rounded-lg p-4 ${
                            enrollment.parkingCompleted 
                              ? 'bg-green-50 border-green-200' 
                              : enrollment.codeCompleted 
                                ? enrollment.currentCourse === 'parking'
                                  ? 'bg-blue-50 border-blue-200'
                                  : 'bg-gray-50'
                                : 'bg-gray-50 opacity-60'
                          }`}>
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold">Parking Course</h4>
                              {enrollment.parkingCompleted ? (
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Completed</span>
                              ) : enrollment.currentCourse === 'parking' ? (
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">In Progress</span>
                              ) : enrollment.codeCompleted ? (
                                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Next</span>
                              ) : (
                                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">Locked</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">Parking Skills</p>
                            {enrollment.currentCourse === 'parking' && (
                              <button className="mt-3 bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-2 rounded">
                                View Schedule
                              </button>
                            )}
                          </div>
                          
                          <div className={`border rounded-lg p-4 ${
                            enrollment.roadCompleted 
                              ? 'bg-green-50 border-green-200' 
                              : enrollment.parkingCompleted 
                                ? enrollment.currentCourse === 'road'
                                  ? 'bg-blue-50 border-blue-200'
                                  : 'bg-gray-50'
                                : 'bg-gray-50 opacity-60'
                          }`}>
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold">Road Course</h4>
                              {enrollment.roadCompleted ? (
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Completed</span>
                              ) : enrollment.currentCourse === 'road' ? (
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">In Progress</span>
                              ) : enrollment.parkingCompleted ? (
                                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Next</span>
                              ) : (
                                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">Locked</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">Practical Driving</p>
                            {enrollment.currentCourse === 'road' && (
                              <button className="mt-3 bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-2 rounded">
                                View Schedule
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
          
          {activeTab === 'schedule' && (
            <>
              <h2 className="text-xl font-semibold mb-4">My Schedule</h2>
              
              {upcomingCourses.length === 0 ? (
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <p className="text-gray-600">You don't have any upcoming classes scheduled.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                        <th className="py-3 px-6 text-left">Course</th>
                        <th className="py-3 px-6 text-left">Type</th>
                        <th className="py-3 px-6 text-left">Date & Time</th>
                        <th className="py-3 px-6 text-center">Duration</th>
                        <th className="py-3 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm">
                      {upcomingCourses.map((course) => (
                        <tr key={course.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-3 px-6 text-left">
                            <div className="font-medium">{course.title}</div>
                          </td>
                          <td className="py-3 px-6 text-left">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              course.type === 'code' ? 'bg-blue-100 text-blue-800' :
                              course.type === 'parking' ? 'bg-purple-100 text-purple-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {course.type.charAt(0).toUpperCase() + course.type.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-6 text-left">
                            {formatDate(course.date)}
                          </td>
                          <td className="py-3 px-6 text-center">
                            {course.duration} minutes
                          </td>
                          <td className="py-3 px-6 text-right">
                            {course.meetLink ? (
                              <a 
                                href={course.meetLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-2 rounded inline-flex items-center"
                              >
                                Join Class
                              </a>
                            ) : (
                              <button className="bg-blue-500 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded">
                                View Details
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
          
          {activeTab === 'payments' && (
            <>
              <h2 className="text-xl font-semibold mb-4">Payment History</h2>
              
              {payments.length === 0 ? (
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <p className="text-gray-600">You don't have any payment records yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                        <th className="py-3 px-6 text-left">Transaction ID</th>
                        <th className="py-3 px-6 text-left">Date</th>
                        <th className="py-3 px-6 text-left">Amount</th>
                        <th className="py-3 px-6 text-center">Method</th>
                        <th className="py-3 px-6 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm">
                      {payments.map((payment) => (
                        <tr key={payment.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-3 px-6 text-left">
                            <div className="font-medium">{payment.transactionId}</div>
                          </td>
                          <td className="py-3 px-6 text-left">
                            {new Date(payment.paymentDate).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-6 text-left font-medium">
                            {payment.amount} DA
                          </td>
                          <td className="py-3 px-6 text-center">
                            {payment.paymentMethod}
                          </td>
                          <td className="py-3 px-6 text-right">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                              payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
