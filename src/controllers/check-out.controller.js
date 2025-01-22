const admin = require('firebase-admin');
const db = admin.firestore();

async function checkoutBook(req, res) {
    const { userName, googleBookId } = req.body;
    if (!userName || !googleBookId) {
        return res.status(400).json({ message: 'User name and Google Book ID are required.' });
    }

    const usersRef = db.collection('users');
    const booksRef = db.collection('books');
    const checkoutsRef = db.collection('loans').doc();

    try {
        await db.runTransaction(async (transaction) => {
            const userSnapshot = await transaction.get(usersRef.where('name', '==', userName));
            if (userSnapshot.empty) {
                throw new Error('User not found.');
            }
            const userDoc = userSnapshot.docs[0];
            const user = userDoc.data();

            const bookSnapshot = await transaction.get(booksRef.where('bookId', '==', googleBookId));
            if (bookSnapshot.empty) {
                throw new Error(`Book with Google Book ID ${googleBookId} not found.`);
            }
            const bookDoc = bookSnapshot.docs[0];
            const bookData = bookDoc.data();

            if (bookData.numberOfAvailable <= 0) {
                throw new Error('No available copies for this book.');
            }

            const checkoutDate = new Date();
            const dueDate = new Date();
            dueDate.setDate(checkoutDate.getDate() + 30);

            const formattedCheckoutDate = checkoutDate.toISOString().split('T')[0];
            const formattedDueDate = dueDate.toISOString().split('T')[0];

            transaction.set(checkoutsRef, {
                userName: user.name,
                bookId: bookData.bookId,
                bookTitle: bookData.title,
                checkoutDate: formattedCheckoutDate,
                dueDate: formattedDueDate,
                returned: false,
            });

            transaction.update(bookDoc.ref, {
                numberOfAvailable: bookData.numberOfAvailable - 1,
            });
        });

        return res.status(200).json({ message: 'Book successfully checked out.' });
    } catch (error) {
        console.error('Error during book checkout:', error);
        return res.status(500).json({ message: error.toString() });
    }
}

module.exports = { checkoutBook };
