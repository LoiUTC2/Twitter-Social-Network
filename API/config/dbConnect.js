const { mongoose } = require("mongoose")

const dbConnect = () => {
    try {
    const connect = mongoose.connect(process.env.MONGO_URL);
    console.log("Connect database successfully");
    } catch (error) {
        console.log(`Connect database failed, error: ${error.message}`)
    }
}

module.exports = dbConnect;