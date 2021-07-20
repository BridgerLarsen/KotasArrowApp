const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../../models/User');
const auth = require('../../middleware/auth');

// @route POST api/auth
// @desc AUTH user
// @access public
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Simple validation
    if (!email || !password) {
        return res.status(400).json({ msg: 'Please enter all fields' });
    }

    // Check for existing user
    User.findOne({ email })
        .then(user => {
            if (!user) {
                return res.status(400).json({ msg: 'User Does not exist' });
            } 

            // Validate Password
            try {
                bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials'})

                    jwt.sign(
                        { id: user.id },
                        process.env.JWTSECRET,
                        { expiresIn: 3600 },
                        (err, token) => {
                            if (err) throw err

                            res.cookie(
                                'token', 
                                token, 
                                {   
                                    maxAge: 3600000,
                                    sameSite: 'strict',
                                    secure: true,
                                    httpOnly: true,
                                    signed: true
                                });

                            res.json({
                                token,
                                user: {
                                    id: user.id,
                                    name: user.name,
                                    email: user.email,
                                    admin: user.admin
                                }
                            });
                        }
                    )
                })
            } catch (e) {
                res.status(400).json({ msg: e.message });
            }
        })    
})

router.get('/logged_in', (req, res) => {
    if (req.signedCookies) {
        res.status(200).json(req.signedCookies);
    } else {
        res.status(401).json({ msg: 'Need to Sign In' })
    }
})

// @route GET api/auth/users
// @desc user data
// @access private
router.get('/users', auth, (req, res) => {
    User.findById(req.user.id)
        .select('-password')
        .then(user => {
            res.json({ 
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    admin: user.admin
                }
            })
        })
        .catch(err => {
            res.status(400).json({ 'msg': err })
        })
})

router.delete('/loggout', (req, res) => {
    try {
        res.clearCookie('token');
        res.status(200).json({ loggedOut: "Success"})
    }
    catch (err) {
        res.status(400).json({ msg: 'Loggout Failure' })
    }
})


module.exports = router;