const { db } = require("../database/firebase");

async function getBooks(req, res)  {
    try{
        const snapshot = await db.collection("books").get();
        if(snapshot.empty){
            return res.status(404).send("No books found in the collection.");

        }

        const books = [];
        snapshot.forEach(doc => {
            books.push({id: doc.id, ...doc.data()});
        });
        return res.status(200).json(books);

    }
    catch (error){
        if (error instanceof Error) {
            return res.status(500).send(error.message);
        } else {
            return res.status(500).send("An unknown error occurred");
        }
    }
}

async function updateBook(req, res) {
    const bookId = req.params.id;
    const updates = req.body;

    try {

        const snapshot = await db.collection("books").where("id", "==", bookId).get();

        if (snapshot.empty) {
            console.error(`Book with ID ${bookId} not found in Firestore.`);
            return res.status(404).json({ message: "Book not found." });
        }

        snapshot.forEach(async (doc) => {
            const bookRef = db.collection("books").doc(doc.id);
            await bookRef.update(updates);
        });

        console.log(`Book(s) with ID ${bookId} updated successfully.`);
        return res.status(200).json({ message: "Book updated successfully." });
    } catch (error) {
        console.error("Error updating book:", error.message);
        return res.status(500).json({ message: "An error occurred while updating the book." });
    }
}




module.exports = {getBooks, updateBook};