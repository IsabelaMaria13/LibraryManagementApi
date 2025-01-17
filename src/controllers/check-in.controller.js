const admin = require('firebase-admin');
const db = admin.firestore();

async function checkInBook(req, res) {
    const { googleBookId } = req.body;
    if (!googleBookId) {
        return res.status(400).json({ message: 'Google Book ID is required.' });
    }

    const booksRef = db.collection('books');
    const checkoutsRef = db.collection('loans');

    try {
        await db.runTransaction(async (transaction) => {

            const bookSnapshot = await transaction.get(booksRef.where('bookId', '==', googleBookId));
            if (bookSnapshot.empty) {
                throw new Error(`Book with Google Book ID ${googleBookId} not found.`);
            }
            const bookDoc = bookSnapshot.docs[0];
            const bookData = bookDoc.data();


            const checkoutSnapshot = await transaction.get(checkoutsRef.where('googleBookId', '==', googleBookId).where('returned', '==', false));
            if (checkoutSnapshot.empty) {
                throw new Error('No active checkouts found for this book.');
            }
            const checkoutDoc = checkoutSnapshot.docs[0];


            transaction.update(checkoutDoc.ref, {
                returned: true,
                returnDate: admin.firestore.Timestamp.now(),
            });


            transaction.update(bookDoc.ref, {
                numberOfAvailable: bookData.numberOfAvailable + 1,
            });
        });

        return res.status(200).json({ message: 'Book successfully checked in.' });
    } catch (error) {
        console.error('Error during book check-in:', error);
        return res.status(500).json({ message: error.toString() });
    }
}

module.exports = { checkInBook };
