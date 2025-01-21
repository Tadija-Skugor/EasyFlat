import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Contact.css';

function Contact() {
  const [buildings, setBuildings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newBuilding, setNewBuilding] = useState({
    id: '',
    naziv_zgrade: '',
    slika_link: ''
  });

  useEffect(() => {
    console.log('Fetching buildings...');
    axios.get('http://localhost:4000/zgrade', {
      withCredentials: true,
    })
    .then((response) => {
      console.log('Buildings fetched successfully:', response.data);
      setBuildings(response.data);
    })
    .catch((error) => {
      console.error('Error fetching buildings:', error.message);
    });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input changed: ${name} = ${value}`);
    setNewBuilding({ ...newBuilding, [name]: value });
  };

  const handleSave = () => {
    console.log('Save button clicked:', newBuilding);
    if (!newBuilding.id || !newBuilding.naziv_zgrade || !newBuilding.slika_link) {
      alert('Please fill out all fields.');
      console.log('Missing fields:', newBuilding);
      return;
    }

    axios.post('http://localhost:4000/zgrade', newBuilding, {
      withCredentials: true,
    })
    .then((response) => {
      console.log('Building added successfully:', response.data);
      setBuildings([...buildings, newBuilding]);
      setNewBuilding({ id: '', naziv_zgrade: '', slika_link: '' });
      setShowModal(false);
    })
    .catch((error) => {
      console.error('Error adding building:', error.message);
    });
  };

  const handleCancel = () => {
    console.log('Cancel button clicked');
    setNewBuilding({ id: '', naziv_zgrade: '', slika_link: '' });
    setShowModal(false);
  };

  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>Zgrade</h1>
      <button onClick={() => { console.log('Add New Building button clicked'); setShowModal(true); }} className="add-building-button">
        Add New Building
      </button>
      <div className="building-list">
        {Array.isArray(buildings) && buildings.length > 0 ? (
          buildings.map((building) => (
            <div key={building.zgrada_id} className="building-item">
              <div className="building-picture">
                <img src={building.slika_link} alt={building.naziv_zgrade} width="300" />
              </div>
              <div className="building-podaci">
                <h2>{building.naziv_zgrade}</h2>
                {building.korisnici && building.korisnici.length > 0 ? (
                  <ul>
                    {building.korisnici.map((user, index) => (
                      <li key={index} style={{ fontWeight: user.suvlasnik ? 'bold' : 'normal' }}>
                        {`${user.ime} ${user.prezime} (${user.email})`}
                      </li>
                    ))}
                  </ul>

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

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add New Building</h2>
            <label>
              ID:
              <input
                type="text"
                name="id"
                value={newBuilding.id}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Naziv zgrade:
              <input
                type="text"
                name="naziv_zgrade"
                value={newBuilding.naziv_zgrade}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Slika link:
              <input
                type="text"
                name="slika_link"
                value={newBuilding.slika_link}
                onChange={handleInputChange}
              />
            </label>
            <div className="modal-actions">
              <button onClick={handleSave} className="save-button">Save</button>
              <button onClick={handleCancel} className="cancel-button">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Contact;
