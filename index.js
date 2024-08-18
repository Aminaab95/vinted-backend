const express = require("express");
const cors = require("cors"); //Le Cross-origin resource sharing est une sécurité activée par défault qui permet à un serveur d'empêcher d'autres sites d'utiliser ses ressources (images, routes d'une API, etc.).

const app = express();

app.use(cors());

require("dotenv").config(); // Permet d'activer les variables d'environnement qui se trouvent dans le fichier `.env`

const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

// connexion a mes services
// mongoose

mongoose.connect(process.env.MONGODB_URI); // Vous pourrez vous connecter à votre base de données, sans pour autant préciser les identifiants dans le fichier index.js
// cloudinary

//cloudinary.config({
//  cloud_name: "dpmibx5rg",
//  api_key: "413376996328784",
//  api_secret: "K3p-b01TeDrCvHA3J4cIUOxlzzk",
//});
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_APIKEY,
  api_secret: process.env.CLOUDINARY_APISECRET,
});

app.use(express.json());

// salut

// import de mes routeurs
const userRouter = require("./routes/user");
const offerRouter = require("./routes/offer");
// cours 6
//const cours6Router = require("./routes/cours6");

// utilisation de mes routers
app.use("/user", userRouter); // le "/user" est un préfixe qui sera ajouté à toutes les routes de userRouter
app.use(offerRouter);
//app.use(cours6Router);

app.all("*", (req, res) => {
  res.status(404).json({
    message: "all route",
  });
});

app.listen(3000, () => {
  console.log("server started");
});
