const mongoose = require('../database')
const bcryptjs = require('bcryptjs')

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },

    createdAt:{
        type: Date,
        default:Date.now,
    }
})

UserSchema.pre('save',async (next)=>{
    const hash = bcryptjs.hash(this.password,10)
    this.password = hash
    next()
})
const User = mongoose.model('User', UserSchema)
module.exports = User