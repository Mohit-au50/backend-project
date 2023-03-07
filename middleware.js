const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const token = req.cookies.changed_value;
    try {
        const user = jwt.verify(token, "mySecretKey");
        next()
    }
    catch (err) {
        res.clearCookie("changed_value")
        return res.redirect("/login")
    }
}

module.exports = verifyToken;