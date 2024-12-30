import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

import '../styles/settings.css';

const Settings = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [originalName, setOriginalName] = useState('');
    const [originalEmail, setOriginalEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const token = sessionStorage.getItem('token');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {

        axios.get('http://localhost:5000/api/auth/profile', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(response => {
                setName(response.data.name);
                setEmail(response.data.email);
                setOriginalName(response.data.name);
                setOriginalEmail(response.data.email);
            })
            .catch(error => {
                console.error('Error fetching user profile:', error);
            });
    }, []);


    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };
    const handleUpdate = async (e) => {
        e.preventDefault();


        setError('');
        setLoading(true);


        const isNameChanged = name !== originalName;
        const isEmailChanged = email !== originalEmail;
        const isPasswordChangeRequested = oldPassword && newPassword;


        const fieldsUpdated = [isNameChanged, isEmailChanged, isPasswordChangeRequested].filter(Boolean).length;

        if (fieldsUpdated > 1) {
            setError('Please update only one field at a time.');
            setLoading(false);
            return;
        }


        if (oldPassword && !newPassword) {
            setError('Please enter the new password.');
            setLoading(false);
            return;
        }
        if (newPassword && !oldPassword) {
            setError('Please enter the old password.');
            setLoading(false);
            return;
        }

        try {


            const response = await axios.put('http://localhost:5000/api/auth/update', {
                name,
                email,
                oldPassword,
                newPassword
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.status === 200) {

                sessionStorage.removeItem('token');
                navigate('/');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setError('Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="settings-page">

            <div className="settings-content">
                <h2>Settings</h2>
                <form onSubmit={handleUpdate} className="settings-form">
                    {error && <p className="error-message">{error}</p>}

                    <label>
                        Name
                        <div className="input-group-setting">
                            <span className="input-icon-left">
                                <i class="fa-regular fa-user"></i>
                            </span>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    </label>
                    <label>
                        Update Email
                        <div className="input-group">
                            <span className="input-icon-left">
                                <i className="fas fa-envelope"></i>
                            </span>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </label>
                    <label>
                        Old Password
                        <div className='input-group'>
                            <span className="input-icon-left">
                                <i className="fas fa-lock"></i>
                            </span>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                            />

                            <span className="input-icon-right" onClick={togglePasswordVisibility}>
                                <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                            </span>
                        </div>
                    </label>
                    <label>
                        New Password
                        <div className='input-group'>
                            <span className="input-icon-left">
                                <i className="fas fa-lock"></i>
                            </span>
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <span className="input-icon-right" onClick={toggleConfirmPasswordVisibility}>
                                <i className={showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                            </span>
                        </div>
                    </label>
                    <button type="submit" className="upd" disabled={loading}>
                        {loading ? 'Updating...' : 'Update'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Settings;
