const mongoose = require("mongoose");

const connectToDatabase = async () => {
  const dbUrl = process.env.DB_URL;
  try {
    await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`Connected to database: ${dbUrl}`);
  } catch (err) {
    console.log(`Error connecting to database: ${dbUrl}`);
    console.log(err);
  }
};

module.exports = {
  connectToDatabase,
};
