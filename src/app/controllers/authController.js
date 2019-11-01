const express = require('express')
const User = require('../models/user')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const authConfig = require('../../config/auth')

const router = express.Router()

router.post('/register', async (req, res) => {
    const { email } = req.body
    try {
        if (await User.findOne({ email })) return res.status(400).send({ "error": "user already exists" })

        const user = await User.create(req.body)
        user.password = undefined
        const token = generateToken({ id: user.id })
        return res.send({ user, token })
    } catch (error) {
        return res.status(400).send("failure")
    }
})

router.post('/authenticate', async (req, res) => {
    const { email, password } = req.body

    const user = await User.findOne({ email }).select('+password')

    if (!user) {
        return res.status(400).send({ 'error': 'user not found' })
    }

    if (!await bcryptjs.compare(password, user.password)) {
        console.log(user.password + " " + password)
        return res.status(400).send({ 'error': 'invalid password' })
    }

    user.password = undefined

    //gerar token
    const token = generateToken({ id: user.id })
    res.send({ user, token })
})

function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400,
    })
}

module.exports = app => app.use('/auth', router)