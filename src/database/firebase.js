const admin = require("firebase-admin");
const serviceAccount = require("../../key/librarymanagement-74868-firebase-adminsdk-ghrt4-9154b0648e.json");
const {faker} = require("@faker-js/faker");


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function generateUsers(count = 50) {
    const users = [];
    for (let i = 0; i < count; i++) {
        users.push({
            userId: faker.string.uuid(),
            name: faker.person.fullName(),
            email: faker.internet.email(),
            phone: faker.phone.number(),
            address: {
                street: `${faker.location.streetAddress()}`,
                city: faker.location.city(),
                state: faker.location.state(),
                country: faker.location.country(),
                postcode: faker.location.zipCode(),
            },
            dateOfBirth: faker.date.birthdate({min: 18, max: 65, mode: 'age'}),
            registeredAt: faker.date.past({years: 5}),

        });
    }
    const batch = db.batch();
    users.forEach((user) => {
        const userRef = db.collection('users').doc(user.userId);
        batch.set(userRef, user);
    });

    try {
        await batch.commit();
        console.log('Users successfully uploaded to Firestore.');
    } catch (error) {
        console.error('Error uploading users to Firestore:', error);
    }
}
generateUsers(50).then(() => console.log("Finished generating users"));

module.exports = { db };
