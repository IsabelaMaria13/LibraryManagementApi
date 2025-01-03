const { db } = require("../database/firebase");

async function getBooks(req, res)  {
    try{
        const snapshot = await db.collection("books").get();
        if(snapshot.empty){
            res.status(404).send("No books found in the collection.");

        }

        const books = [];
        snapshot.forEach(doc => {
            books.push({id: doc.id, ...doc.data()});
            console.log(doc.data());
        });
        res.status(200).json(books);

    }
    catch (error){
        if (error instanceof Error) {
            res.status(500).send(error.message);
        } else {
            res.status(500).send("An unknown error occurred");
        }
    }
}

module.exports = {getBooks};