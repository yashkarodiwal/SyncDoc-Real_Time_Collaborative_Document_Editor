
const Document = require("../models/Document");
const Permission = require("../models/Permission");
const User = require("../models/User");


// CREATE DOCUMENT
exports.createDocument = async (req, res) => {
    try {
        const title = req.body.title?.trim();

        if (!title) {
            return res.status(400).json({
                message: "Document name is required"
            });
        }

        const document = await Document.create({
            title,
            content: "",
            owner: req.user.id
        });

        await Permission.create({
            document: document._id,
            user: req.user.id,
            role: "owner"
        });

        res.status(201).json(document);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// GET USER DOCUMENTS
exports.getDocuments = async (req, res) => {
    try {
        const permissions = await Permission.find({
            user: req.user.id
        }).populate("document");

        const docs = permissions
            .filter(permission => permission.document)
            .map(permission => ({
                ...permission.document.toObject(),
                role: permission.role
            }));

        res.json(docs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// GET SINGLE DOCUMENT
exports.getDocument = async (req, res) => {
    try {
        const { id } = req.params;

        const permission = await Permission.findOne({
            document: id,
            user: req.user.id
        });

        if (!permission) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        const doc = await Document.findById(id);

        if (!doc) {
            return res.status(404).json({
                message: "Document not found"
            });
        }

        res.json({
            ...doc.toObject(),
            role: permission.role
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// UPDATE DOCUMENT CONTENT
exports.updateDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        const permission = await Permission.findOne({
            document: id,
            user: req.user.id
        });
        
        console.log("Logged-in User:", req.user.id);
        console.log("Document ID:", id);
        console.log("Permission:", permission);

        if (
            !permission ||
            !["owner", "editor"].includes(permission.role)
        ) {
            return res.status(403).json({
                message: "You do not have permission to edit this document"
            });
        }

        const updatedDoc = await Document.findByIdAndUpdate(
            id,
            { content },
            { new: true, runValidators: true }
        );

        if (!updatedDoc) {
            return res.status(404).json({
                message: "Document not found"
            });
        }

        res.json(updatedDoc);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// UPDATE DOCUMENT TITLE
exports.updateTitle = async (req, res) => {
    try {
        const { id } = req.params;
        const { title } = req.body;

        const permission = await Permission.findOne({
            document: id,
            user: req.user.id
        });

        if (
            !permission ||
            !["owner", "editor"].includes(permission.role)
        ) {
            return res.status(403).json({
                message: "You do not have permission to edit this title"
            });
        }

        const doc = await Document.findByIdAndUpdate(
            id,
            { title },
            { new: true, runValidators: true }
        );

        if (!doc) {
            return res.status(404).json({
                message: "Document not found"
            });
        }

        res.json(doc);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// DELETE DOCUMENT
exports.deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;

        const permission = await Permission.findOne({
            document: id,
            user: req.user.id
        });

        if (!permission || permission.role !== "owner") {
            return res.status(403).json({
                message: "Only the owner can delete this document"
            });
        }

        await Document.findByIdAndDelete(id);
        await Permission.deleteMany({ document: id });

        res.json({ message: "Document deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// SHARE DOCUMENT
exports.shareDocument = async (req, res) => {
    try {
        const { documentId, email, role } = req.body;

        if (!documentId || !email || !role) {
            return res.status(400).json({
                message: "Document ID, email and role are required"
            });
        }

        if (!["viewer", "editor"].includes(role)) {
            return res.status(400).json({
                message: "Invalid sharing role"
            });
        }

        // Only the document owner can share it
        const ownerPermission = await Permission.findOne({
            document: documentId,
            user: req.user.id,
            role: "owner"
        });

        if (!ownerPermission) {
            return res.status(403).json({
                message: "Only the document owner can share it"
            });
        }

        const document = await Document.findById(documentId);

        if (!document) {
            return res.status(404).json({
                message: "Document not found"
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user._id.toString() === req.user.id.toString()) {
            return res.status(400).json({
                message: "You cannot share a document with yourself"
            });
        }

        // Update existing permission or create a new one
        const permission = await Permission.findOneAndUpdate(
            {
                document: documentId,
                user: user._id
            },
            {
                $set: { role },
                $setOnInsert: {
                    document: documentId,
                    user: user._id
                }
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true
            }
        );

        res.json({
            message: `Document shared successfully with ${role} access`,
            permission
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
