import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './KorisnikInfo.css';

function UserDetails({
    info,
    onEdit,
    onSave,
    onCancel,
    editing,
    setEditingField,
}) {
    return (
        <div id="user-details">
            <div className="user-picture">
                <img src={info.slika} alt="Profile" />
            </div>
            <div className="user-info">
                <table>
                    <tbody>
                        <tr>
                            <th>Ime i Prezime</th>
                            <td>
                                {editing ? (
                                    <div className="inputs_form">
                                        <input
                                            value={info.ime}
                                            onChange={(e) => setEditingField('ime', e.target.value)}
                                            className="editing_input"
                                        />
                                        <input
                                            value={info.prezime}
                                            onChange={(e) => setEditingField('prezime', e.target.value)}
                                            className="editing_input"
                                        />
                                    </div>
                                ) : (
                                    <span>{info.ime} {info.prezime}</span>
                                )}
                            </td>
                        </tr>
                        <tr>
                            <th>Status</th>
                            <td>{info.status}</td>
                        </tr>
                        <tr>
                            <th>E-pošta</th>
                            <td>{info.email}</td>
                        </tr>
                        <tr>
                            <th>Broj stana</th>
                            <td>{info.stanBr}</td>
                        </tr>
                    </tbody>
                </table>

                <div className="button_row">
                    {editing ? (
                        <>
                            <button onClick={onSave}>Spremi</button>
                            <button onClick={onCancel}>Odustani</button>
                        </>
                    ) : (
                        <button onClick={onEdit}>Uredi</button>
                    )}
                </div>
            </div>
        </div>
    );
}

function AdminMessage({ inactiveUsers, activeUsers, onActivateUser, onDeactivateUser }) {
    return (
        <div className="admin-message">
            <p className="admin-message-header">Administracija</p>
            <div className="admin-message-container">
                {inactiveUsers.length > 0 ? (
                    <>
                        <p className="section-header">Neprihvaćeni korisnici</p>
                        {inactiveUsers.map((user, index) => (
                            <div className="admin-message-item" key={index}>
                                <div className="admin-message-left">
                                    <p><strong>{user.ime} {user.prezime}</strong></p>
                                    <p>{user.email}</p>
                                    <p>Stan {user.stan_id}</p>
                                </div>
                                <div className="admin-message-right">
                                    <button onClick={() => onActivateUser(user.email)}>Prihvati</button>
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    <p>Nema neprihvaćenih stanara.</p>
                )}

                {activeUsers.length > 0 && (
                    <>
                        <p className="section-header">Aktivni korisnici</p>
                        {activeUsers.map((user, index) => (
                            <div className="admin-message-item" key={index}>
                                <div className="admin-message-left">
                                    <p><strong>{user.ime} {user.prezime}</strong></p>
                                    <p>{user.email}</p>
                                    <p>Stan {user.stan_id}</p>
                                </div>
                                <div className="admin-message-right">
                                    <button onClick={() => onDeactivateUser(user.email)}>Odbij</button>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}

export default function KorisnikInfo() {
    const [info, setInfo] = useState(null);
    const [editing, setEditing] = useState(false);
    const [editedInfo, setEditedInfo] = useState({});
    const [inactiveUsers, setInactiveUsers] = useState([]);
    const [activeUsers, setActiveUsers] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.post('http://localhost:4000/userInfo', {}, { withCredentials: true });
                setInfo(response.data);
                setEditedInfo(response.data);

                const inactiveResponse = await axios.get('http://localhost:4000/userInfo/inactive-users', { withCredentials: true });
                setInactiveUsers(inactiveResponse.data);

                const activeResponse = await axios.get('http://localhost:4000/userInfo/active-users', { withCredentials: true });
                setActiveUsers(activeResponse.data);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchData();
    }, []);

    const handleEdit = () => {
        setEditedInfo({ ...info });
        setEditing(true);
    };

    const handleCancel = () => {
        setEditing(false);
        setEditedInfo({ ...info });
    };

    const handleSave = async () => {
        try {
            const response = await axios.post(
                'http://localhost:4000/userInfo/update',
                { ime: editedInfo.ime, prezime: editedInfo.prezime },
                { withCredentials: true }
            );
            setInfo(response.data);
            setEditing(false);
        } catch (error) {
            console.error('Error updating user data:', error);
        }
    };

    const handleActivateUser = async (email) => {
        try {
            await axios.post('http://localhost:4000/userInfo/activate-user', { email }, { withCredentials: true });

            setInactiveUsers((prev) => prev.filter((user) => user.email !== email));

            const activatedUser = inactiveUsers.find((user) => user.email === email);
            setActiveUsers((prev) => [...prev, activatedUser]);
        } catch (error) {
            console.error('Error activating user:', error);
        }
    };

    const handleDeactivateUser = async (email) => {
        try {
            await axios.post('http://localhost:4000/userInfo/deactivate-user', { email }, { withCredentials: true });

            setActiveUsers((prev) => prev.filter((user) => user.email !== email));

            const deactivatedUser = activeUsers.find((user) => user.email === email);
            setInactiveUsers((prev) => [...prev, deactivatedUser]);
        } catch (error) {
            console.error('Error deactivating user:', error);
        }
    };

    const setEditingField = (field, value) => {
        setEditedInfo((prev) => ({ ...prev, [field]: value }));
    };

    if (!info) {
        return <div>Loading...</div>;
    }

    return (
        <div style={{ display: "flex", flexDirection: "row" }}>
            {info && (
                <UserDetails
                    info={editing ? editedInfo : info}
                    onEdit={handleEdit}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    editing={editing}
                    setEditingField={setEditingField}
                />
            )}
            {info.email.startsWith("easyflatprogi@") && (
                <AdminMessage
                    inactiveUsers={inactiveUsers}
                    activeUsers={activeUsers}
                    onActivateUser={handleActivateUser}
                    onDeactivateUser={handleDeactivateUser}
                />
            )}
        </div>
    );
}
