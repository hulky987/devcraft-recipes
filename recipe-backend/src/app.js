
const authRoutes = require('./routes/authRoutes')

const express = require('express');

const app = express();
const port = 5000;

app.use(express.json());
app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});