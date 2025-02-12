import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userEmailResponse, buildingsResponse] = await Promise.all([
          axios.get('https://be30c39fc6db.ngrok.app/zgradeInfo/userEmail', { withCredentials: true }),
          axios.get('https://be30c39fc6db.ngrok.app/zgrade', { withCredentials: true }),
        ]);

        setUserEmail(userEmailResponse.data.email);
        console.log(userEmailResponse.data.email);
        setBuildings(buildingsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error.response ? error.response.data : error.message);
      } finally {
        setIsLoading(false); 
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

    axios.post('https://be30c39fc6db.ngrok.app/zgrade', newBuilding, {
      withCredentials: true,
    })
      .then(() => {
        setBuildings([...buildings, newBuilding]);
        setNewBuilding({ id: '', naziv_zgrade: '', slika_link: '' });
        setShowModal(false);
      })
      .catch((error) => {
        console.error('Error adding building:', error.message);
        alert('Pokušavate dodati zgradu sa postojećim zgrada_id. Pokušajte ponovo!');
      });
  };

  const handleEditSave = () => {
    console.log('Edit Building:', editBuilding);

    axios.put(`https://be30c39fc6db.ngrok.app/zgrade/${editBuilding.zgrada_id}`, editBuilding, {
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

  if (isLoading) {
    return <div className="loading">Učitavanje podataka...</div>;
  }

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
              console.log("Link za zgradu je: ", building.slika_link);
              return (
                <div key={building.zgrada_id} className="building-item">
                  <div className="building-picture">
                    <img src={building.slika_link} alt={building.naziv_zgrade} />
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
                        {building.korisnici
                          .filter((user) => user.aktivan)
                          .filter((user) => user.email !== "easyflatprogi@gmail.com")
                          .map((user, index) => (
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
