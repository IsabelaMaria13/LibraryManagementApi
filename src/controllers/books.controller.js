const axios = require("axios");
const { db } = require("../database/firebase");

async function fetchBooks(criteria) {
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    const searchQuery = Object.entries(criteria)
        .map(([key, value]) => {
            if (!value) return null;
            switch (key) {
                case "title": return `intitle:${value}`;
                case "author": return `inauthor:${value}`;
                case "publisher": return `inpublisher:${value}`;
                case "category": return `subject:${value}`;
                case "isbn": return `isbn:${value}`;
                case "lccn": return `lccn:${value}`;
                case "oclc": return `oclc:${value}`;
                default: return null;
            }
        })
        .filter(Boolean)
        .join("+");

    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&key=${apiKey}`;

    try {
        const { data } = await axios.get(url);
        return data.items || [];
    } catch (error) {
        console.error("Error fetching books:", error);
        return [];
    }
}

async function saveBooks(booksData) {
    if (!booksData.length) return console.log("No books to save");

    try {
        const booksCollection = db.collection("books");

        for (const book of booksData) {
            const identifiers = book.volumeInfo.industryIdentifiers || [];
            if (!identifiers.length) {
                console.log(`Skipping book: ${book.volumeInfo.title || "Unknown Title"} - Missing identifiers`);
                continue;
            }

            const identifier = identifiers[0].identifier;
            const existingBookSnapshot = await booksCollection
                .where("volumeInfo.industryIdentifiers.identifier", "==", identifier)
                .get();

            if (!existingBookSnapshot.empty) {
                const doc = existingBookSnapshot.docs[0];
                await doc.ref.update({
                    numberOfCopies: (doc.data().numberOfCopies || 0) + 1,
                    numberOfAvailable: (doc.data().numberOfAvailable || 0) + 1,
                });
                console.log(`Book with identifier ${identifier} already exists. Incremented copies.`);
            } else {
                await booksCollection.add({
                    ...book,
                    numberOfCopies: 1,
                    numberOfAvailable: 1,
                    dateAdded: Date.now(),
                });
                console.log(`Added new book: ${book.volumeInfo.title || "Unknown Title"}`);
            }
        }
    } catch (error) {
        console.error("Error saving books to Firestore:", error);
    }
}

async function fetchAndSaveBooks(criteria) {
    const booksData = await fetchBooks(criteria);
    await saveBooks(booksData);
}

async function addBooks(req, res) {
    const bookData = req.body.bookData;

    if (!bookData || !Object.keys(bookData).length) {
        return res.status(400).send("Please provide book data.");
    }

    try {
        await fetchAndSaveBooks(bookData);
        res.status(200).json({ message: "Books fetched and saved successfully" });
    } catch (error) {
        console.error("Error in addBooks function:", error);
        res.status(500).send(error.message || "An unknown error occurred.");
    }
}

module.exports = { addBooks };
