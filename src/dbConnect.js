const mongoose = require('mongoose');

// Your MongoDB URI
const DB1 = "mongodb+srv://emir:M.emir2001@firstdb.qrts7du.mongodb.net/?retryWrites=true&w=majority";

async function DBConnect()
{
// Connect to MongoDB
mongoose.connect(DB1, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });
}
module.exports=DBConnect;