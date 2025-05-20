import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const ManagerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [school, setSchool] = useState(null);
  const [instructors, setInstructors] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Set up headers
      const headers = { 
        Authorization: `Bearer ${localStorage.getItem('token')}` 
      };
      
      // Fetch manager's driving school
      const schoolRes = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/driving-schools/manager`,
        { headers }
      );
      setSchool(schoolRes.data);
      
      if (schoolRes.data) {
        const schoolId = schoolRes.data.id;
        
        // Fetch instructors
        const instructorsRes = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/instructors/school/${schoolId}`,
          { headers }
        );
        setInstructors(instructorsRes.data);
        
        // Fetch enrollments
        const enrollmentsRes = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/enrollments/school/${schoolId}`,
          { headers }
        );
        setEnrollments(enrollmentsRes.data);
        
        // Fetch courses
        const coursesRes = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/courses/school/${schoolId}`,
          { headers }
        );
        setCourses(coursesRes.data);
        
        // Fetch exams
        const examsRes = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/exams/school/${schoolId}`,
          { headers }
        );
        setExams(examsRes.data);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load your dashboard data. Please try again later.');
      setLoading(false);
    }
  };
  
  // Get pending enrollments that need confirmation
  const pendingEnrollments = enrollments.filter(e => e.status === 'pending');
  
  // Get upcoming exams (within the next 7 days)
  const upcomingExams = exams.filter(exam => {
    const examDate = new Date(exam.date);
    const now = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(now.getDate() + 7);
    
    return examDate >= now && examDate <= sevenDaysLater;
  });
  
  // Helper function to confirm enrollment
  const confirmEnrollment = async (id) => {
    try {
      const headers = { 
        Authorization: `Bearer ${localStorage.getItem('token')}` 
      };
      
      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/enrollments/${id}/confirm`,
        {},
        { headers }
      );
      
      // Refresh enrollments
      fetchData();
    } catch (err) {
      console.error('Error confirming enrollment:', err);
      alert('Failed to confirm enrollment. Please try again.');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-800"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
        <button
          className="ml-4 underline"
          onClick={fetchData}
        >
          Try Again
        </button>
      </div>
    );
  }
  
  // If driving school is not found
  if (!school) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
        <p className="mb-3">You haven't registered a driving school yet or are not associated with one.</p>
        <Link
          to="/school-register"
          className="bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded"
        >
          Register a Driving School
        </Link>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manager Dashboard</h1>
      
      {/* School Info Card */}
      <div className="bg-white border rounded-lg shadow-sm p-4 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold">{school.name}</h2>
            <p className="text-gray-600">{school.address}, {school.region}</p>
          </div>
          <div className="mt-3 md:mt-0">
            <Link
              to="/dashboard/school"
              className="inline-block bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded"
            >
              Manage School
            </Link>
          </div>
        </div>
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg shadow">
          <h3 className="font-semibold text-blue-800 mb-2">Instructors</h3>
          <div className="text-3xl font-bold">{instructors.length}</div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg shadow">
          <h3 className="font-semibold text-green-800 mb-2">Courses</h3>
          <div className="text-3xl font-bold">{courses.length}</div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg shadow">
          <h3 className="font-semibold text-yellow-800 mb-2">Enrollments</h3>
          <div className="text-3xl font-bold">{enrollments.length}</div>
          <div className="text-sm text-gray-500 mt-1">
            {pendingEnrollments.length} pending
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg shadow">
          <h3 className="font-semibold text-purple-800 mb-2">Upcoming Exams</h3>
          <div className="text-3xl font-bold">{upcomingExams.length}</div>
        </div>
      </div>
      
      {/* Pending Enrollments */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Pending Enrollments</h2>
        {pendingEnrollments.length > 0 ? (
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 text-left">Student</th>
                  <th className="py-2 px-4 text-left">Course</th>
                  <th className="py-2 px-4 text-left">Date</th>
                  <th className="py-2 px-4 text-left">Payment</th>
                  <th className="py-2 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pendingEnrollments.map(enrollment => (
                  <tr key={enrollment.id}>
                    <td className="py-2 px-4">
                      {enrollment.User.firstName} {enrollment.User.lastName}
                    </td>
                    <td className="py-2 px-4">
                      {enrollment.Course.name}
                    </td>
                    <td className="py-2 px-4">
                      {new Date(enrollment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        enrollment.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                        enrollment.paymentStatus === 'refunded' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {enrollment.paymentStatus}
                      </span>
                    </td>
                    <td className="py-2 px-4">
                      <button
                        className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-sm mr-2"
                        onClick={() => confirmEnrollment(enrollment.id)}
                      >
                        Confirm
                      </button>
                      <button
                        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm"
                        onClick={() => alert('Reject action would go here')}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">No pending enrollments.</p>
        )}
        
        <div className="mt-3">
          <Link to="/dashboard/enrollments" className="text-blue-800 hover:underline">
            View all enrollments →
          </Link>
        </div>
      </div>
      
      {/* Upcoming Exams */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Upcoming Exams</h2>
        {upcomingExams.length > 0 ? (
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 text-left">Date</th>
                  <th className="py-2 px-4 text-left">Course</th>
                  <th className="py-2 px-4 text-left">Student</th>
                  <th className="py-2 px-4 text-left">Instructor</th>
                  <th className="py-2 px-4 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {upcomingExams.map(exam => (
                  <tr key={exam.id}>
                    <td className="py-2 px-4">
                      {new Date(exam.date).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-4">
                      {exam.Course.name}
                    </td>
                    <td className="py-2 px-4">
                      {exam.Enrollment.User.firstName} {exam.Enrollment.User.lastName}
                    </td>
                    <td className="py-2 px-4">
                      {exam.Instructor.User.firstName} {exam.Instructor.User.lastName}
                    </td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        exam.status === 'scheduled' ? 'bg-green-100 text-green-800' :
                        exam.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        exam.status === 'rescheduled' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {exam.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">No upcoming exams scheduled.</p>
        )}
        
        <div className="mt-3">
          <Link to="/dashboard/exams" className="text-blue-800 hover:underline">
            View all exams →
          </Link>
        </div>
      </div>
      
      {/* Instructors */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Instructors</h2>
        {instructors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {instructors.map(instructor => (
              <div key={instructor.id} className="border rounded-lg overflow-hidden shadow-sm">
                <div className="p-4">
                  <h3 className="font-semibold">
                    {instructor.User.firstName} {instructor.User.lastName}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      instructor.User.gender === 'male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
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
                    <div className="mt-2 flex items-center">
                      <span className="text-yellow-500 mr-1">★</span>
                      <span>{instructor.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <p className="text-gray-600 mb-4">No instructors registered yet.</p>
            <Link
              to="/dashboard/instructors"
              className="bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded"
            >
              Add Instructors
            </Link>
          </div>
        )}
        
        {instructors.length > 0 && (
          <div className="mt-3">
            <Link to="/dashboard/instructors" className="text-blue-800 hover:underline">
              Manage instructors →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;