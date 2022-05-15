import dotenv from 'dotenv'
const dotenvConfig = dotenv.config()

const config = {
    mongoDB:{
        url: process.env.MONGODBURL
    }
}

export default config; 