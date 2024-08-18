import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "./models/User.js";

const router = express.Router();
const secret = "your_jwt_secret";

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).send("User registered");
  } catch (err) {
    res.status(500).send("Server error");
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(400).send("User not found");

    const passwordIsValid = await bcrypt.compare(password, user.password);
    if (!passwordIsValid) return res.status(401).send("Invalid password");

    const token = jwt.sign({ id: user._id }, secret, { expiresIn: "1h" });

    res.status(200).send({ auth: true, token });
  } catch (err) {
    res.status(500).send("Server error");
  }
});

export default router;
