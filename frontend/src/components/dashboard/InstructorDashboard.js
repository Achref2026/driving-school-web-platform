import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const InstructorDashboard = () => {
  const { user } = useContext(AuthContext);
  const [instructor, setInstructor] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [students, setStudents] = useState([]);
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
      
      // Fetch instructor profile
      const instructorRes = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/instructors/user/${user.id}`,
        { headers }
      );
      setInstructor(instructorRes.data);
      
      // Fetch schedules
      const schedulesRes = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/schedules/instructor`,
        { headers }
      );
      setSchedules(schedulesRes.data);
      
      // Fetch students
      const studentsRes = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/instructors/students`,
        { headers }
      );
      setStudents(studentsRes.data);
      
      // Fetch exams
      const examsRes = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/exams/instructor`,
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
  
  // Get today's schedules
  const today = new Date().toISOString().split('T')[0];
  const todaySchedules = schedules.filter(schedule => schedule.date === today);
  
  // Get upcoming exams (within the next 7 days)
  const upcomingExams = exams.filter(exam => {
    const examDate = new Date(exam.date);
    const now = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(now.getDate() + 7);
    
    return examDate >= now && examDate <= sevenDaysLater;
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
  
  // If instructor data is not found
  if (!instructor) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        <p>Your instructor profile is not set up yet. Please contact your driving school manager.</p>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Instructor Dashboard</h1>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg shadow">
          <h3 className="font-semibold text-blue-800 mb-2">Students</h3>
          <div className="text-3xl font-bold">{students.length}</div>
          <div className="text-sm text-gray-500 mt-1">
            Currently teaching
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg shadow">
          <h3 className="font-semibold text-green-800 mb-2">Today's Sessions</h3>
          <div className="text-3xl font-bold">{todaySchedules.length}</div>
          <div className="text-sm text-gray-500 mt-1">
            {todaySchedules.filter(s => s.status === 'completed').length} completed
          </div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg shadow">
          <h3 className="font-semibold text-yellow-800 mb-2">Upcoming Exams</h3>
          <div className="text-3xl font-bold">{upcomingExams.length}</div>
          <div className="text-sm text-gray-500 mt-1">
            Next 7 days
          </div>
        </div>
      </div>
      
      {/* Today's Schedule */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Today's Schedule</h2>
        {todaySchedules.length > 0 ? (
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 text-left">Time</th>
                  <th className="py-2 px-4 text-left">Course</th>
                  <th className="py-2 px-4 text-left">Student</th>
                  <th className="py-2 px-4 text-left">Status</th>
                  <th className="py-2 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {todaySchedules
                  .sort((a, b) => {
                    return new Date(`2000-01-01T${a.startTime}`) - new Date(`2000-01-01T${b.startTime}`);
                  })
                  .map(schedule => (
                    <tr key={schedule.id}>
                      <td className="py-2 px-4">
                        {schedule.startTime} - {schedule.endTime}
                      </td>
                      <td className="py-2 px-4">
                        {schedule.Course.name}
                      </td>
                      <td className="py-2 px-4">
                        {schedule.Enrollment.User.firstName} {schedule.Enrollment.User.lastName}
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
                      <td className="py-2 px-4">
                        {schedule.status === 'scheduled' && (
                          <button
                            className="text-blue-800 hover:underline"
                            // This would be implemented with a modal or form
                            onClick={() => alert('Mark completed action would go here')}
                          >
                            Mark Complete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">No sessions scheduled for today.</p>
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
                  <th className="py-2 px-4 text-left">Student</th>
                  <th className="py-2 px-4 text-left">Status</th>
                  <th className="py-2 px-4 text-left">Actions</th>
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
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        exam.status === 'scheduled' ? 'bg-green-100 text-green-800' :
                        exam.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        exam.status === 'rescheduled' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {exam.status}
                      </span>
                    </td>
                    <td className="py-2 px-4">
                      {exam.status === 'scheduled' && (
                        <button
                          className="text-blue-800 hover:underline"
                          // This would be implemented with a modal or form
                          onClick={() => alert('Record result action would go here')}
                        >
                          Record Result
                        </button>
                      )}
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
      
      {/* Recent Students */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Students</h2>
        {students.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {students.slice(0, 4).map(student => (
              <div key={student.id} className="border rounded-lg overflow-hidden shadow-sm">
                <div className="p-4">
                  <h3 className="font-semibold">
                    {student.firstName} {student.lastName}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      student.gender === 'male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                    }`}>
                      {student.gender === 'male' ? 'Male' : 'Female'}
                    </span>
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                      {student.region}
                    </span>
                  </div>
                  <div className="mt-3">
                    <p className="text-gray-600">{student.email}</p>
                    <p className="text-gray-600">{student.phoneNumber}</p>
                  </div>
                  <div className="mt-3">
                    <span className="text-gray-600">Current Course:</span>
                    <span className="ml-2 font-semibold">{student.currentCourse}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">You don't have any students assigned yet.</p>
        )}
        
        {students.length > 4 && (
          <div className="mt-3">
            <Link to="/dashboard/students" className="text-blue-800 hover:underline">
              View all students →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorDashboard;