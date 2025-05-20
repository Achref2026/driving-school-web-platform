import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const SchoolList = () => {
  const [schools, setSchools] = useState([]);
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState('');
  
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
  
  // Sort options
  const [sortOption, setSortOption] = useState('rating');
  
  useEffect(() => {
    fetchSchools();
  }, []);
  
  const fetchSchools = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/driving-schools`);
      setSchools(res.data);
      setFilteredSchools(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching schools:', err);
      setError('Failed to load driving schools. Please try again later.');
      setLoading(false);
    }
  };
  
  // Filter schools by region
  useEffect(() => {
    if (selectedRegion) {
      const filtered = schools.filter(school => school.region === selectedRegion);
      setFilteredSchools(filtered);
    } else {
      setFilteredSchools(schools);
    }
  }, [selectedRegion, schools]);
  
  // Sort schools
  useEffect(() => {
    const sorted = [...filteredSchools];
    
    if (sortOption === 'rating') {
      sorted.sort((a, b) => b.rating - a.rating);
    } else if (sortOption === 'price-low') {
      // Sort by the lowest price course
      sorted.sort((a, b) => {
        const aMinPrice = a.minPrice || 0;
        const bMinPrice = b.minPrice || 0;
        return aMinPrice - bMinPrice;
      });
    } else if (sortOption === 'price-high') {
      // Sort by the highest price course
      sorted.sort((a, b) => {
        const aMaxPrice = a.maxPrice || 0;
        const bMaxPrice = b.maxPrice || 0;
        return bMaxPrice - aMaxPrice;
      });
    }
    
    setFilteredSchools(sorted);
  }, [sortOption]);
  
  // Handle region change
  const handleRegionChange = (e) => {
    setSelectedRegion(e.target.value);
  };
  
  // Handle sort change
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };
  
  // Handle get location
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Here you would normally use reverse geocoding to get the region
          // For now, we'll just alert that we got the position
          alert("Location accessed! In a real app, we would now show schools in your region.");
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to access your location. Please select your region manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser. Please select your region manually.");
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
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button
          className="bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded"
          onClick={fetchSchools}
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Find Driving Schools</h1>
      
      {/* Filters */}
      <div className="bg-gray-100 p-4 rounded-lg mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="region">
              Select Region (Wilaya)
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="region"
              value={selectedRegion}
              onChange={handleRegionChange}
            >
              <option value="">All Regions</option>
              {regions.map((region, index) => (
                <option key={index} value={region}>{region}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="sort">
              Sort By
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="sort"
              value={sortOption}
              onChange={handleSortChange}
            >
              <option value="rating">Highest Rated</option>
              <option value="price-low">Lowest Price</option>
              <option value="price-high">Highest Price</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              className="bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded w-full"
              onClick={handleGetLocation}
            >
              Use My Location
            </button>
          </div>
        </div>
      </div>
      
      {/* Schools List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSchools.length > 0 ? (
          filteredSchools.map(school => (
            <div key={school.id} className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                {school.logoUrl ? (
                  <img 
                    src={school.logoUrl} 
                    alt={`${school.name} logo`} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-gray-500 text-2xl font-bold">{school.name.charAt(0)}</div>
                )}
              </div>
              
              <div className="p-4">
                <h2 className="text-xl font-bold mb-2">{school.name}</h2>
                
                <div className="mb-2 flex items-center">
                  <span className="text-yellow-500 mr-1">★</span>
                  <span>{school.rating.toFixed(1)}</span>
                </div>
                
                <p className="text-gray-700 mb-4">{school.address}, {school.region}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
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
                
                <Link
                  to={`/schools/${school.id}`}
                  className="block w-full text-center bg-blue-800 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-700 text-lg">No driving schools found in this region. Please select another region.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolList;