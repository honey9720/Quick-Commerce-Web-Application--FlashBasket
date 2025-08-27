import uploadImageClodinary from "../utils/uploadImageClodinary.js"

const uploadImageController = async (req, res) => {
  console.log("Upload controller hit");
  console.log("File received:", req.file);

  try {
    const uploadImage = await uploadImageClodinary(req.file);

    return res.json({
      message: "Upload done",
      data: {
        filename: req.file.filename,
        url: uploadImage?.url || `/uploads/avatars/${req.file.filename}`  // Cloudinary or local
      },
      success: true,
      error: false
    });

  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
};


export default uploadImageController