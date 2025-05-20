import React from 'react';
import { useParams } from 'react-router-dom';
import DrivingSchoolDetails from '../components/DrivingSchoolDetails';

const SchoolDetail = () => {
  const { id } = useParams();
  
  return <DrivingSchoolDetails />;
};

export default SchoolDetail;
