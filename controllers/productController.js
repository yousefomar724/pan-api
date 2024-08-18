import sharp from "sharp";

export const createProduct = async (req, res) => {
  try {
    const { name, price, calories, section, available } = req.body;
    let image = null;

    if (req.file) {
      const imageBuffer = await sharp(req.file.buffer)
        .resize(800)
        .webp({ quality: 80 })
        .toBuffer();

      const uploadResponse = await cloudinary.uploader.upload_stream(
        {
          folder: "products",
          format: "webp",
        },
        (error, result) => {
          if (error) {
            throw error;
          }
          return result;
        }
      );

      image = uploadResponse.secure_url;
    }

    const isAvailable = available === "true";

    const newProduct = new Product({
      name,
      price,
      calories: calories || null,
      image,
      section,
      available: isAvailable,
    });

    await newProduct.save();

    res.status(201).send({ status: "success" });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).send("Unexpected server error");
  }
};
