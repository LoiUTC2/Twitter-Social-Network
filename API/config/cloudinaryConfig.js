const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

const upload = async (imagePath) => {

    // Use the uploaded file's name as the asset's public ID and 
    // allow overwriting the asset with new versions
    const options = {
        use_filename: true,
        unique_filename: false,
        overwrite: true,
    };

    try {
        // Upload the image
        const result = await cloudinary.uploader.upload(imagePath, options);
        console.log(result);
        return result.url;
    } catch (error) {
        console.error(error);
    }
};

const uploadImage = async (files) => {
    let public_url = [];
    for (const file of files) {
        const publicId = await upload(file.path);
        public_url.push(publicId);
    }
    return public_url;
}

module.exports = { uploadImage }