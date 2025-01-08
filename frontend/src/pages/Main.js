import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Main.css';

export default function Main() {
    const [Glasanjes, setGlasanjes] = useState([]);
    const [userEmail, setUserEmail] = useState('');
    const [userVotes, setUserVotes] = useState({});
    const [selectedVotes, setSelectedVotes] = useState({});
    const [hasVoted, setHasVoted] = useState({});
    const [loading, setLoading] = useState(true);
    const [expandedInfo, setExpandedInfo] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
    const [newGlasanje, setNewGlasanje] = useState({
        naslov: '',
        opis: '',
        datum_istece: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userEmailResponse, GlasanjesResponse] = await Promise.all([
                    axios.get('http://localhost:4000/glasanje/userEmail', { withCredentials: true }),
                    axios.get('http://localhost:4000/glasanje/Glasanjes'),
                ]);

                setUserEmail(userEmailResponse.data.email);
                setGlasanjes(GlasanjesResponse.data);

                if (userEmailResponse.data.email) {
                    const votes = {};
                    const votedGlasanjes = {};

                    for (let Glasanje of GlasanjesResponse.data) {
                        const response = await axios.get('http://localhost:4000/glasanje/userVote', {
                            params: { email: userEmailResponse.data.email, GlasanjeId: Glasanje.id },
                            withCredentials: true,
                        });

                        if (response.data.voted) {
                            votes[Glasanje.id] = response.data.vote;
                            votedGlasanjes[Glasanje.id] = true;
                        }
                    }

                    setUserVotes(votes);
                    setHasVoted(votedGlasanjes);
                }
            } catch (error) {
                console.error('Greška prilikom dohvaćanja podataka:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);


// Update voting logic to handle state correctly after vote submission
const handleVoteSubmit = async (GlasanjeId, vote) => {
    if (!userEmail) {
        alert('Morate biti prijavljeni da biste glasali');
        return;
    }

    try {
        const response = await axios.post(
            'http://localhost:4000/glasanje',
            { userId: userEmail, GlasanjeId, vote },
            { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
        );

        if (response.data.success) {
            // Update the specific Glasanje state after voting
            setGlasanjes((prevGlasanjes) =>
                prevGlasanjes.map((Glasanje) =>
                    Glasanje.id === GlasanjeId
                        ? {
                              ...Glasanje,
                              glasovanje_da: vote === 'da' ? Glasanje.glasovanje_da + 1 : Glasanje.glasovanje_da,
                              glasovanje_ne: vote === 'ne' ? Glasanje.glasovanje_ne + 1 : Glasanje.glasovanje_ne,
                          }
                        : Glasanje
                )
            );

            setUserVotes((prevVotes) => ({ ...prevVotes, [GlasanjeId]: vote }));
            setHasVoted((prevHasVoted) => ({ ...prevHasVoted, [GlasanjeId]: true }));
            setSelectedVotes((prevSelectedVotes) => ({ ...prevSelectedVotes, [GlasanjeId]: '' }));
        }
    } catch (error) {
        console.error('Greška prilikom slanja glasa:', error);
    }
};

    const handleRadioChange = (GlasanjeId, value) => {
        setSelectedVotes((prevSelectedVotes) => ({ ...prevSelectedVotes, [GlasanjeId]: value }));
    };

    const toggleInfo = (GlasanjeId) => {
        setExpandedInfo((prev) => ({ ...prev, [GlasanjeId]: !prev[GlasanjeId] }));
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewGlasanje((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddGlasanje = async (e) => {
        e.preventDefault();
    
        try {
            const response = await axios.post('http://localhost:4000/glasanje/dodavanjeGlasovanja', newGlasanje, {
                withCredentials: true,
            });
    
            if (response.data.success) {
                const newGlasanjeWithVotes = {
                    ...response.data.newGlasanje,
                    glasovanje_da: 0, // Initialize vote counts to 0
                    glasovanje_ne: 0,
                    datum_stvoreno: response.data.newGlasanje.datum_stvoreno || new Date().toISOString(), // Set current date if not provided
                };
    
                setGlasanjes((prev) => [...prev, newGlasanjeWithVotes]);
                setNewGlasanje({ naslov: '', opis: '', datum_istece: '' });
                closeModal();
            }
        } catch (error) {
            console.error('Greška prilikom dodavanja diskusije:', error);
        }
    };
    

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner">Učitavanje...</div>
            </div>
        );
    }

    return (
        <div className="main-container">
            <div className="Glasanje-list">
                {Glasanjes.map((Glasanje) => (
                    <div key={Glasanje.id} className="Glasanje-item">
                        <h3>{Glasanje.naslov}</h3>
                        <p><strong>Kreator:</strong> {Glasanje.kreator}</p>
                        <div className="DatumIme">
                            <p>Datum kreiranja: {new Date(Glasanje.datum_stvoreno).toLocaleDateString()}</p>
                            <p>Datum isteka: {new Date(Glasanje.datum_istece).toLocaleDateString()}</p>
                        </div>

                        <div className="voting-box">
                            <h4>Slažete li se?</h4>
                            {hasVoted[Glasanje.id] ? (
                                <div className="vote-results">
                                    <p>Vaš glas: {userVotes[Glasanje.id]}</p>
                                    <p>Da: {Glasanje.glasovanje_da}</p>
                                    <p>Ne: {Glasanje.glasovanje_ne}</p>
                                </div>
                            ) : (
                                <div className="radio-group">
                                    <label>
                                        <input
                                            type="radio"
                                            name={`vote_${Glasanje.id}`}
                                            value="da"
                                            checked={selectedVotes[Glasanje.id] === 'da'}
                                            onChange={() => handleRadioChange(Glasanje.id, 'da')}
                                            disabled={hasVoted[Glasanje.id]}
                                        />
                                        Da
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name={`vote_${Glasanje.id}`}
                                            value="ne"
                                            checked={selectedVotes[Glasanje.id] === 'ne'}
                                            onChange={() => handleRadioChange(Glasanje.id, 'ne')}
                                            disabled={hasVoted[Glasanje.id]}
                                        />
                                        Ne
                                    </label>
                                    <button
                                        className="submit-vote-button"
                                        onClick={() => handleVoteSubmit(Glasanje.id, selectedVotes[Glasanje.id])}
                                        disabled={!selectedVotes[Glasanje.id] || hasVoted[Glasanje.id]}
                                    >
                                        Pošaljite glas
                                    </button>
                                </div>
                            )}
                        </div>

                        <button
                            className="toggle-info-button"
                            onClick={() => toggleInfo(Glasanje.id)}
                        >
                            {expandedInfo[Glasanje.id] ? 'Sakrij dodatne informacije' : 'Prikaži dodatne informacije'}
                        </button>

                        {expandedInfo[Glasanje.id] && (
                            <div className="additional-info">
                                <p>Ovo su dodatne informacije o diskusiji: {Glasanje.opis || 'Nema dodatnih informacija.'}</p>
                            </div>
                        )}

                        <hr className="Glasanje-separator" />
                    </div>
                ))}
            </div>

            {/* Modal Trigger Button */}
            <button className="navigation-button" onClick={openModal}>+</button>
            <button className="archive-button">Arhiva</button>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-modal-button" onClick={closeModal}>&times;</button>
                        <h2>Dodaj novu diskusiju</h2>
                        <form onSubmit={handleAddGlasanje}>
                            <div className="form-group">
                                <label htmlFor="naslov">Naslov:</label>
                                <input
                                    type="text"
                                    id="naslov"
                                    name="naslov"
                                    value={newGlasanje.naslov}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="opis">Opis:</label>
                                <textarea
                                    id="opis"
                                    name="opis"
                                    value={newGlasanje.opis}
                                    onChange={handleInputChange}
                                    required
                                ></textarea>
                            </div>
                            <div className="form-group">
                                <label htmlFor="datum_istece">Datum isteka:</label>
                                <input
                                    type="date"
                                    id="datum_istece"
                                    name="datum_istece"
                                    value={newGlasanje.datum_istece}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <button type="submit" className="submit-form-button">Dodaj</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
