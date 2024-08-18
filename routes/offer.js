const express = require("express");

const fileupload = require("express-fileupload");

const cloudinary = require("cloudinary").v2;

const Offer = require("../models/Offer");

const User = require("../models/User");

const router = express.Router();

// import de mon middleware
const isAuthenticated = require("../middlewares/isAuthenticated");

// fonction formatage image

const convertToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};

// Poster une annonce
router.post(
  "/offer/publish",
  fileupload(),
  isAuthenticated,
  async (req, res) => {
    try {
      // --------------------- MIDDLEWARE
      // console.log(req.headers.authorization.replace("Bearer ", ""));
      // const token = req.headers.authorization.replace("Bearer ", "");

      // const user = await User.findOne({ token: token });

      // if (!user) {
      //   return res.status(401).json({ message: "Unauthorized" });
      // }

      // --------------------- MIDDLEWARE

      // console.log(req.body);
      // req.body -->
      const { title, description, price, condition, city, brand, size, color } =
        req.body;

      const newOffer = new Offer({
        product_name: title,
        product_description: description,
        product_price: price,
        product_details: [
          {
            MARQUE: brand,
          },
          {
            TAILLE: size,
          },
          {
            ÉTAT: condition,
          },
          {
            COULEUR: color,
          },
          {
            EMPLACEMENT: city,
          },
        ],
        // product_image: Object,
        owner: req.user._id,
      });

      const result = await cloudinary.uploader.upload(
        convertToBase64(req.files.picture)
      );

      // console.log(result);

      // j'ajoute les infos de mon image dans newOffer
      newOffer.product_image = result;

      // console.log(newOffer);

      await newOffer.save();

      // répondre :

      const responseObj = {
        product_name: title,
        product_description: description,
        product_price: price,
        product_details: [
          {
            MARQUE: brand,
          },
          {
            TAILLE: size,
          },
          {
            ÉTAT: condition,
          },
          {
            COULEUR: color,
          },
          {
            EMPLACEMENT: city,
          },
        ],
        product_image: result,
        owner: {
          account: req.user.account,
          _id: req.user._id,
        },
      };

      // console.log(responseObj);

      return res.status(201).json(responseObj);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  }
);

const PAGE_SIZE = 5; // Nombre de résultats par page

// route pour récupérer les annonces  avec des options de filtrage (title, priceMin, priceMax), de tri (sort), et de pagination (page)

router.get("/offers", async (req, res) => {
  try {
    const { title, priceMin, priceMax, sort, page = 1 } = req.query;

    const query = {};

    if (title) {
      query.product_name = { $regex: title, $options: "i" }; // Recherche insensible à la casse
    }

    if (priceMin) {
      query.product_price = { ...query.product_price, $gte: Number(priceMin) };
    }

    if (priceMax) {
      query.product_price = { ...query.product_price, $lte: Number(priceMax) };
    }

    const sortOptions = {};
    if (sort === "price-desc") {
      sortOptions.product_price = -1;
    } else if (sort === "price-asc") {
      sortOptions.product_price = 1;
    }

    const offers = await Offer.find(query)
      .sort(sortOptions)
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .exec();

    const count = await Offer.countDocuments(query).exec();

    res.json({ count, offers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Récupérer les détails d'une annonce  spécifique par son ID

router.get("/offers/:id", async (req, res) => {
  try {
    console.log(req.params);
    const offerId = req.params.id;

    const offer = await Offer.findById(offerId)
      .populate("owner") // Peupler les détails du propriétaire si nécessaire
      .exec();

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    res.json(offer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;
