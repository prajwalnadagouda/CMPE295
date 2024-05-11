const router = require("express").Router();
const { User, validate } = require("../models/user");
const bcrypt = require("bcrypt");

router.post("/", async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error) {
      return res.status(400).send({ message: error.details[0].message });
    }

    const existingUser = await User.findOne({ email: req.body.email });

    if (existingUser) {
      return res
        .status(409)
        .send({ message: "User with given email already exists!" });
    }

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    const newUser = new User({
      ...req.body,
      password: hashPassword,
      createdBy: "system",
      createdAt: new Date().toISOString(),
    });
    await newUser.save();

    res.status(201).send({ message: "User created successfully" });
  } catch (error) {
    console.log(error);

    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.put("/forgotPassword", async (req, res) => {
  try {
    const { _id, __v } = req.body;
    const { email, confirmPassword } = req.body;

    console.log("email - ", email);
    console.log("pwd - ", confirmPassword);

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const password = await bcrypt.hash(confirmPassword, salt);

    const updatedUser = await User.findOneAndUpdate(
      { email },
      { password },
      { new: true }
    );

    if (!updatedUser) {
      console.log("error");
      throw new Error("User with this Email Id doesn't exist");
    }

    await updatedUser.save();
    res.status(201).send({ message: "User's password changed successfully" });
  } catch (error) {
    console.log(typeof error);
    res.status(404).send({ message: error.message });
  }
});

module.exports = router;
