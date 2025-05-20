import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const SchoolRegister = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    region: '',
    phoneNumber: '',
    email: '',
    description: '',
    licenseNumber: '',
    logoUrl: '',
    hasFemaleInstructors: false,
    hasMaleInstructors: false
  });
  
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Algerian regions (wilayas)
  const regions = [
    'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra',
    'Béchar', 'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret',
    'Tizi Ouzou', 'Alger', 'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès',
    'Annaba', 'Guelma', 'Constantine', 'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara',
    'Ouargla', 'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou Arréridj', 'Boumerdès',
    'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued', 'Khenchela', 'Souk Ahras',
    'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent', 'Ghardaïa', 'Relizane',
    'El M\'Ghair', 'El Meniaa', 'Ouled Djellal', 'Bordj Baji Mokhtar', 'Béni Abbès',
    'Timimoun', 'Touggourt', 'Djanet', 'In Salah', 'In Guezzam'
  ];
  
  const { 
    name, address, region, phoneNumber, email, description, 
    licenseNumber, logoUrl, hasFemaleInstructors, hasMaleInstructors 
  } = formData;
  
  const onChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };
  
  const onSubmit = async e => {
    e.preventDefault();
    
    setIsSubmitting(true);
    setFormError('');
    
    // Validate form
    if (!name || !address || !region || !phoneNumber || !email || !licenseNumber) {
      setFormError('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/driving-schools`,
        formData,
        { headers }
      );
      
      setIsSuccess(true);
      
      // If user is logged in, set them as the manager
      if (user) {
        await axios.put(
          `${process.env.REACT_APP_BACKEND_URL}/api/driving-schools/${res.data.id}/manager`,
          { userId: user.id },
          { headers }
        );
      }
      
      // Reset form
      setFormData({
        name: '',
        address: '',
        region: '',
        phoneNumber: '',
        email: '',
        description: '',
        licenseNumber: '',
        logoUrl: '',
        hasFemaleInstructors: false,
        hasMaleInstructors: false
      });
      
      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
      
    } catch (err) {
      console.error('Error registering school:', err);
      setFormError(err.response?.data?.error || 'Failed to register driving school');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Register Your Driving School</h1>
      
      {isSuccess ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Registration Successful!</p>
          <p>Your driving school has been registered. You will be redirected to your dashboard.</p>
        </div>
      ) : (
        <>
          {formError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {formError}
            </div>
          )}
          
          {!user && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
              <p className="font-bold">Note:</p>
              <p>You are not logged in. Please login or create an account to become the manager of this driving school.</p>
            </div>
          )}
          
          <form onSubmit={onSubmit} className="bg-white shadow-lg rounded-lg p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">Basic Information</h2>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  School Name *
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="name"
                  type="text"
                  name="name"
                  value={name}
                  onChange={onChange}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                  Email Address *
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="email"
                  type="email"
                  name="email"
                  value={email}
                  onChange={onChange}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phoneNumber">
                  Phone Number *
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="phoneNumber"
                  type="text"
                  name="phoneNumber"
                  value={phoneNumber}
                  onChange={onChange}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="licenseNumber">
                  License Number *
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="licenseNumber"
                  type="text"
                  name="licenseNumber"
                  value={licenseNumber}
                  onChange={onChange}
                  required
                />
              </div>
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">Location</h2>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
                  Address *
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="address"
                  type="text"
                  name="address"
                  value={address}
                  onChange={onChange}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="region">
                  Region (Wilaya) *
                </label>
                <select
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="region"
                  name="region"
                  value={region}
                  onChange={onChange}
                  required
                >
                  <option value="">Select region</option>
                  {regions.map((region, index) => (
                    <option key={index} value={region}>{region}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">Additional Information</h2>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                  Description
                </label>
                <textarea
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="description"
                  name="description"
                  value={description}
                  onChange={onChange}
                  rows="4"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="logoUrl">
                  Logo URL
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="logoUrl"
                  type="text"
                  name="logoUrl"
                  value={logoUrl}
                  onChange={onChange}
                  placeholder="https://example.com/logo.png"
                />
              </div>
              
              <div className="mb-4">
                <p className="block text-gray-700 text-sm font-bold mb-2">Instructor Types</p>
                
                <div className="flex items-center mb-2">
                  <input
                    className="mr-2"
                    id="hasMaleInstructors"
                    type="checkbox"
                    name="hasMaleInstructors"
                    checked={hasMaleInstructors}
                    onChange={onChange}
                  />
                  <label className="text-gray-700" htmlFor="hasMaleInstructors">
                    Male Instructors
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    className="mr-2"
                    id="hasFemaleInstructors"
                    type="checkbox"
                    name="hasFemaleInstructors"
                    checked={hasFemaleInstructors}
                    onChange={onChange}
                  />
                  <label className="text-gray-700" htmlFor="hasFemaleInstructors">
                    Female Instructors
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-6">
              <button
                className="bg-blue-800 hover:bg-blue-900 text-white font-bold py-3 px-6 rounded focus:outline-none focus:shadow-outline w-full"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Registering...' : 'Register Driving School'}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default SchoolRegister;