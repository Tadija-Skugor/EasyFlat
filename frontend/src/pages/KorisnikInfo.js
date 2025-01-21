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
                        {/* <tr>
                            <th>Status</th>
                            <td>{info.status}</td>
                        </tr> */}
                        <tr>
                            <th>E-pošta</th>
                            <td>{info.email}</td>
                        </tr>
                        <tr>
                            <th>Zgrada</th>
                            <td>{info.zgrada_id}</td>
                        </tr>
                        <tr>
                            <th>Stan</th>
                            <td>{info.stanBr}</td>
                        </tr>
                        <tr>
                            <th>{info.email === "easyflatprogi@gmail.com" ? "Admin" : "Predstavnik stanara"}</th>
                            <td>{info.email === "easyflatprogi@gmail.com" ? "Da" : (info.suvlasnik ? "Da" : "Ne")}</td>
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
function SuvlasnikMessage({ coOwners , allBuildings, onSetCoOwner}) {
    return (
        <div className="suvlasnik-message">
            <p className="suvlasnik-message-header">Predstavnici stanara</p>

            {allBuildings.map((building) => {
                const owner = coOwners.find((owner) => owner.zgrada_id === building.id);

                return (
                    <div className="suvlasnik-item" key={building.id}
                    style={{
                        backgroundImage: building?.slika_link ? `url(${building.slika_link})` : "none",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}>
                        <p>
                            <strong>Zgrada {building.id}</strong>
                        </p>
                        {owner ? (
                            <>
                                <p>{owner.suvlasnik?.ime || "Nepoznato"}  {owner.suvlasnik?.prezime || "Nepoznato"}</p>
                                <p>{owner.suvlasnik?.email || "Nepoznato"}</p>
                            </>
                        ) : (
                            <p className="no-representative">Odaberite predstavnika</p>
                        )}
                    </div>
                );
            })}
        </div>
    );
}


function AdminMessage({
    currentInfo,
    inactiveUsers,
    activeUsers,
    onActivateUser,
    onDeactivateUser,
    onSetCoOwner,
    onRemoveCoowner,
    allBuildings,
}) {
    const isAdmin = currentInfo.email === "easyflatprogi@gmail.com";

    const filteredInactiveUsers = isAdmin
        ? inactiveUsers
        : inactiveUsers.filter((user) => user.zgrada_id === currentInfo.zgrada_id);

    const filteredActiveUsers = isAdmin
        ? activeUsers
        : activeUsers.filter((user) => user.zgrada_id === currentInfo.zgrada_id);

    return (
        <div className="admin-message">
            <p className="admin-message-header">Administracija</p>
            <div className="admin-message-container">
                {filteredInactiveUsers.length > 0 ? (
                    <>
                        <p className="section-header">Neprihvaćeni korisnici</p>
                        {filteredInactiveUsers
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

                
                {filteredActiveUsers.length > 0 && (
                    <>
                        <p className="section-header">Aktivni korisnici</p>
                        {filteredActiveUsers
                            .filter((user) => user.email !== "easyflatprogi@gmail.com")
                            .filter((user) => user.email !== currentInfo.email)
                            .sort((a, b) => Number(a.stanBr) - Number(b.stanBr))
                            .map((user, index) => {
                                const building = allBuildings.find((building) => building.id === user.zgrada_id);
                                const buildingHasSuvlasnik = building && filteredActiveUsers.some(
                                    (activeUser) =>
                                        activeUser.zgrada_id === building.id &&
                                        activeUser.suvlasnik === true &&
                                        activeUser.email !== user.email
                                );
                                return (
                                    <div className="admin-message-item" key={index}>
                                        <div className="admin-message-left">
                                            <p><strong>{user.ime} {user.prezime}</strong></p>
                                            <p>{user.email}</p>
                                            <p>Stan {user.stan_id}</p>
                                            <p>Zgrada {user.zgrada_id}</p>
                                            <p>Predstavnik: {user.suvlasnik ? "Da" : "Ne"}</p>
                                        </div>
                                        <div className="admin-message-right2">
                                        {isAdmin && (
                                            <button
                                                onClick={() =>
                                                    user.suvlasnik
                                                        ? onRemoveCoowner(user.email)
                                                        : onSetCoOwner(user.email)
                                                }
                                                className={user.suvlasnik ? 'remove-coowner' : 'set-coowner'}
                                                disabled={(buildingHasSuvlasnik && !user.suvlasnik)}
                                            >
                                                {user.suvlasnik ? "Ukloni predstavnika" : "Postavi predstavnika"}
                                            </button>
                                        )}
                                            <button onClick={() => onDeactivateUser(user.email)}>
                                                Deaktiviraj
                                            </button> 
                                        </div>
                                    </div>
                                );
                            })}
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
    const [allBuildings, setAllBuildings] = useState([]);
    
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
    
                const coOwnersResponse = await axios.get('http://localhost:4000/userInfo/active-suvlasnici', { withCredentials: true });
                setCoOwners(coOwnersResponse.data);
                console.log("ovo su mi suvlasnici",coOwnersResponse.data); 

                const allBudilingsResponse = await axios.get('http://localhost:4000/userInfo/buildings', { withCredentials: true });
                console.log(allBudilingsResponse);
                setAllBuildings(allBudilingsResponse.data);

            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
    
        fetchData();
    }, []);

    const isAdmin = info?.email === "easyflatprogi@gmail.com";
    const isOwner = info?.suvlasnik === true;
    

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
            setActiveUsers((prev) =>
                prev.map((user) =>
                    user.email === email ? { ...user, suvlasnik: false } : user
                )
            );
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
            setInactiveUsers((prev) =>
                prev.map((user) =>
                    user.email === email ? { ...user, suvlasnik: false } : user
                )
            );
            window.location.reload();
        } catch (error) {
            console.error('Error deactivating user:', error);
        }
    };
    

    const handleSetSuvlasnik = async (email) => {
        try {
            console.log("Setting as Suvlasnik");
            await axios.post('http://localhost:4000/userInfo/setSuvlasnik-user', { email }, { withCredentials: true });
            const updatedCoOwners = [...coOwners, activeUsers.find((user) => user.email === email)];
            setCoOwners(updatedCoOwners);
            setActiveUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.email === email ? { ...user, suvlasnik: true } : user
                )
            );
            const updatedBuildings = allBuildings.map((building) => building.id === activeUsers.find((user) => user.email === email).zgrada_id ? { ...building, suvlasnik: true } : building ); 
            setAllBuildings(updatedBuildings);
            window.location.reload();
        } catch (error) {
            console.error('Error setting Suvlasnik:', error);
        }
    };
    
    const handleRemoveSuvlasnik = async (email) => {
        try {
            console.log("Removing Suvlasnik");
            await axios.post('http://localhost:4000/userInfo/removeSuvlasnik-user', { email }, { withCredentials: true });
            window.location.reload();
            const updatedCoOwners = coOwners.filter((owner) => owner.suvlasnik.email !== email);
            setCoOwners(updatedCoOwners);
            setAllBuildings(allBuildings)
            setActiveUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.email === email ? { ...user, suvlasnik: false } : user
                )
            );
            const updatedBuildings = allBuildings.map((building) => building.id === activeUsers.find((user) => user.email === email).zgrada_id ? { ...building, suvlasnik: false } : building ); setAllBuildings(updatedBuildings);
        } catch (error) {
            console.error('Error removing Suvlasnik:', error);
        }
    };
    
    const setEditingField = (field, value) => {
        setEditedInfo((prev) => ({ ...prev, [field]: value }));
    };

    if (!info) {
        return <div>Loading...</div>;
    }



return (
        <div style={{ display: "flex" }}>
            <div style={{ display: 'flex', flexFlow: "column", marginLeft: "100px" }}>
                <UserDetails
                    info={editing ? editedInfo : info}
                    onEdit={handleEdit}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    editing={editing}
                    setEditingField={setEditingField}
                />

                {(isAdmin) && (
                    <SuvlasnikMessage
                        coOwners={coOwners}
                        allBuildings={allBuildings}
                    />
                )}
            </div>
            {(isAdmin || isOwner) && (
                <AdminMessage
                    currentInfo = {info}
                    inactiveUsers={inactiveUsers}
                    activeUsers={activeUsers}
                    onActivateUser={handleActivateUser}
                    onDeactivateUser={handleDeactivateUser}
                    onSetCoOwner={handleSetSuvlasnik}
                    onRemoveCoowner={handleRemoveSuvlasnik}
                    allBuildings={allBuildings}
                    setAllBuildings={setAllBuildings}
                    coOwners={coOwners}
                />
            )}
        </div>
    );
}
