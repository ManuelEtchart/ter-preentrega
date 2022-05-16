import dotenv from 'dotenv'
const dotenvConfig = dotenv.config()

const config = {
    mongoDB:{
        url: process.env.MONGODBURL || 'mongodb://localhost:27017/ecommerce'
    }
}

export default config; 