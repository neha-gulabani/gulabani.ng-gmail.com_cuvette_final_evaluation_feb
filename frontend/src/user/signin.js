import React, { useState } from 'react';
import '../styles/Auth.css';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import AstroImage from '../images/astronaut.png'
import { useUser } from '../UserContext';
import { jwtDecode } from 'jwt-decode';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { loginUser } = useUser();
    const navigate = useNavigate();

    const toggleAuth = () => {
        setIsLogin(!isLogin);
        setError(''); // Clear error when toggling forms
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Disable button while submitting

        const endpoint = isLogin ? 'http://localhost:5000/api/auth/login' : 'http://localhost:5000/api/auth/register';
        const data = isLogin ? { email, password } : { name, email, password };

        // Clear previous error
        setError('');

        if (!isLogin && password !== confirmPassword) {
            setError('Passwords do not match.');
            setLoading(false); // Enable button if error
            return;
        }

        try {
            const response = await axios.post(endpoint, data, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });


            sessionStorage.setItem('token', response.data.token);
            const decoded = jwtDecode(response.data.token);
            loginUser({ id: decoded._id, name: decoded.name, email: decoded.email });

            navigate("/board")

            setLoading(false);

        } catch (err) {
            setError(err.response?.data?.msg || err.message);
            setLoading(false); // Enable button if error
        }
    };


    return (
        <div className="auth-container">
            <div className="auth-left">
                <img src={AstroImage} alt="Astronaut" className="astronaut-image" />
                <h1>Welcome aboard my friend</h1>
                <p>Just a couple of clicks and we start</p>
            </div>
            <div className="auth-right">
                <form onSubmit={handleSubmit}>
                    {isLogin ? (
                        <div className="login-form">
                            <h2>Login</h2>
                            <div className="input-group">
                                <span className="input-icon-left">
                                    <i className="fas fa-envelope"></i>
                                </span>
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <span className="input-icon-left">
                                    <i className="fas fa-lock"></i>
                                </span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <span className="input-icon-right" onClick={togglePasswordVisibility}>
                                    <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                                </span>
                            </div>
                            {error && <p className="error-message">{error}</p>}
                            <button className="auth-btn" type="submit" disabled={loading}>
                                {loading ? 'Logging in...' : 'Log in'}
                            </button>
                            <p className="noacc">Have no account yet?</p>
                            <button className="transparent-btn" type="button" onClick={toggleAuth}>
                                Register
                            </button>
                        </div>
                    ) : (
                        <div className="register-form">
                            <h2>Register</h2>
                            <div className="input-group">
                                <span className="input-icon-left">
                                    <i class="fa-regular fa-user"></i>
                                </span>
                                <input
                                    type="text"
                                    placeholder="Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <span className="input-icon-left">
                                    <i class="fa-regular fa-envelope"></i>
                                </span>
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <span className="input-icon-left">
                                    <i className="fas fa-lock"></i>
                                </span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <span className="input-icon-right" onClick={togglePasswordVisibility}>
                                    <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                                </span>
                            </div>
                            <div className="input-group">
                                <span className="input-icon-left">
                                    <i className="fas fa-lock"></i>
                                </span>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                                <span className="input-icon-right" onClick={toggleConfirmPasswordVisibility}>
                                    <i className={showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                                </span>
                            </div>
                            {error && <p className="error-message">{error}</p>}
                            <button className="auth-btn" type="submit" disabled={loading}>
                                {loading ? 'Registering...' : 'Register'}
                            </button>
                            <p className='noacc'>Have an account?</p>
                            <button className="transparent-btn" type="button" onClick={toggleAuth}>
                                Log in
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Auth;


