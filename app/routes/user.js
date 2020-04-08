// Package imports...
const path = require('path');
var express = require('express');
var router = express.Router();
const passport = require('passport');
const _ = require('lodash');
const cryptoRandomString = require('crypto-random-string');
var nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const jwt_decode = require('jwt-decode');
const bcrypt = require('bcryptjs');
const multer = require('multer');
 
// Local imports...
var {User} = require('../models/user');

middle = (req, res, next) => {
    console.log('printing')
    // console.log(res)
    next()
}

// Call to facebook...
router.get("/auth/facebook", 
    middle,
    passport.authenticate("facebook", 
        { scope : [
            // 'id',
            // 'first_name',
            // 'last_name',
            // 'middle_name',
            // 'name',
            // 'name_format',
            // 'picture',
            // 'short_name',
            'email',
        ] }
    )
);

// Return from facebook...
router.get(
    "/auth/facebook/callback",
    passport.authenticate("facebook", 
    { failureRedirect: '/user/fail' }),
    async function(req, res) {
        // const doc = await User.findOne({'email':req.user._json.email});
        const doc = await User.findByEmail(req.user._json.email);
        // console.log(doc);
        // console.log('profile is here.');
        // console.log(req.user._json);
        if (doc == null){
            // console.log('picture is here.');
            // console.log(req.user._json.picture);
            var user = new User({
                'email': req.user._json.email,
                'lastname': req.user._json.last_name,
                'firstname': req.user._json.first_name,
                'verification': '',
                // 'photo': `http://graph.facebook.com/${req.user._json.id}/picture?type=large&redirect=true&width=500&height=500`
                'photo': req.user._json.picture.url
            });
            // console.log(user);
            
            var doc1 = await user.save();
            console.log(doc1);
            const token = await doc1.generateAuthToken();
            // var decoded = jwt_decode(token);
            
            var body1 = {
                userid: doc1._id,
                email: doc1.email,
                token: token,
                global: globalString
                // tokenexp: decoded.exp
            }
            // console.log(body1);
            res.status(200).send(body1);
        }
        else{
            console.log(doc);
            const token = await doc.generateAuthToken();
            // var decoded = jwt_decode(token);

            var body1 = {
                userid: doc._id,
                email: doc.email,
                token: token,
                lastname: doc.lastname,
                firstname: doc.firstname
                // tokenexp: decoded.exp
            }
            console.log(body1);
            res.render('loginresponse', {body1: body1});
            // res.render('loginresponse', 
            // { token: token, email: doc.email }
            // );
            // res.render('loginresponse', {
            //     resultA: token,
            //     resultB: doc.email,
            //     resultC: doc._id
            // });
            // res.status(200).send(body1);
            // generate token...
            // res.send the token to the user for their local storage
            // if you get the token on a request, match the token
            // if it matches, then the user is already login
        }
    }
);

module.exports = router;