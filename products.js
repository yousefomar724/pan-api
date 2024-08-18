import express from "express";
import cloudinary from "./config/cloudinary.js";
import upload from "./middleware/upload.js";
import Product from "./models/Product.js";

const router = express.Router();

// Add product with image
router.post("/add", upload.single("image"), async (req, res) => {
  try {
    let image = "";

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "pan_products" },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        uploadStream.end(req?.file?.buffer);
      });

      image = result?.secure_url;
    } else {
      return res.status(400).json({ message: "Image is required" });
    }

    const newProduct = new Product({ ...req.body, image });

    await newProduct.save();

    res.status(201).send({ status: "success" });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).send("Unexpected server error");
  }
});

// Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).send(products);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).send("Server error");
  }
});

// Update product by ID
router.put("/update/:id", upload.single("image"), async (req, res) => {
  try {
    let updatedFields = req.body;

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "pan_products" },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        uploadStream.end(req?.file?.buffer);
      });

      updatedFields.image = result?.secure_url;
    }

    await Product.findByIdAndUpdate(req.params.id, updatedFields, {
      new: true,
    });

    res.status(200).send({ status: "success" });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).send("Unexpected server error");
  }
});

// Delete product by ID
router.delete("/delete/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).send({ status: "success" });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).send("Server error");
  }
});

export default router;
