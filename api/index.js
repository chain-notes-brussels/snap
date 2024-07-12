const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// Use the cors middleware with specific options
app.use(cors({
  origin: '*', // Allow all origins
}));

app.get('/hello', (req, res) => {
    res.json({ message: 'yes' });
  });
  

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
