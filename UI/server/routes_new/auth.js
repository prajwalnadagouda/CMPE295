const router = require("express").Router();
const { User } = require("../models_new/user");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const cookie = require("cookie");
const authMiddleware = require("../middleware/authToken");

router.post("/", async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error) {
      return res.status(400).send({ message: error.details[0].message });
    }

    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).send({ message: "Invalid Email or Password" });
    }

    console.log(user)

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!validPassword) {
      return res.status(401).send({ message: "Invalid Email or Password" });
    }

    const token = user.generateAuthToken();

    res.status(200).send({ data: [token,user.email,user._id,user.role], message: "logged in successfully" });
  } catch (error) {
    console.log(error);

    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.get("/getUserData", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("jwt");
  res.status(200).send({ message: "Logout successful" });
});

module.exports = router;
const validate = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().label("Email"),
    password: Joi.string().required().label("Password"),
  });
  return schema.validate(data);
};

module.exports = router;
