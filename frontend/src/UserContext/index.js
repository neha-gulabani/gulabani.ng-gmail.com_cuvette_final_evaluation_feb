// UserContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    // Initialize user state with sessionStorage or default values
    const [user, setUser] = useState(() => {
        const storedUser = sessionStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : { id: '', name: '', email: '' };
    });

    // Function to log in user and persist data in sessionStorage
    const loginUser = (userData) => {
        setUser(userData);
        sessionStorage.setItem('user', JSON.stringify(userData)); // Persist user data
    };

    // Function to log out user and clear sessionStorage
    const logoutUser = () => {
        setUser({ id: '', name: '', email: '' });
        sessionStorage.removeItem('user');
    };

    useEffect(() => {
        // Update state if user data changes in sessionStorage
        const storedUser = sessionStorage.getItem('user');
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
