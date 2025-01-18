import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Contact.css';

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
      <h1>Zgrade</h1>
      <div className="building-list">
        {Array.isArray(buildings) && buildings.length > 0 ? (
          buildings.map((building) => (
            <div key={building.zgrada_id} className="building-item">
              <div className='building-picture'>
                <img src={building.slika_link} alt={building.naziv_zgrade} width="300" />
              </div>
              <div className='building - podaci'>
                <h2>{building.naziv_zgrade}</h2>
                {building.korisnici && building.korisnici.length > 0 ? (
                  <div className="users-list">
                    <p>Stanari:</p>
                    <ul>
                      {building.korisnici.map((user, index) => (
                        <li key={index}>{user}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p>No users in this building</p>
                )}
              </div>
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
