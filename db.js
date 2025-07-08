const { MongoClient } = require('mongodb');

const uri = "mongodb://ugproject:sJcA8ThkguWGkMv6@c4dm-xenserv-virt5.eecs.qmul.ac.uk";
let cachedDb = null; // Cache database connection

async function connectToDatabase() {
    if (cachedDb) {
        return cachedDb; // Return existing connection
    }

    try {
        const client = new MongoClient(uri);
        await client.connect();
        cachedDb = client.db("audiocommons"); // Store the database instance
        console.log("Connected to MongoDB");
        return cachedDb;
    } catch (error) {
        console.error("MongoDB connection error:", error);
        throw error;
    }
}

module.exports = { connectToDatabase };
