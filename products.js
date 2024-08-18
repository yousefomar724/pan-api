// const express = require('express');
// const multer = require('multer');
// const path = require('path');
// const sharp = require('sharp'); // استيراد مكتبة sharp لضغط وتحويل الصور
// const connection = require('./db');

// const router = express.Router();

// // إعداد multer لتخزين الملفات
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/');
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   }
// });

// const upload = multer({ storage });

// // إضافة منتج مع صورة
// router.post('/add', upload.single('image'), async (req, res) => {
//   try {
//     const { name, price, calories, section, available } = req.body;
//     let image = null;

//     if (req.file) {
//       const imagePath = `uploads/${Date.now()}-${req.file.originalname}`;
//       await sharp(req.file.path)
//         .resize(800) // تغيير حجم الصورة
//         .webp({ quality: 80 }) // تحويل الصورة إلى WebP وضغطها
//         .toFile(imagePath);
//       image = `/${imagePath}`;
//     }

//     const isAvailable = available === 'true';

//     const query = 'INSERT INTO products (name, price, calories, image, Sections, available) VALUES (?, ?, ?, ?, ?, ?)';
//     connection.query(query, [name, price, calories || null, image, section, isAvailable], (err, result) => {
//       if (err) {
//         console.error('Database error:', err); // سجل الخطأ
//         return res.status(500).send('Server error');
//       }
//       res.status(201).send({ status: 'success' });
//     });
//   } catch (err) {
//     console.error('Unexpected error:', err); // سجل أي خطأ غير متوقع
//     res.status(500).send('Unexpected server error');
//   }
// });

// // الحصول على جميع المنتجات
// router.post('/get_all', (req, res) => {
//   const query = 'SELECT * FROM products';
//   connection.query(query, (err, results) => {
//     if (err) {
//       console.error('Database error:', err); // سجل الخطأ
//       return res.status(500).send('Server error');
//     }
//     res.status(200).send(results);
//   });
// });

// // تعديل منتج معين
// router.post('/update/:id', upload.single('image'), async (req, res) => {
//   try {
//     const { name, price, calories, section, available } = req.body;
//     let image = null;

//     if (req.file) {
//       const imagePath = `uploads/${Date.now()}-${req.file.originalname}`;
//       await sharp(req.file.path)
//         .resize(800) // تغيير حجم الصورة
//         .webp({ quality: 80 }) // تحويل الصورة إلى WebP وضغطها
//         .toFile(imagePath);
//       image = `/${imagePath}`;
//     }

//     const isAvailable = available === 'true';

//     let query = 'UPDATE products SET name = ?, price = ?, calories = ?, Sections = ?, available = ?';
//     let queryParams = [name, price, calories || null, section, isAvailable];

//     if (image) {
//       query += ', image = ?';
//       queryParams.push(image);
//     }

//     query += ' WHERE id = ?';
//     queryParams.push(req.params.id);

//     connection.query(query, queryParams, (err, result) => {
//       if (err) {
//         console.error('Database error:', err); // سجل الخطأ
//         return res.status(500).send('Server error');
//       }
//       res.status(200).send({ status: 'success' });
//     });
//   } catch (err) {
//     console.error('Unexpected error:', err); // سجل أي خطأ غير متوقع
//     res.status(500).send('Unexpected server error');
//   }
// });

// // حذف منتج معين
// router.post('/delete/:id', (req, res) => {
//   const productId = req.params.id;
//   console.log('Trying to delete product with id:', productId); // Debugging
//   const query = 'DELETE FROM products WHERE id = ?';
//   connection.query(query, [productId], (err, result) => {
//     if (err) {
//       console.error('Database error:', err); // سجل الخطأ
//       return res.status(500).send('Server error');
//     }
//     console.log('Product deleted successfully:', result); // Debugging
//     res.status(200).send({ status: 'success' });
//   });
// });

// module.exports = router;

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
