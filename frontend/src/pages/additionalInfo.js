import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdditionalSignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    building: '',
    apartmentNumber: ''
  });
  const [buildings, setBuildings] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch user data for initial form state
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:4000/signupAuth', {
          withCredentials: true,
        });
        const { imeKorisnika, prezimeKorisnika, email } = response.data.user;
        setFormData({
          firstName: imeKorisnika || '',
          lastName: prezimeKorisnika || '',
          email: email || '',
          building: '', // Default empty
          apartmentNumber: '' // Default empty
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    // Fetch building data for dropdown menu
    const fetchBuildingData = async () => {
      try {
        const response = await axios.get('http://localhost:4000/userInfo/buildings', {
          withCredentials: true,
        });
        setBuildings(response.data);
      } catch (err) {
        console.error("Error fetching building data:", err);
        setError('Failed to fetch building data. Please try again later.');
      }
    };

    fetchUserData();
    fetchBuildingData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:4000/signupAuth/additional-signup', formData, {
        withCredentials: true
      });

      // Log out the user after successful submission
      await axios.post('http://localhost:4000/logout', {}, {
        withCredentials: true
      });
      alert("Your data has been sent for review.");
      navigate('/main');  
    } catch (error) {
      console.error("Error during additional signup:", error);
    }
  };

  return (
    <div className="signup-form-container">
      <h2>Complete Your Sign-Up</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>First Name:</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Last Name:</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled
          />
        </div>
        <div className="form-group">
          <label>Building:</label>
          <select
            name="building"
            value={formData.building}
            onChange={handleChange}
            required
          >
            <option value="">Select Building</option>
            {buildings.map((building) => (
              <option value={building.id} key={building.id}>
                {building.naziv_zgrade}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Apartment Number:</label>
          <input
            type="text"
            name="apartmentNumber"
            value={formData.apartmentNumber}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="submit-button">Complete Signup</button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default AdditionalSignup;
