const admin = require('firebase-admin');
const db = admin.firestore();

async function checkInBook(req, res) {
    const { selectedLoans } = req.body;
    if (!selectedLoans || !Array.isArray(selectedLoans) || selectedLoans.length === 0) {
        return res.status(400).json({ message: 'No loans selected for check-in.' });
    }

    try {
        await db.runTransaction(async (transaction) => {
            const booksRef = db.collection('books');
            const checkoutsRef = db.collection('loans');

            for (const loan of selectedLoans) {
                const { googleBookId, userName } = loan;

                if (!googleBookId || !userName) {
                    throw new Error(`Invalid loan data: ${JSON.stringify(loan)}`);
                }

                const bookSnapshot = await transaction.get(booksRef.where('bookId', '==', googleBookId));
                if (bookSnapshot.empty) {
                    throw new Error(`Book with Google Book ID ${googleBookId} not found.`);
                }
                const bookDoc = bookSnapshot.docs[0];
                const bookData = bookDoc.data();

                const checkoutSnapshot = await transaction.get(
                    checkoutsRef
                        .where('bookId', '==', googleBookId)
                        .where('userName', '==', userName)
                );
                if (checkoutSnapshot.empty) {
                    throw new Error(`No active loan found for book ID ${googleBookId} and user ${userName}.`);
                }

                checkoutSnapshot.docs.forEach(doc => {
                    transaction.update(doc.ref, {
                        returned: true,
                        returnDate: admin.firestore.Timestamp.now(),
                    });
                });

                transaction.update(bookDoc.ref, {
                    numberOfAvailable: bookData.numberOfAvailable + checkoutSnapshot.size,
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
        const loansRef = db.collection('loans');
        const loansSnapshot = await loansRef.get();

        if (loansSnapshot.empty) {
            return res.status(404).json({ message: 'No loans found.' });
        }

        const loansData = loansSnapshot.docs
            .filter(loanDoc => {
                const loan = loanDoc.data();
                return loan.returned === false;
            })
            .map(loanDoc => {
            const loan = loanDoc.data();
            return {
                loanId: loanDoc.id,
                bookName: loan.bookTitle || 'Unknown',
                bookId: loan.bookId || 'Unknown',
                userName: loan.userName || 'Unknown',
                checkoutDate: loan.checkoutDate,
                dueDate: loan.dueDate,
                returned: loan.returned || false,
                returnDate: loan.returnDate || 'Not returned yet',
            };
        });

        return res.status(200).json(loansData);
    } catch (error) {
        console.error('Error retrieving loans:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
}

module.exports = {checkInBook, getLoans};
