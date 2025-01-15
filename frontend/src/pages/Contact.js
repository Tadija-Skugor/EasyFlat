import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Contact.css'
function Contact() {
  const [buildings, setBuildings] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:4000/zgrade', {
      headers: {
        'Authorization': 'ApiKey your_api_key_here', 
        'Content-Type': 'application/json', 
      },
      withCredentials: true,  
    })
    .then((response) => {
      console.log('Fetched data:', response.data); 
      setBuildings(response.data);  
    })
    .catch((error) => {
      console.error('Error fetching buildings:', error);
    });
  }, []);

  return (
    <div>
      <h1>Buildings</h1>
      <div className="building-list">
        {Array.isArray(buildings) && buildings.length > 0 ? (
          buildings.map((building) => (
            <div key={building.id} className="building-item">
              <h2>{building.naziv_zgrade}</h2>
              <img src={building.slika_link} alt={building.naziv_zgrade} width="300" />
            </div>
          ))
        ) : (
          <p>No buildings available</p>
        )}
      </div>
    </div>
  );
}

export default Contact;
