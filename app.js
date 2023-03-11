const { urlencoded } = require("express");
const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const ejs = require("ejs");
const app = express();
const User = require("./data");
const verifyToken = require("./middleware");

app.use(express.json());
app.use(urlencoded({extended: true}))
app.use(cookieParser())
app.set("view engine", "ejs")
app.use(express.static("public"))


let dataToSearch = [];

app.get("/home", verifyToken, async (req, res) => {
    let showData = await User.findOne({email: dataToSearch});
    // console.log(showData.fname)
    res.render('home', {
        hey: "hi there, Welcome!",
        showData: showData,
    })
})


app.post("/userLogin", async (req, res) => {
    const data = req.body;
    if(dataToSearch.length == "") {
        dataToSearch.push(data.email);
    }
    dataToSearch.shift();
    dataToSearch.push(data.email);
    
    let logPass = data.password;
    let email = data.email;
    let user_data = await User.findOne({email: email})
    if(!user_data) {
        res.send("user doesn't exsist!")
    }

    let db_password = user_data.password;
    const isValid = await bcrypt.compare(logPass.toString(), db_password)
    if(!isValid) return res.send("Icorrect!!")

    // generate token
    const token_to_send = jwt.sign({id: user_data._id}, "mySecretKey", {expiresIn: "1h"})
    res.cookie("changed_value", token_to_send);

    res.redirect("/home");
})

app.post("/userSignup", async (req, res) => {
    const data = req.body;
    if(data.password !== data.cpassword) {
       return res.send("Incorrect Password")
    }
    let user_fname = data.fname;
    let user_lname = data.lname;
    let user_phone = data.number;
    let user_email = data.email;
    let user_password = data.password;
    let user_cpassword = data.cpassword;
    if(!user_fname || !user_lname || !user_phone || !user_email || !user_password || !user_cpassword) {
        return res.send("details are empty")
    }
    let user_data = await User.findOne({email: user_email})
        if(user_data) {
        return res.send("user Already Exsits")
    }

    // storing password in hash form and saving data of user inputs
    const salt = await bcrypt.genSalt(10);
    const hashed_password = await bcrypt.hash(user_password.toString(), salt);
    const data_to_store = new User({fname: user_fname, lname: user_lname, phone: user_phone, email: user_email, password: hashed_password})
    const result = await data_to_store.save();
    
    res.redirect("/")
})

app.get("/", (req, res) => {
    
    res.render("logNsign")
    // User.find({}, (err, userdatas) => {
    //     res.render("new", {
    //         mongoData: userdatas,
    //     })
    // })
})

app.post("/update", verifyToken, (req, res) => {
    return res.redirect("/home");
})

app.get("/logout", (req, res) => {
    res.clearCookie("my_token")
    res.redirect("/")
})

app.listen(3000)
console.log("server is live on port 3000")