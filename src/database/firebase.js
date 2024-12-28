const admin = require("firebase-admin");
const serviceAccount = require("../../key/librarymanagement-74868-firebase-adminsdk-ghrt4-9154b0648e.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
module.exports = db;
