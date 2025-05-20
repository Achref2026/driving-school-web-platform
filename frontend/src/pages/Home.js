import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-blue-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Start Your Journey to Becoming a Safe Driver
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Find the best driving schools in your area, compare prices and ratings, and enroll in courses to get your driving license.
          </p>
          <Link
            to="/schools"
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold px-8 py-4 rounded-full text-lg inline-block transition duration-300"
          >
            Find Driving Schools
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-blue-100 text-blue-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">1</div>
              <h3 className="text-xl font-semibold mb-3">Find a School</h3>
              <p className="text-gray-600">
                Browse through our extensive list of driving schools in your region and compare prices, ratings, and features.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-blue-100 text-blue-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">2</div>
              <h3 className="text-xl font-semibold mb-3">Enroll in Courses</h3>
              <p className="text-gray-600">
                Register for the driving courses you need - code theory, parking skills, and road practice - all in one place.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-blue-100 text-blue-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">3</div>
              <h3 className="text-xl font-semibold mb-3">Get Your License</h3>
              <p className="text-gray-600">
                Complete your courses, pass your exams, and get your driving license with support every step of the way.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Course Types Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Courses</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="h-48 bg-blue-200 flex items-center justify-center">
                <h3 className="text-2xl font-bold text-blue-800">Code Course</h3>
              </div>
              <div className="p-6">
                <p className="mb-4">
                  Learn all the traffic rules, road signs, and safety guidelines you need to know to become a responsible driver.
                </p>
                <ul className="list-disc pl-5 mb-4 text-gray-700">
                  <li>Road signs and markings</li>
                  <li>Traffic rules and regulations</li>
                  <li>Right of way and priorities</li>
                  <li>Safety procedures</li>
                </ul>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="h-48 bg-green-200 flex items-center justify-center">
                <h3 className="text-2xl font-bold text-green-800">Parking Course</h3>
              </div>
              <div className="p-6">
                <p className="mb-4">
                  Master the essential parking techniques that will help you navigate tight spaces and pass your practical exam.
                </p>
                <ul className="list-disc pl-5 mb-4 text-gray-700">
                  <li>Parallel parking</li>
                  <li>Perpendicular parking</li>
                  <li>Angle parking</li>
                  <li>Parking on hills</li>
                </ul>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="h-48 bg-red-200 flex items-center justify-center">
                <h3 className="text-2xl font-bold text-red-800">Road Course</h3>
              </div>
              <div className="p-6">
                <p className="mb-4">
                  Gain real-world driving experience under the supervision of professional instructors in various traffic conditions.
                </p>
                <ul className="list-disc pl-5 mb-4 text-gray-700">
                  <li>Urban driving</li>
                  <li>Highway driving</li>
                  <li>Night driving</li>
                  <li>Defensive driving techniques</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join thousands of students who have successfully obtained their driving license through our platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/schools"
              className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold px-8 py-4 rounded-full text-lg inline-block transition duration-300"
            >
              Find Driving Schools
            </Link>
            <Link
              to="/school-register"
              className="bg-white hover:bg-gray-100 text-blue-800 font-bold px-8 py-4 rounded-full text-lg inline-block transition duration-300"
            >
              Register Your School
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;