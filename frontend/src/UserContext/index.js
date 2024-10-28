// UserContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    // Initialize user state with localStorage or default values
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : { id: '', name: '', email: '' };
    });

    // Function to log in user and persist data in localStorage
    const loginUser = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData)); // Persist user data
    };

    // Function to log out user and clear localStorage
    const logoutUser = () => {
        setUser({ id: '', name: '', email: '' });
        localStorage.removeItem('user');
    };

    useEffect(() => {
        // Update state if user data changes in localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    return (
        <UserContext.Provider value={{ user, loginUser, logoutUser }}>
            {children}
        </UserContext.Provider>
    );
};
