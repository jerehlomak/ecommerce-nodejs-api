const mongoose = require('mongoose')
const validator  = require('validator')
const bcrypt = require('bcryptjs')

const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide name'],
        minlength: 3,
        maxlength: 50
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'Please provide email'],
        validate: {
            validator: validator.isEmail,
            message: 'Please provide a valid email'
        }
    },
    password: {
        type: String,
        required: [true, 'Please provide password'],
        validate: {
            validator: validator.isStrongPassword,
            message: 'Please provide a strong password'
        }
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
    }
})

UserSchema.pre('save', async function() {
    // check if user is modifying details
    console.log(this.modifiedPaths())
    console.log(this.isModified('name'))
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

UserSchema.methods.comparePassword = async function(candidatePassowrd) {
    const isMatch = await bcrypt.compare(candidatePassowrd, this.password)
    return isMatch
}

module.exports = mongoose.model('User', UserSchema)