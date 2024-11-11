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

function ProfPodat({ info, onEdit, onSave, onCancel, editing, setEditingField }) {
    return (
        <div id='data'>
            <div id='title'>Podatci o Korisniku</div>
            <div>Ime i Prezime</div>
            {editing ? (
                <>
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
                </>
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
        </div>
    );
}


function Profil({ info, onEdit, onSave, onCancel, editing, setEditingField }) {
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
            />
        </div>
    );
}

export default function KorisnikInfo() {
    const [info, setInfo] = useState(null);
    const [editing, setEditing] = useState(false);
    const [editedInfo, setEditedInfo] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.post('http://localhost:4000/userInfo', {}, { withCredentials: true });
                console.log('Fetched user data:', response.data); // Log the fetched data
                setInfo(response.data);
                setEditedInfo(response.data);  
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
            
            console.log('Saving updated data:', editedInfo);

            const response = await axios.post(
                'http://localhost:4000/userInfo/update',
                { 
                    ime: editedInfo.ime, 
                    prezime: editedInfo.prezime
                },
                { withCredentials: true }
            );
            console.log('Updated user data:', response.data); 

            setInfo(response.data);
            setEditing(false);
        } catch (error) {
            console.error('Error updating user data:', error);
        }
    };

    const setEditingField = (field, value) => {
        setEditedInfo((prev) => ({ ...prev, [field]: value }));
    };

    if (!info) {
        return <div>Loading...</div>;
    }

    return (
        <Profil
            info={editing ? editedInfo : info}
            onEdit={handleEdit}
            onSave={handleSave}
            onCancel={handleCancel}
            editing={editing}
            setEditingField={setEditingField}
        />
    );
}
