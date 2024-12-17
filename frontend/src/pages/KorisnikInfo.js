import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ProfPrev({ info }) {
    return (
        <div id='card'>
            <img src={info.slika} alt="Profile" />
            <div id='title'>{info.ime} {info.prezime}</div>
            <div id='status'>{info.status}</div>
            <div>{info.email}</div>
            <div>Stan {info.stanBr}</div>
        </div>
    );
}
function ProfPodat({ info, onEdit, onSave, onCancel, editing, setEditingField, inactiveUsers, onActivateUser }) {
    return (
        <div id='data'>
            <div id='title'>Podatci o Korisniku</div>
            <div>Ime i Prezime</div>
            {editing ? (
                <div className='inputs_form'>
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
                <div>{info.ime} {info.prezime}</div>
            )}
            <div>Status</div>
            <div>{info.status}</div>
            <div>E Pošta</div>
            <div>{info.email}</div>
            <div>Stan</div>
            <div>{info.stanBr}</div>
            <div className='button_row'>
                {editing ? (
                    <>
                        <button onClick={onSave}>Save</button>
                        <button onClick={onCancel}>Cancel</button>
                    </>
                ) : (
                    <button onClick={onEdit}>Uredi</button>
                )}
            </div>
            {/* Provjera jel admin, zadsad to radimo preko maila, ali kasnije bi mogli malo drukcije, who knows */}
            {info.email.startsWith("easyflatprogi@") && (
                <div className="admin-message">
                    <p>OVDJE CE ICI SVE STVARI KOJIMA CE ADMINISTRATOR UPRAVLJATI POPUT DODAVANJA KORISNIKA ITD ITD.</p>
                    <ul>
                        {inactiveUsers.length > 0 ? (
                            inactiveUsers.map((user, index) => (
                                <li key={index}>
                                    {user.ime} {user.prezime} - {user.email} (Stan {user.stan_id}){' '}
                                    <button onClick={() => onActivateUser(user.email)}>
                                        Aktiviraj
                                    </button>
                                </li>
                            ))
                        ) : (
                            <li>Nema neaktivnih korisnika.</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}




function Profil({
    info,
    onEdit,
    onSave,
    onCancel,
    editing,
    setEditingField,
    inactiveUsers,
    onActivateUser
}) {
    return (
        <div id='contain'>
            <ProfPrev info={info} />
            <ProfPodat
                info={info}
                onEdit={onEdit}
                onSave={onSave}
                onCancel={onCancel}
                editing={editing}
                setEditingField={setEditingField}
                inactiveUsers={inactiveUsers}        
                onActivateUser={onActivateUser}       
            />
        </div>
    );
}


export default function KorisnikInfo() {
    const [info, setInfo] = useState(null);
    const [editing, setEditing] = useState(false);
    const [editedInfo, setEditedInfo] = useState({});
    const [inactiveUsers, setInactiveUsers] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.post('http://localhost:4000/userInfo', {}, { withCredentials: true });
                setInfo(response.data);
                setEditedInfo(response.data);

                const inactiveResponse = await axios.get('http://localhost:4000/userInfo/inactive-users', { withCredentials: true });
                setInactiveUsers(inactiveResponse.data);
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
            console.log(`User ${email} activated successfully.`);
        } catch (error) {
            console.error('Error activating user:', error);
        }
    };

    const setEditingField = (field, value) => {
        setEditedInfo((prev) => ({ ...prev, [field]: value }));
    };

    if (!info) {
        return <div>Loading...</div>;
    }

    return (
        <div style={{ paddingBottom: '15%' }}>
        <Profil
            info={editing ? editedInfo : info}
            onEdit={handleEdit}
            onSave={handleSave}
            onCancel={handleCancel}
            editing={editing}
            setEditingField={setEditingField}
            inactiveUsers={inactiveUsers}       
            onActivateUser={handleActivateUser} 
        />

        </div>
    );
}

