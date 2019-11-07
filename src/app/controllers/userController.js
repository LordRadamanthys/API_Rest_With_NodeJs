const express = require('express')
const User = require('../models/user')
const authMiddleware = require('../middleware/auth')


const router = express.Router()
router.use(authMiddleware)

router.get('/all', async (req, res) => {
    try {
        const {admin} = await User.findById(req.userId)
        if(!admin) return res.send({error:"Sem permissão de administrador"})
        const allUsers = await User.find()
        res.send(allUsers)
    } catch (error) {
        res.send(error)
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const {admin} = await User.findById(req.userId)
        if(!admin) return res.send({error:"Sem permissão de administrador"})
        const allUsers = await User.findOneAndDelete(req.params.id)
        res.send("ok")
    } catch (error) {
        res.send(error)
    }
})

router.put('/:id', async (req, res) => {
    try {
        const adm = await User.findById(req.userId)
        if(!adm.admin) return res.send({error:"Sem permissão de administrador"})
        const { name, admin} = req.body
        const allUsers = await User.findOneAndUpdate(req.params.id,{
            name,
            admin
        },{ new: true })
        res.send(allUsers)
    } catch (error) {
        res.send(error)
    }
})


module.exports = app => app.use('/users', router)