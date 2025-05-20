import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SchoolList from './pages/SchoolList';
import SchoolDetail from './pages/SchoolDetail';
import SchoolRegister from './pages/SchoolRegister';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import Enrollment from './pages/Enrollment';

// Context
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/routing/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/schools" element={<SchoolList />} />
              <Route path="/driving-schools/:id" element={<SchoolDetail />} />
              <Route 
                path="/driving-schools/:id/enroll" 
                element={
                  <PrivateRoute>
                    <Enrollment />
                  </PrivateRoute>
                } 
              />
              <Route path="/school-register" element={<SchoolRegister />} />
              <Route 
                path="/dashboard/*" 
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
