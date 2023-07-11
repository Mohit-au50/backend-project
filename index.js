require("dotenv").config();
const { urlencoded } = require("express");
const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const ejs = require("ejs");
const app = express();
const User = require("./Models/userModel");
const mongoose = require("mongoose");

app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.static("public"));

// get the login page on home route
app.get("/", (req, res) => {
  res.render("login");
});

// get the signup page on /signup
app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/home", async (req, res) => {
  const { loggedIn } = req.cookies;
  try {
    // token verify
    const verifyToken = jwt.verify(loggedIn, process.env.SECRET);

    // find the loggen in use details
    const userDoc = await User.findOne({ _id: verifyToken.id });
    console.log(userDoc);

    res.render("home", {
      showData: userDoc,
    });
  } catch (error) {
    res.send(error);
  }
});

app.get("/logout", (req, res) => {
  res.clearCookie("loggedIn");
  res.redirect("/");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    // check for emial field
    if (!email || !password) {
      console.log("Fill all the fields");
      return res.render("login", {
        message: "Fill all the fields",
      });
    }

    // check if the user email exsist in the database
    const foundUser = await User.findOne({ email });

    // if no email is found
    if (!foundUser) {
      console.log("User doesn't exsist");
      return res.render("login", {
        message: "User doesn't exsist",
      });
    }

    const isMatched = await bcrypt.compare(
      password.toString(),
      foundUser.password
    );

    // if incorrect password
    if (!isMatched) {
      console.log("Incorrect password");
      return res.render("login", {
        message: "Incorrect password",
      });
    }

    // generate a token for the user
    const userToken = jwt.sign({ id: foundUser._id }, process.env.SECRET, {
      expiresIn: "1h",
    });
    res.cookie("loggedIn", userToken);
    res.redirect("/home");
  } catch (error) {
    console.error(error);
    return res.render("login", {
      message: error,
    });
  }
});

app.post("/signup", async (req, res) => {
  const { name, phone, email, password } = req.body;

  try {
    // check for the empty fields
    if (!name || !phone || !email || !password) {
      console.log("Fill all the fields");
      return res.render("signup", {
        message: "Fill all the fields",
      });
    }

    // hash the password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // create a new user in database
    const userDoc = await User.create({
      name,
      phone,
      email,
      password: hashPassword,
    });
    console.log("New User created >>>>>", userDoc);

    res.redirect("/");
  } catch (error) {
    if (error.code === 11000) {
      console.log("Email already exsists");
      return res.render("signup", {
        message: "Email already exsists",
      });
    }

    console.error(error);
    return res.render("signup", {
      message: error,
    });
  }
});

// Database connectiona nd app listning
const port = process.env.PORT || 2404;
mongoose.set("strictQuery", true);
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database connected");
    app.listen(port, () => console.log(`Server started on ${port}`));
  })
  .catch((error) => {
    console.log("Error connecting", error);
  });
