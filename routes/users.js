const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const { User, validate, validateEmail } = require("../models/user");
const Token = require("../models/token");
const { sendEmail, sendVerificationEmail } = require("../utils/mailer");

// GET /new
// Show the form to create a new user
router.get("/new", (req, res) => {
  res.status(200);
  res.render("new");
});

// POST /unsubscribe
// Show the form to create a new user
router.get("/unsubscribe", (req, res) => {
  res.status(200);
  res.render("unsub");
});

// POST /new
// Create a new user
router.post("/new", async (req, res) => {
  try {
    // Validate the user data
    const { error } = validate(req.body);

    if (error)
      return res.status(400).render("message", {
        title: "Failure!!",
        msg: error.details[0].message,
        success: false,
      });

    // Check if the user already exists
    let user = await User.findOne({ email: req.body.email });

    // verified email already exists
    if (user && user.verified)
      return res.status(400).render("message", {
        title: "Failure!!",
        msg: "Email already Exists",
        success: false,
      });

    // email already exists but not verified
    if (user && !user.verified) {
      // Check if the token already exists
      let token = await Token.findOne({
        userId: user._id,
        newAcc: true,
      });

      // delete previous token
      if (token) await Token.findByIdAndRemove(token._id);
    }

    // user doesn't exist
    if (!user) {
      // create a new user
      user = await new User({
        name: req.body.name,
        email: req.body.email,
        verified: false,
      }).save();
    }

    // create a new token
    token = await new Token({
      userId: user._id,
      token: crypto.randomBytes(32).toString("hex"),
      newAcc: true,
    }).save();

    // send email with the token
    const link = `${process.env.BASE_URL}/users/verify/${user._id}/${token.token}`;
    await sendVerificationEmail(user.email, "New User", link);

    // render the message page
    res.render("message", {
      title: "Success",
      msg: "An email has been sent to you to verify your account",
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(400).render("message", {
      title: "Error",
      msg: "An error occured",
      success: false,
    });
  }
});

// GET /verify/:id/:token
// Verify the user email
router.get("/verify/:id/:token", async (req, res) => {
  try {
    // find the user
    const user = await User.findOne({ _id: req.params.id });
    if (!user)
      return res.status(400).render("message", {
        title: "Failure!!",
        msg: "User doesn't exist.",
        success: false,
      });

    // find the token
    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
      newAcc: true,
    });
    if (!token)
      return res.status(400).render("message", {
        title: "Failure!!",
        msg: "Invalid Link.",
        success: false,
      });

    // verify the user
    await User.updateOne({ _id: user._id }, { verified: true });
    // delete the token
    await Token.findByIdAndRemove(token._id);

    // render the message page
    res.render("message", {
      title: "Success",
      msg: "Email Verified Successfully",
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(400).render("message", {
      title: "Error!!",
      msg: "An error Occured",
      success: false,
    });
  }
});

// POST /login
// Login the user
router.post("/unsubscribe", async (req, res) => {
  try {
    // validate the user data
    const { error } = validateEmail(req.body);
    if (error)
      return res.status(400).render("message", {
        title: "Failure!!",
        msg: error.details[0].message,
        success: false,
      });

    // find the user
    let user = await User.findOne({ email: req.body.email });
    if (!user)
      return res.status(400).render("message", {
        title: "Failure!!",
        msg: "User doesn't exist.",
        success: false,
      });

    // if user is not verified
    if (user && !user.verified) {
      await User.findByIdAndDelete(user._id);
      return res.status(400).render("message", {
        title: "Failure!!",
        msg: "Email already unsubscribed.",
        success: false,
      });
    }

    // delete the previous token
    let token = await Token.findOne({
      userId: user._id,
      newAcc: false,
    });
    if (token) await Token.findByIdAndRemove(token._id);

    // create a new token
    token = await new Token({
      userId: user._id,
      token: crypto.randomBytes(32).toString("hex"),
      newAcc: false,
    }).save();

    // send email with the token
    const link = `${process.env.BASE_URL}/users/remove/${user._id}/${token.token}`;
    await sendVerificationEmail(user.email, user.name, link);

    // render the message page
    res.render("message", {
      title: "Success",
      msg: "An email has been sent to you to verify your account",
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(400).render("message", {
      title: "Error",
      msg: "An error occured",
      success: false,
    });
  }
});

// GET /remove/:id/:token
// Remove the user
router.get("/remove/:id/:token", async (req, res) => {
  try {
    // find the user
    const user = await User.findOne({ _id: req.params.id });
    if (!user)
      return res.status(400).render("message", {
        title: "Failure!!",
        msg: "User doesn't exist.",
        success: false,
      });

    // find the token
    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
      newAcc: false,
    });
    if (!token)
      return res.status(400).render("message", {
        title: "Failure!!",
        msg: "Invalid Link.",
        success: false,
      });

    // delete the user and token
    await User.findByIdAndRemove(user._id);
    await Token.findByIdAndRemove(token._id);

    // render the message page
    res.render("message", {
      title: "Success",
      msg: "You are now unsubscribed successfully",
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(400).render("message", {
      title: "Error!!",
      msg: "An error Occured",
      success: false,
    });
  }
});

module.exports = router;
