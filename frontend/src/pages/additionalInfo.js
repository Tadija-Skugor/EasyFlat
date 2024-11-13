import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdditionalSignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    apartmentNumber: ''
  });
  const [selectData, setSelectData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Dohvati podatke korisnika za inicijalno stanje
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
          apartmentNumber: ''  // Inicijalno ostavi broj stana prazan
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    // Dohvati listu stanova za dropdown meni
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:4000/users', {
          withCredentials: true,
        });
        setSelectData(response.data);
      } catch (err) {
        console.error("Error fetching apartment data:", err);
        setError('Failed to fetch apartment data. Please try again later.');
      }
    };

    fetchUserData();
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSelectChange = (e) => {
    setFormData((prevData) => ({ ...prevData, apartmentNumber: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:4000/signupAuth/additional-signup', formData, {
        withCredentials: true
      });

      // Odjavi se i obavjesti korisnika
      await axios.post('http://localhost:4000/logout', {}, {
        withCredentials: true
      });
      alert("Your data has been sent for review.");
      navigate('/home');
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
          <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Last Name:</label>
          <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required disabled/>
        </div>
        <div className="form-group">
          <label>Apartment Number:</label>
          <select value={formData.apartmentNumber} onChange={handleSelectChange} required>
            <option value="">Select Apartment</option>
            {selectData.map((item) => (
              <option value={item.stan_id} key={item.stan_id}>
                {item.stan_id}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="submit-button">Complete Signup</button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default AdditionalSignup;
