const admin = require('firebase-admin');
const db = admin.firestore();

async function checkoutBook(req, res) {
    const { userName, googleBookId } = req.body;
    if (!userName || !googleBookId) {
        return res.status(400).json({ message: 'User name and Google Book ID are required.' });
    }

    const usersRef = db.collection('users');
    const booksRef = db.collection('books');

    try {
        const userSnapshot = await usersRef.where('name', '==', userName).get();
        if (userSnapshot.empty) {
            return res.status(404).json({ message: "User not found." });
        }
        const userDoc = userSnapshot.docs[0];

        const bookSnapshot = await booksRef.where('bookId', '==', googleBookId).get();
        if (bookSnapshot.empty) {
            return res.status(404).json({ message: "Book not found." });
        }
        const bookDoc = bookSnapshot.docs[0];
        const bookData = bookDoc.data();

        if (bookData.numberOfAvailable <= 0) {
            return res.status(404).json({ message: "No available copies for this book." });
        }

        const checkoutDate = new Date();
        const dueDate = new Date();
        dueDate.setDate(checkoutDate.getDate() + 30);

        const formattedCheckoutDate = checkoutDate.toISOString().split('T')[0];
        const formattedDueDate = dueDate.toISOString().split('T')[0];

        const loanRef = userDoc.ref.collection('loans').doc();
        await loanRef.set({
            bookId: bookData.bookId,
            bookTitle: bookData.title,
            author: bookData.author,
            checkoutDate: formattedCheckoutDate,
            dueDate: formattedDueDate,
            returned: false
        });

        await bookDoc.ref.update({
            numberOfAvailable: bookData.numberOfAvailable - 1,
        });

        return res.status(200).json({ message: 'Book successfully checked out.' });
    } catch (error) {
        console.error('Error during book checkout:', error);
        return res.status(500).json({ message: error.toString() });
    }
}

module.exports = { checkoutBook };
