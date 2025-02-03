const admin = require('firebase-admin');
const db = admin.firestore();

async function checkInBook(req, res) {
    const { selectedLoans } = req.body;
    if (!selectedLoans || !Array.isArray(selectedLoans) || selectedLoans.length === 0) {
        return res.status(400).json({ message: 'No loans selected for check-in.' });
    }

    try {
        await db.runTransaction(async (transaction) => {

            for (const loan of selectedLoans) {
                const { googleBookId, userName } = loan;

                if (!googleBookId || !userName) {
                    throw new Error(`Invalid loan data: ${JSON.stringify(loan)}`);
                }

                const userRef = db.collection('users').where('name', '==', userName);
                const userSnapshot = await transaction.get(userRef);
                if (userSnapshot.empty) {
                    throw new Error(`User ${userName} not found.`);
                }
                const userDoc = userSnapshot.docs[0];

                const bookRef = db.collection('books').where('bookId', '==', googleBookId);
                const bookSnapshot = await transaction.get(bookRef);
                if (bookSnapshot.empty) {
                    throw new Error(`Book with Google Book ID ${googleBookId} not found.`);
                }
                const bookDoc = bookSnapshot.docs[0];

                const loanRef = userDoc.ref.collection('loans').where('bookId', '==', googleBookId).where('returned', '==', false);
                const loanSnapshot = await transaction.get(loanRef);
                if (loanSnapshot.empty) {
                    throw new Error(`No active loan found for book ID ${googleBookId} and user ${userName}.`);
                }

                loanSnapshot.docs.forEach(doc => {
                    transaction.update(doc.ref, {
                        returned: true,
                        returnDate: admin.firestore.Timestamp.now(),
                    });
                });

                transaction.update(bookDoc.ref, {
                    numberOfAvailable: bookDoc.data().numberOfAvailable + 1,
                });
            }
        });

        return res.status(200).json({ message: 'Books successfully checked in.' });
    } catch (error) {
        console.error('Error during book check-in:', error);
        return res.status(500).json({ message: error.message });
    }
}


async function getLoans(req, res) {
    try {
        const usersRef = db.collection('users');
        const usersSnapshot = await usersRef.get();
        const loansData = [];


        const loansPromises = usersSnapshot.docs.map(userDoc =>
            userDoc.ref.collection('loans').where('returned', '==', false).get()
        );

        const results = await Promise.all(loansPromises);

        results.forEach((loansSnapshot, index) => {
            const userDoc = usersSnapshot.docs[index];
            loansSnapshot.forEach(loanDoc => {
                const loan = loanDoc.data();
                loansData.push({
                    loanId: loanDoc.id,
                    bookName: loan.bookTitle || 'Unknown',
                    bookId: loan.bookId || 'Unknown',
                    userName: userDoc.data().name || 'Unknown',
                    checkoutDate: loan.checkoutDate,
                    dueDate: loan.dueDate,
                    returned: loan.returned,
                    returnDate: loan.returnDate || 'Not returned yet',
                });
            });
        });

        return res.status(200).json(loansData);
    } catch (error) {
        console.error('Error retrieving loans:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
}

module.exports = {checkInBook, getLoans};
