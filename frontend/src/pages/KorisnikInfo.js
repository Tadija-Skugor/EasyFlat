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
                            <th>Broj zgrade</th>
                            <td>{info.zgrada_id}</td>
                        </tr>
                        <tr>
                            <th>Broj stana</th>
                            <td>{info.stanBr}</td>
                        </tr>
                        <tr>
                            <th>Suvlasnik</th>
                            <td>{info.suvlasnik ? "Da" : "Ne"}</td>
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
function SuvlasnikMessage({ coOwners }) {
    return (
        <div className="suvlasnik-message">
            <p className="suvlasnik-message-header">Suvlasnici zgrada</p>
            {coOwners.length > 0 ? (
                <div className="suvlasnik-list">
                    {coOwners
                        .sort((a, b) => a.zgrada_id - b.zgrada_id)
                        .filter((user) => user.email !== "easyflatprogi@gmail.com")
                        .map((owner, index) => (
                            <div className="suvlasnik-item" key={index}>
                                <p><strong>{owner.suvlasnik.ime} {owner.suvlasnik.prezime}</strong></p>
                                <p>Email: {owner.suvlasnik.email}</p>
                                <p>Zgrada: {owner.zgrada_id}</p>
                                <p>Stan: {owner.suvlasnik.stan_id}</p>
                            </div>
                        ))}
                </div>
            ) : (
                <p>Nema suvlasnika u ovom trenutku.</p>
            )}
        </div>
    );
}

function AdminMessage({
    inactiveUsers,
    activeUsers,
    onActivateUser,
    onDeactivateUser,
    onSetCoOwner,
    onRemoveCoowner
}) {
    return (
        <div className="admin-message">
            <p className="admin-message-header">Administracija</p>
            <div className="admin-message-container">
                {inactiveUsers.length > 0 ? (
                    <>
                        <p className="section-header">Neprihvaćeni korisnici</p>
                        {inactiveUsers
                        .sort((a, b) => Number(a.zgrada_id) - Number(b.zgrada_id))
                        .sort((a, b) => Number(a.stanBr) - Number(b.stanBr))
                        .map((user, index) => (
                            <div className="admin-message-item" key={index}>
                                <div className="admin-message-left">
                                    <p><strong>{user.ime} {user.prezime}</strong></p>
                                    <p>{user.email}</p>
                                    <p>Stan {user.stan_id}</p>
                                    <p>Zgrada {user.zgrada_id}</p>
                                </div>
                                <div className="admin-message-right1">
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
                        {activeUsers
                        .filter((user) => user.email !== "easyflatprogi@gmail.com")
                        .sort((a, b) => Number(a.zgrada_id) - Number(b.zgrada_id))
                        .sort((a, b) => Number(a.stanBr) - Number(b.stanBr))
                        .map((user, index) => (
                            <div className="admin-message-item" key={index}>
                                <div className="admin-message-left">
                                    <p><strong>{user.ime} {user.prezime}</strong></p>
                                    <p>{user.email}</p>
                                    <p>Stan {user.stan_id}</p>
                                    <p>Zgrada {user.zgrada_id}</p>
                                    <p>Suvlasnik: {user.suvlasnik ? "Da" : "Ne"}</p>
                                </div>
                                <div className="admin-message-right2">
                                <button onClick={() => 
                                        user.suvlasnik ? onRemoveCoowner(user.email) : onSetCoOwner(user.email)
                                        }>
                                        {user.suvlasnik ? "Ukloni suvlasnika" : "Postavi suvlasnika"}
                                        </button>
                                    <button onClick={() => {console.log("Button clicked!"); onDeactivateUser(user.email)}}>Deaktiviraj</button>
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
    const [coOwners, setCoOwners] = useState([]);

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

                const ownersResponse = await axios.get('http://localhost:4000/userInfo/active-suvlasnici', { withCredentials: true });
                setCoOwners(ownersResponse.data);
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

    const handleSetSuvlasnik = async (email) => {
        try {
            console.log("handlaem set suvlasnik");
            await axios.post('http://localhost:4000/userInfo/setSuvlasnik-user', { email }, { withCredentials: true });
            setActiveUsers((users) =>
                users.map((user) => (user.email === email ? { ...user, suvlasnik: true } : user))
            );
        } catch (error) {
            console.error('Error setting suvlasnik:', error);
        }
    };
    
    const handleRemoveSuvlasnik = async (email) => {
        try {
            await axios.post('http://localhost:4000/userInfo/removeSuvlasnik-user', { email }, { withCredentials: true });
            setActiveUsers((users) =>
                users.map((user) => (user.email === email ? { ...user, suvlasnik: false } : user))
            );
        } catch (error) {
            console.error('Error removing suvlasnik:', error);
        }
    };
    
    const setEditingField = (field, value) => {
        setEditedInfo((prev) => ({ ...prev, [field]: value }));
    };

    if (!info) {
        return <div>Loading...</div>;
    }

    return (
        <div style={{ display: "flex"}}>
            <div style={{display:'flex', flexFlow:"column"}}>
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
                    <SuvlasnikMessage coOwners={coOwners} />
                )}
            </div>
            {info.email.startsWith("easyflatprogi@") && (
                <AdminMessage
                    inactiveUsers={inactiveUsers}
                    activeUsers={activeUsers}
                    onActivateUser={handleActivateUser}
                    onDeactivateUser={handleDeactivateUser}
                    onSetCoOwner={handleSetSuvlasnik}
                    onRemoveCoowner = {handleRemoveSuvlasnik}
                />
            )}
        </div>
    );
}
