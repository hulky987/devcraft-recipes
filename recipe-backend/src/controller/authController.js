const {signupUserModel} = require('../models/userModel');

exports.signupUser = async (req, res) => {
    try {
        const {name, email, password} = req.body;
        
        if (!name || !email || !password ) {
            return res.status(400).json({message: 'Bitte alle Felder ausfüllen!'})
        }

        const newUser = await signupUserModel(name, email, password);

        if (!newUser){
            return res.status(409).json({message: 'Es existiert bereits ein User mit dieser E-Mail!'});
        }

        res.status(201).json({message: 'User wurde erfolgreich erstellt!', 
        newUser: {name: newUser.name, email: newUser.email}});

    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Internal Server Error!'});
    }
}