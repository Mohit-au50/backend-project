const express = require("express")
const app = express();
const mongoose = require("mongoose");

const mongodb_atlas = "mongodb+srv://mohit-au50:dt4ZylRlEXOCp50Z@cluster0.vbujabu.mongodb.net/backEnd_project?retryWrites=true&w=majority";
const mongodb_compass = "mongodb://localhost:27017/backEnd_project";

mongoose.set('strictQuery', true);
mongoose.connect(mongodb_atlas,
{useNewUrlParser: true, useUnifiedTopology: true},
(err) => {
    if(err) console.log("an error occured", err)
    else console.log("mongodb Atlas connected on the port")
})

const userSchema = new mongoose.Schema({
    fname: String,
    lname: String,
    phone: Number,
    email: String,
    password: String,
    cpassword: String
})

const User = new mongoose.model("user_collection", userSchema);

// async function getdata() {
//     try {
//         const showData = User.find();
//         console.log(showData);


//     } catch (error) {
//         console.log("some error occured", error)
//     }
// }
// getdata();

app.listen(5000, () => {
    console.log("server is live on port 5000")
})

module.exports = User;