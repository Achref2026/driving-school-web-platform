import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [enrollments, setEnrollments] = useState([]);
  const [schedules, setSchedules] = useState([]);
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
      
      // Fetch enrollments
      const enrollmentsRes = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/enrollments/user`,
        { headers }
      );
      setEnrollments(enrollmentsRes.data);
      
      // Fetch schedules
      const schedulesRes = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/schedules/student`,
        { headers }
      );
      setSchedules(schedulesRes.data);
      
      // Fetch exams
      const examsRes = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/exams/student`,
        { headers }
      );
      setExams(examsRes.data);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load your dashboard data. Please try again later.');
      setLoading(false);
    }
  };
  
  // Get upcoming schedules and exams (within the next 7 days)
  const upcomingSchedules = schedules.filter(schedule => {
    const scheduleDate = new Date(schedule.date);
    const today = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(today.getDate() + 7);
    
    return scheduleDate >= today && scheduleDate <= sevenDaysLater;
  });
  
  const upcomingExams = exams.filter(exam => {
    const examDate = new Date(exam.date);
    const today = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(today.getDate() + 7);
    
    return examDate >= today && examDate <= sevenDaysLater;
  });
  
  // Get enrollments by status
  const pendingEnrollments = enrollments.filter(e => e.status === 'pending');
  const activeEnrollments = enrollments.filter(e => e.status === 'confirmed');
  const completedEnrollments = enrollments.filter(e => e.status === 'completed');
  
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
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Student Dashboard</h1>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg shadow">
          <h3 className="font-semibold text-blue-800 mb-2">Enrollments</h3>
          <div className="text-3xl font-bold">{enrollments.length}</div>
          <div className="text-sm text-gray-500 mt-1">
            {pendingEnrollments.length} pending, {activeEnrollments.length} active
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg shadow">
          <h3 className="font-semibold text-green-800 mb-2">Upcoming Sessions</h3>
          <div className="text-3xl font-bold">{upcomingSchedules.length}</div>
          <div className="text-sm text-gray-500 mt-1">
            In the next 7 days
          </div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg shadow">
          <h3 className="font-semibold text-yellow-800 mb-2">Upcoming Exams</h3>
          <div className="text-3xl font-bold">{upcomingExams.length}</div>
          <div className="text-sm text-gray-500 mt-1">
            In the next 7 days
          </div>
        </div>
      </div>
      
      {/* Upcoming Sessions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Upcoming Sessions</h2>
        {upcomingSchedules.length > 0 ? (
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 text-left">Date</th>
                  <th className="py-2 px-4 text-left">Time</th>
                  <th className="py-2 px-4 text-left">Course</th>
                  <th className="py-2 px-4 text-left">Instructor</th>
                  <th className="py-2 px-4 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {upcomingSchedules.map(schedule => (
                  <tr key={schedule.id}>
                    <td className="py-2 px-4">
                      {new Date(schedule.date).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-4">
                      {schedule.startTime} - {schedule.endTime}
                    </td>
                    <td className="py-2 px-4">
                      {schedule.Course.name}
                    </td>
                    <td className="py-2 px-4">
                      {schedule.Instructor.User.firstName} {schedule.Instructor.User.lastName}
                    </td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        schedule.status === 'scheduled' ? 'bg-green-100 text-green-800' :
                        schedule.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {schedule.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">No upcoming sessions scheduled.</p>
        )}
        
        <div className="mt-3">
          <Link to="/dashboard/schedule" className="text-blue-800 hover:underline">
            View full schedule →
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
      
      {/* Enrollments */}
      <div>
        <h2 className="text-xl font-semibold mb-4">My Courses</h2>
        {enrollments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enrollments.map(enrollment => (
              <div key={enrollment.id} className="border rounded-lg overflow-hidden shadow-sm">
                <div className={`p-4 ${
                  enrollment.Course.type === 'code' ? 'bg-blue-100' :
                  enrollment.Course.type === 'parking' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <h3 className="font-semibold">
                    {enrollment.Course.name}
                  </h3>
                  <span className="inline-block px-2 py-1 rounded-full text-xs uppercase font-bold mt-1 ${
                    enrollment.Course.type === 'code' ? 'bg-blue-700 text-white' :
                    enrollment.Course.type === 'parking' ? 'bg-green-700 text-white' : 'bg-red-700 text-white'
                  }">
                    {enrollment.Course.type}
                  </span>
                </div>
                
                <div className="p-4">
                  <div className="mb-3">
                    <span className="text-gray-600">School:</span>
                    <span className="ml-2 font-semibold">{enrollment.DrivingSchool.name}</span>
                  </div>
                  
                  <div className="mb-3">
                    <span className="text-gray-600">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      enrollment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      enrollment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      enrollment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {enrollment.status}
                    </span>
                  </div>
                  
                  {enrollment.startDate && (
                    <div className="mb-3">
                      <span className="text-gray-600">Start Date:</span>
                      <span className="ml-2">{new Date(enrollment.startDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  <div className="mb-3">
                    <span className="text-gray-600">Payment:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      enrollment.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                      enrollment.paymentStatus === 'refunded' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {enrollment.paymentStatus}
                    </span>
                  </div>
                  
                  {/* Course progress */}
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Progress:</h4>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-800 h-2.5 rounded-full" 
                        style={{ 
                          width: `${enrollment.codeCompleted && enrollment.parkingCompleted && enrollment.roadCompleted ? 100 :
                                   enrollment.codeCompleted && enrollment.parkingCompleted ? 66 :
                                   enrollment.codeCompleted ? 33 : 0}%` 
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <div>
                        <span className={enrollment.codeCompleted ? 'text-green-600' : 'text-gray-500'}>
                          Code
                        </span>
                      </div>
                      <div>
                        <span className={enrollment.parkingCompleted ? 'text-green-600' : 'text-gray-500'}>
                          Parking
                        </span>
                      </div>
                      <div>
                        <span className={enrollment.roadCompleted ? 'text-green-600' : 'text-gray-500'}>
                          Road
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-4">You are not enrolled in any courses yet.</p>
            <Link
              to="/schools"
              className="bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded"
            >
              Find a Driving School
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;