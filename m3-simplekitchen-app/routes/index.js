const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const auth = require('http-auth');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');

const router = express.Router();
const Registration = mongoose.model('Registration');
const basic = auth.basic({
  file: path.join(__dirname, '../users.htpasswd'),
});


router.get('/', (req, res) => {
  //res.send('It works!');
  res.render('index', { title: 'Registration form' });
});

router.get('/form', (req, res) => {
  res.render('form', { title: 'Registration form' });
});

router.get('/registrants', basic.check((req, res) => {
  Registration.find()
    .then((registrations) => {
      console.log(registrations)
      res.render('registrants', { title: 'Listing registrations', registrations, hideLayout: true });
    })
    .catch(() => { 
      res.send('Sorry! Something went wrong.'); 
    });
}));



router.post(
  '/form',
  [
    check('name')
      .isLength({ min: 1 })
      .withMessage('Please enter a name'),
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email'),
    check('username')
      .isLength({ min: 3 })
      .withMessage('Please enter a username'),
    check('password')
      .isLength({ min: 4 })
      .withMessage('Password must be at least 4 characters long')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      try {
        const registration = new Registration(req.body);

        const salt = await bcrypt.genSalt(10);

        registration.password = await bcrypt.hash(registration.password, salt);

        await registration.save();

        res.send('Thank you for your registration!');
      } catch (err) {
        console.error(err);
        res.send('Sorry! Something went wrong.');
      }
    } else {
      res.render('form', {
        title: 'Registration form',
        errors: errors.array(),
        data: req.body
      });
    }
  }
);


module.exports = router;