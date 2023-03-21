const express = require('express')
const router = express.Router()

const {
    getAllUsers, 
    getSingleUser,
    showCurrentUser,
    updateUser,
    updateUserPassword
} = require('../controllers/user.conttroller')
const { authenticateUser, authorizePermissions } = require('../middleware/authentication')

router.route('/').get(authenticateUser, authorizePermissions('admin', 'owner'), getAllUsers)

router.route('/showMe').get(authenticateUser, showCurrentUser)
router.route('/updateUser').post(updateUser)
router.route('/updateUserPassword').post(authenticateUser ,updateUserPassword)

router.route('/:id').get(authenticateUser, getSingleUser)

module.exports = router