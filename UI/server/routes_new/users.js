const router = require("express").Router();
const { User, validateUser } = require("../models_new/user");
const bcrypt = require("bcrypt");

router.post("/", async (req, res) => {
  try {
    const { error } = validateUser(req.body);
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
    //   createdBy: "system",
      created_at: new Date().toISOString(),
    });
    await newUser.save();

    res.status(201).send({ message: "User created successfully" });
  } catch (error) {
    console.log(error);

    res.status(500).send({ message: "Internal Server Error" });
  }
});

module.exports = router;
