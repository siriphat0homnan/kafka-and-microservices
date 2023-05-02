const app = require('express')();

app.get('/orders', (req, res) => res.send('Hello Orders, API!'));

app.listen(3000, () => console.log(`Products API listening on port 3000!`));