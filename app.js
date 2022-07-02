require("dotenv").config();
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;
const comic_interval = process.env.COMIC_INTERVAL || 10;
const { connectToDatabase } = require("./utils/database");
connectToDatabase();

const { sendComic } = require("./utils/comic");

setInterval(() => {
  sendComic();
}, comic_interval * 60 * 1000);

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/users", require("./routes/users"));
app.use("/", require("./routes/views"));

app.all("*", (req, res) => {
  res.status(404).render("message", {
    title: "Opps!!",
    msg: "You got a 404 error. Page not found.",
    success: false,
  });
});

app.listen(PORT, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`Server is listening on port ${PORT}`);
  }
});
