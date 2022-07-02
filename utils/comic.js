const axios = require("axios");
const { sendEmail } = require("./mailer");
const { User } = require("../models/user");
const { comicMsg } = require("./msgCreator");

const getRandom = (num) => {
  return Math.floor(Math.random() * num) + 1;
};

const sendComic = async () => {
  const base = process.env.COMIC_BASE;
  const info = process.env.COMIC_INFO;

  try {
    const info_res = await axios.get(base + info);

    const comic_num = getRandom(info_res.data.num);

    const comic_res = await axios.get(`${base}/${comic_num}${info}`);
    const comic = comic_res.data;

    const user_list = await User.find({ verified: true });

    user_list.map((user) => {
      const msg = comicMsg(comic, user.name);
      sendEmail(user.email, "New Random Comic is here!!", msg, true);
      console.log("Mail Promise created");
    });
  } catch (err) {
    console.log("\nAn error occured!!");
    console.log(err);
  }
};

module.exports = { sendComic };
