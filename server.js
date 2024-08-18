// const express = require('express');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const nodemailer = require('nodemailer'); // إضافة nodemailer
// const authRoutes = require('./auth');
// const productRoutes = require('./products');
// const path = require('path');

// const app = express();
// const port = 3001;

// app.use(cors());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use('/auth', authRoutes);
// app.use('/products', productRoutes);

// // خدمة ملفات الصور
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // إعداد نقطة النهاية لإرسال البريد الإلكتروني
// app.post('/send-email', (req, res) => {
//   const { email, subject, message } = req.body;

//   // إعداد Nodemailer
//   const transporter = nodemailer.createTransport({
//     service: 'Gmail',
//     auth: {
//       user: 'mohannad.d1818@gmail.com', // بريدك الإلكتروني
//       pass: 'tukzyygtvlriwsxp', // كلمة مرور التطبيق التي حصلت عليها
//     },
//   });

//   const mailOptions = {
//     from: email, // البريد المرسل
//     to: 'aliomari1996zz@gmail.com', // البريد المستلم
//     subject: subject, // الموضوع
//     text: message, // نص الرسالة
//   };

//   transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//       console.error('Error sending email:', error);
//       return res.status(500).send('Error sending email');
//     }
//     console.log('Email sent:', info.response);
//     res.status(200).send('Email sent successfully');
//   });
// });

// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";

import authRoutes from "./auth.js";
import productRoutes from "./products.js";
import { connectDB } from "./db.js";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3001;

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/auth", authRoutes);
app.use("/products", productRoutes);

// Serve image files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Email sending endpoint
app.post("/send-email", (req, res) => {
  const { email, subject, message } = req.body;

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "mohannad.d1818@gmail.com",
      pass: "tukzyygtvlriwsxp",
    },
  });

  const mailOptions = {
    from: email,
    to: "aliomari1996zz@gmail.com",
    subject,
    text: message,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      return res.status(500).send("Error sending email");
    }
    console.log("Email sent:", info.response);
    res.status(200).send("Email sent successfully");
  });
});

app.listen(PORT, async () => {
  try {
    await connectDB(MONGODB_URI);
    console.log(
      `Connected to DB => Server running on http://localhost:${PORT}`
    );
  } catch (error) {
    console.log("error connecting to database: ", error);
    process.exit(1);
  }
});
