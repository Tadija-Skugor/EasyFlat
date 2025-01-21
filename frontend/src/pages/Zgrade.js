import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Zgrade.css';

function Contact() {
  const [buildings, setBuildings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editBuilding, setEditBuilding] = useState(null);
  const [newBuilding, setNewBuilding] = useState({
    id: '',
    naziv_zgrade: '',
    slika_link: ''
  });
  const [userEmail, setUserEmail] = useState(null);
  useEffect(() => {
   const fetchData = async () => {
     try {
       const [userEmailResponse, buildingsResponse] = await Promise.all([
         axios.get('http://localhost:4000/zgradeInfo/userEmail', { withCredentials: true }),
         axios.get('http://localhost:4000/zgrade', { withCredentials: true }),
       ]);
 
       setUserEmail(userEmailResponse.data.email);
       console.log(userEmailResponse.data.email);
       setBuildings(buildingsResponse.data);
     } catch (error) {
       console.error('Error fetching data:', error.response ? error.response.data : error.message);
     }
   };
 
   fetchData();
 }, []);
 

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBuilding({ ...newBuilding, [name]: value });
    if (isEditing) {
      setEditBuilding({ ...editBuilding, [name]: value });
    }
  };

  const handleSave = () => {
    if (!newBuilding.naziv_zgrade || !newBuilding.slika_link) {
      alert('Please fill out all fields.');
      return;
    }

    axios.post('http://localhost:4000/zgrade', newBuilding, {
      withCredentials: true,
    })
    .then(() => {
      setBuildings([...buildings, newBuilding]);
      setNewBuilding({ id: '', naziv_zgrade: '', slika_link: '' });
      setShowModal(false);
    })
    .catch((error) => {
      console.error('Error adding building:', error.message);
    });
  };

  const handleEditSave = () => {
    console.log('Edit Building:', editBuilding);
  

  
    axios.put(`http://localhost:4000/zgrade/${editBuilding.zgrada_id}`, editBuilding, {
      withCredentials: true,
    })
    .then(() => {
      setBuildings((prevBuildings) =>
        prevBuildings.map((building) =>
          building.zgrada_id === editBuilding.id ? editBuilding : building
        )
      );
      setEditBuilding(null);
      setShowModal(false);
      setIsEditing(false);
      window.location.reload();
    })
    .catch((error) => {
      console.error('Error updating building:', error.message);
    });
  };
  
  

  const handleCancel = () => {
    setNewBuilding({ id: '', naziv_zgrade: '', slika_link: '' });
    setEditBuilding(null);
    setShowModal(false);
    setIsEditing(false);
  };

  return (
    <div>
      <div className='contact-header'>
        <h1>Zgrade</h1>
        {userEmail === 'easyflatprogi@gmail.com' && (
          <button
            onClick={() => {
              setShowModal(true);
              setIsEditing(false);
            }}
            className="add-building-button"
          >
            Nova zgrada
          </button>
        )}
      </div>
      <div className="building-list">
  {Array.isArray(buildings) && buildings.length > 0 ? (
    buildings
      .sort((a, b) => a.naziv_zgrade.localeCompare(b.naziv_zgrade))
      .map((building) => {
        const isSuvlasnik = Array.isArray(building.korisnici) && 
        building.korisnici.some(
          (user) => user.email === userEmail && user.suvlasnik
        );
      

        return (
          <div key={building.zgrada_id} className="building-item">
            <div className="building-picture">
              <img src={building.slika_link} alt={building.naziv_zgrade} width="300" />
            </div>
            <div className="building-podaci">
              <div className="building-naslov-gumb">
                <h2>{building.naziv_zgrade}</h2>
                {(isSuvlasnik || userEmail === 'easyflatprogi@gmail.com') && (
                  <button
                    onClick={() => {
                      setEditBuilding(building);
                      setShowModal(true);
                      setIsEditing(true);
                    }}
                    className="edit-building-button"
                  >
                    Uredi
                  </button>
                )}
              </div>
              {building.korisnici && building.korisnici.length > 0 ? (
                <ul>
                  {building.korisnici.map((user, index) => (
                    <li
                      key={index}
                      style={{ fontWeight: user.suvlasnik ? 'bold' : 'normal' }}
                    >
                      {`${user.ime} ${user.prezime} (${user.email})`}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Nema korisnika u ovoj zgradi.</p>
              )}
            </div>
          </div>
        );
      })
  ) : (
    <p>Nema dohvaćenih zgrada</p>
  )}
</div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{isEditing ? 'Uređivanje' : 'Dodavanje nove zgrade'}</h2>
            {!isEditing && (
              <label>
                ID:
                <input
                  type="text"
                  name="id"
                  value={newBuilding.id}
                  onChange={handleInputChange}
                />
              </label>
            )}
            <label>
              Naziv zgrade:
              <input
                type="text"
                name="naziv_zgrade"
                value={isEditing ? editBuilding.naziv_zgrade : newBuilding.naziv_zgrade}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Slika link:
              <input
                type="text"
                name="slika_link"
                value={isEditing ? editBuilding.slika_link : newBuilding.slika_link}
                onChange={handleInputChange}
              />
            </label>
            <div className="modal-actions">
              <button
                onClick={isEditing ? handleEditSave : handleSave}
                className="save-button"
              >
                Spremi
              </button>
              <button onClick={handleCancel} className="cancel-button">
                Odustani
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Contact;
