const UserModel = require("../models/user.model")
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
require('dotenv').config()

const addUser = async (req, res) => {
    try {
        const { password, email } = req.body;
        // checking if user already exists
        let user = await UserModel.find({ email });
        // console.log('checking if user already exists > ',user)
        if (user.length) return res.status(400).json({ msg: 'User already exists. Please login' })
        // then hashing password
        const hash = await bcrypt.hash(password, saltRounds);
        req.body.password = hash;
        user = await UserModel.create(req.body);
        res.status(200).json({ msg: 'User signup success', user })
    } catch (err) {
        console.log(err.message)
        res.status(500).json({ msg: 'Something went wrong' })
    }
}

module.exports={addUser}