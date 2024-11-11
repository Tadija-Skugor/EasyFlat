import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ProfPrev({ info }) {
    return (
        <div className='prof_card'>
            <img src={info.slika} alt="Profile" />
            <div className='prof_title'>{info.ime}</div>
            <div className='prof_title'>{info.prezime}</div>
            <div className='prof_status'>{info.status}</div>
            <div>{info.email}</div>
            <div>Stan {info.stanBr}</div>
        </div>
    );
}

function ProfPodat({ info, onEdit, onSave, onCancel, editing, setEditingField }) {
    return (
        <div className='prof_data'>
            <div className='prof_title'>Podatci o Korisniku</div>
            <div>Ime i Prezime</div>
            {editing ? (
                <>
                    <input value={info.ime} onChange={(e) => setEditingField('ime', e.target.value)} />
                    <input value={info.prezime} onChange={(e) => setEditingField('prezime', e.target.value)} />
                    <button onClick={onSave}>Save</button>
                    <button onClick={onCancel}>Cancel</button>
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
            <button onClick={onEdit}>Uredi</button>
        </div>
    );
}

function Profil({ info, onEdit, onSave, onCancel, editing, setEditingField }) {
    return (
        <div className='prof_contain'>
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
                setEditedInfo(response.data);  // Ensure editedInfo is initialized with the fetched data
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchData();
    }, []);

    const handleEdit = () => {
        setEditedInfo({ ...info });  // Ensure editedInfo gets updated with current info when editing starts
        setEditing(true);
    };

    const handleCancel = () => {
        setEditing(false);
        setEditedInfo({ ...info });  // Ensure that cancel resets the editedInfo
    };

    const handleSave = async () => {
        try {
            // Log the edited info before saving
            console.log('Saving updated data:', editedInfo);

            const response = await axios.post(
                'http://localhost:4000/userInfo/update',
                { 
                    ime: editedInfo.ime, 
                    prezime: editedInfo.prezime
                },
                { withCredentials: true }
            );
            console.log('Updated user data:', response.data); // Log the updated response

            // Update the state with the full data (including static session data)
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
