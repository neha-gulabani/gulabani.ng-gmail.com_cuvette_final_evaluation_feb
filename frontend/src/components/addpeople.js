import React, { useState } from 'react';
import axios from 'axios';
import '../styles/addpeople.css'

const AddPeopleModal = ({ isOpen, onClose, tasks }) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleAddPeople = async () => {
        try {
            const token = sessionStorage.getItem('token');
            setIsSaving(true);
            const response = await axios.post(
                'http://localhost:5000/api/task/assignTasksToUser',
                { email, tasks },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setMessage(`${email} added to board`);
        } catch (error) {
            setIsSaving(false)
            setMessage('Error adding user');
            console.error(error);
        }

    };

    return (
        isOpen && (
            <div className="modal-overlay">
                <div className="modal-content-ppl">
                    {!message ? (
                        <>
                            <h3>Add people to the board</h3>
                            <input
                                type="text"
                                placeholder="Enter the email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <div className="modal-footer">
                                <button onClick={onClose} className="cancel-btn-ppl">Cancel</button>
                                <button onClick={handleAddPeople} className="save-btn-ppl">Add Email</button>
                            </div>
                        </>
                    ) : (
                        <div>
                            <h3>{message}</h3>
                            <button onClick={onClose} className="save-btn-ppl" >Okay, got it!</button>
                        </div>
                    )}
                </div>
            </div>
        )
    );
};

export default AddPeopleModal;
