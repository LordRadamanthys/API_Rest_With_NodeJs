const express = require('express')
const User = require('../models/user')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const authConfig = require('../../config/auth')
const mailer = require('../../modules/mailer')

const router = express.Router()

router.post('/register', async (req, res) => {
    const { email } = req.body
    try {
        if (await User.findOne({ email })) 
            return res.status(400).send({ "error": "user already exists" })

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

router.post('/forgotPassword', async (req, res) => {
    const { email } = req.body

    try {
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).send({ 'error': 'user not found' })
        }

        const token = crypto.randomBytes(20).toString('hex')

        const now = new Date()
        now.setHours(now.getHours() + 1)

        await User.findByIdAndUpdate(user.id, {
            '$set': {
                passwordResetToken: token,
                passwordResetExpires: now
            }
        })
        console.log(token, now)

        mailer.sendMail({
            to: email,
            from: 'mateus@teste.com',
            template: 'auth/forgot_password',
            context: { token },
        }, (error) => {
            if (error) {
                return res.status(400).send("error to send email")
            }

            return res.send()
        })
    } catch (error) {
        res.status(400).send({ error: 'Error on forgot password, try agai!' })
    }
})

router.post('/reset_password', async (req, res) => {
    const { email, token, password } = req.body

    try {
        const user = await User.findOne({ email })
            .select('+passwordResetToken passwordResetExpires')

        if (!user)
            return res.status(400).send({ 'error': 'user not found' })

        if (token !== user.passwordResetToken)
            return res.status(400).send({ 'error': 'token invalid' })

        const now = new Date()
        console.log(now)
        if (now > user.passwordResetExpires)
            return res.status(400).send({ 'error': 'token expired, generate a new one' })

        user.password = password

        await user.save()

        res.send()

    } catch (error) {
        console.log(error)
        res.status(400).send({ error: "cannot reset password" })
    }
})

function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400,
    })
}


module.exports = app => app.use('/auth', router)