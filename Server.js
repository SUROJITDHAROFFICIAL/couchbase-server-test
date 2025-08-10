const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const couchbase = require("couchbase");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const clusterConnStr = process.env.CLUSTER_CONN_STR;
const username = process.env.API_KEY_ID;
const password = process.env.API_KEY_TOKEN;
const bucketName = process.env.BUCKET_NAME;

let bucket, collection;

(async () => {
    const cluster = await couchbase.connect(clusterConnStr, {
        username,
        password
    });
    bucket = cluster.bucket(bucketName);
    collection = bucket.defaultCollection();
})();

app.post("/save", async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        await collection.upsert(email, { name, email, phone });
        res.json({ success: true, message: "Data saved successfully" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get("/search/:email", async (req, res) => {
    try {
        const email = req.params.email;
        const result = await collection.get(email);
        res.json({ success: true, data: result.value });
    } catch (error) {
        res.status(404).json({ success: false, error: "Not found" });
    }
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});