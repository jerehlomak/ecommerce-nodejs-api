const User = require('../models/user.model')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const { createTokenUser, attachCookiesToResponse, checkPermissions } = require('../utils')

const getAllUsers = async (req, res) => {
    console.log(req.user)
    const users = await User.find({ role: 'user' }).select('-password')
    res.status(StatusCodes.OK).json({ users })
}

const getSingleUser = async (req, res) => {
    const user = await User.findOne({ _id: req.params.id })
    if (!user) {
        throw new CustomError.NotFoundError(`No user with id : ${req.params.id}`)
    }
    checkPermissions(req.user, user._id)
    res.status(StatusCodes.OK).json({ user })
}

const showCurrentUser = async (req, res) => {
    res.status(StatusCodes.OK).json({ user: req.user })
}

// update user with user.save()
const updateUser = async (req, res) => {
    const {email, name} = req.body
    if (!email || !name) {
        throw new CustomError.BadRequestError('Please provide all values')
    }
    console.log(email, name, req.user)
    const user = await User.findOne({ _id: req.user.userId })

    user.email = email
    user.name = name

    await user.save()
    
    // create new token User and attach cookies to response
    const tokenUser = createTokenUser(user)
    attachCookiesToResponse({ res, user: tokenUser })
    res.status(StatusCodes.OK).json({ user: tokenUser })
}

const updateUserPassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body

    if (!oldPassword || !newPassword) {
        throw new CustomError.BadRequestError('Please provide both values')
    }
    const user = await User.findOne({ _id: req.user.userId })

    const isPasswordCorrect = await user.comparePassword(oldPassword)
    if (!isPasswordCorrect) {
        throw new CustomError.UnauthenticatedError('Invalid Credentials')
    }
    user.password = newPassword

    await user.save()
    res.status(StatusCodes.OK).json({ msg: 'Successfully updated password' })
}

module.exports = {
    getAllUsers, 
    getSingleUser,
    showCurrentUser,
    updateUser,
    updateUserPassword
}

// const updateUser = async (req, res) => {
//     const {email, name} = req.body
//     if (!email || !name) {
//         throw new CustomError.BadRequestError('Please provide all values')
//     }
//     const user = await User.findOneAndUpdate(
//         { _id: req.user.userId }, 
//         { email, name },
//         { new: true, runValidators: true }
//     )
//     // create new token User and attach cookies to response
//     const tokenUser = createTokenUser(user)
//     attachCookiesToResponse({ res, user: tokenUser })
//     res.status(StatusCodes.OK).json({ user: tokenUser })
// }
