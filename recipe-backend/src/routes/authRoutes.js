const {signupUser} = require('../controller/authController')

const express = require('express');

const router = express.Router();

router.post("/signup", signupUser);

router.post("/login", )

module.exports = router;