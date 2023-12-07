// Import cors
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

const express = require('express');

const app = express();
const port = 5000;

// Use cors
app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
	console.error(error.stack);
	res.status(500).send('Something broke!');
});


function start(port) {
  return app.listen(port, () => {
    return console.log(`Express is listening at http://localhost:${port}`);
  });
}
module.exports = {app, start}

