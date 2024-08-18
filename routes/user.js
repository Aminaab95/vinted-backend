const express = require("express");

const router = express.Router();

const User = require("../models/User");

// require des packages de cryptage

const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

// router.get("/", (req, res) => {
//   console.log("je suis dans le routeur");
//   res.json({ message: "router" });
// });

router.post("/signup", async (req, res) => {
  try {
    // req.body => {username : "billy", email: "billy@", password:"123" , newsletter:true}

    const { username, email, password, newsletter } = req.body; // ici on déstructure le req.body c'est a dire on extrait les valeurs de req.body et on les met dans des variables

    console.log(username);

    if (!username || !email || !password) {
      return res.status(400).json({ message: "missing parameters" });
    }

    // est -ce que l'email est déjà pris ?
    const user = await User.findOne({ email: email }); // null <-> {un utilisateur}

    if (user) {
      return res.status(409).json({ message: "email already taken" });
    }
    //

    const salt = uid2(64);
    const token = uid2(64);

    const hash = SHA256(password + salt).toString(encBase64);

    const newUser = new User({
      email: email,
      account: {
        username: username,
      },
      newsletter: newsletter,
      token: token,
      hash: hash,
      salt: salt,
    });

    console.log(newUser);

    await newUser.save(); // on sauvegarde le nouvel utilisateur dans la base de données

    return res.status(201).json({
      _id: newUser._id,
      token: newUser.token,
      account: newUser.account,
    }); // on renvoie une réponse au client avec le nouvel utilisateur créé
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    // format du req.body
    // {
    //   "email": "johndoe@lereacteur.io",
    //   "password": "azerty"
    // }

    const user = await User.findOne({ email: req.body.email }); // null <-> {un utilisateur}

    // sécurité si on trouve personne
    // ici
    //

    // le hash du user est : user.hash on a aussi le salt dans le suer

    const passwordToTest = SHA256(req.body.password + user.salt).toString(
      encBase64
    ); // on hash le mot de passe envoyé par le client avec le salt du user trouvé

    if (passwordToTest === user.hash) {
      return res.status(200).json({
        _id: user._id,
        token: user.token,
        account: user.account,
      });
    } else {
      return res.status(400).json({ message: "email or password incorrect" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
