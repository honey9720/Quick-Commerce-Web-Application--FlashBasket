import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadImageClodinary = async (image) => {
    if (!image || !image.path) throw new Error("No file provided");

    // ✅ Upload directly from local file path
    const uploadImage = await cloudinary.uploader.upload(image.path, {
        folder: "FlashBasket"
    });

    return uploadImage;
};

export default uploadImageClodinary;
