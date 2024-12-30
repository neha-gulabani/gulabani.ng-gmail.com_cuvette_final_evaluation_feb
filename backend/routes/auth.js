const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();




router.post('/register', async (req, res) => {
    console.log(req)
    const { name, email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        user = new User({ name, email, password });
        await user.save();

        const token = jwt.sign({ _id: user._id, name: user.name, email: user.email }, process.env.JWT_SECRET, { expiresIn: '30d' });
        res.status(201).json({ token, user: { name: user.name } });
    } catch (error) {
        res.status(500).send('Server Error');
    }
});


router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        const token = jwt.sign({ _id: user._id, name: user.name, email: user.email }, process.env.JWT_SECRET, { expiresIn: '30d' });
        console.log('login token', token)
        res.json({ token, user: { name: user.name } });
    } catch (error) {
        res.status(500).send('Server Error');
    }
});


router.put('/update', auth, async (req, res) => {
    const { name, email, oldPassword, newPassword } = req.body;
    const userId = req.user._id;

    try {
        const user = await User.findById(userId);


        if (newPassword && !(await bcrypt.compare(oldPassword, user.password))) {
            return res.status(400).json({ message: 'Old password is incorrect' });
        }


        if (name) user.name = name;
        if (email) user.email = email;
        if (newPassword) user.password = await bcrypt.hash(newPassword, 10);

        await user.save();

        res.status(200).json({ message: 'Profile updated. Please log in again.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/profile', auth, async (req, res) => {
    try {

        const user = await User.findById(req.user._id).select('name email');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }


        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});




module.exports = router;
