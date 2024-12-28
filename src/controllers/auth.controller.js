const {db} = require("../database/firebase");
const {hash} = require("bcrypt");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
    const {email, password, firstName, lastName, phone, agencyId} = req.body;

    if (!email || !password || !firstName || !lastName || !phone || !agencyId) {
        return res.status(400).json({message: "All fields are required."});
    }

    try {
        const existingUser = await db.collection("librarians").where("email", "==", email).get();
        if (!existingUser.empty) {
            return res.status(400).json({message: "Email already in use."});
        }

        const hashedPassword = await hash(password, 10);
        const librarianData = {
            firstName,
            lastName,
            email,
            phone,
            password: hashedPassword,
            agencyId,
            createdAt: new Date(),
        };
        const newLibrarian = await db.collection("librarians").add(librarianData);

        res.status(201).json({message: "Librarian registered successfully.", id: newLibrarian.id});
    } catch (error) {
        res.status(500).json({message: "Error registering librarian.", error: error.message});
    }
}

const login = async (req, res) => {
    const {email, password} = req.body;

    if (!email || !password) {
        return res.status(400).json({message: "Email and password are required."});
    }

    try{
        const existingUser = await db.collection("librarians" ).where("email", "==", email).get();

        if (existingUser.empty) {
            return res.status(404).json({ message: "User not found." });
        }

        const librarianDoc = existingUser.docs[0];
        const librarian = librarianDoc.data();

        const isPasswordValid = await bcrypt.compare(password, librarian.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        const token = jwt.sign(
            { id: librarianDoc.id, email: librarian.email, agencyId: librarian.agencyId },
            process.env.JWT_SECRET || "your_secret_key",
            { expiresIn: "1h" }
        );

        res.status(200).json({ message: "Login successful.", token });
    } catch (error) {
        res.status(500).json({ message: "Error logging in.", error: error.message });
    }

}

module.exports = { register, login };