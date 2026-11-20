
require("dotenv").config({ quiet: true });

const express = require("express");
const http = require("http");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

// DATABASE
const connectDB = require("./config/db");

// MODELS
const User = require("./models/User");
const Document = require("./models/Document");
const Permission = require("./models/Permission");

// ROUTES
const authRoutes = require("./routes/authRoutes");
const documentRoutes = require("./routes/documentRoutes");
const chatRoutes = require("./routes/chatRoutes");
const aiRoutes = require("./routes/aiRoutes");

// CONNECT DATABASE
connectDB();

const app = express();
const server = http.createServer(app);

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/ai", aiRoutes);

// HEALTH CHECK
app.get("/", (req, res) => {
    res.send("SyncDoc API running...");
});

// SOCKET.IO
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Store active users by document ID and socket ID
const activeUsers = {};

// Get the user's role for a document.
// The document owner does not need a separate Permission record.
const getDocumentRole = async (documentId, userId) => {
    const document = await Document.findById(documentId).select("owner");

    if (!document) {
        return null;
    }

    if (document.owner.toString() === userId) {
        return "owner";
    }

    const permission = await Permission.findOne({
        document: documentId,
        user: userId
    });

    return permission ? permission.role : null;
};

// Remove a socket from a document room and update collaborators
const removeUserFromDocument = (socket, documentId) => {
    if (!documentId) return;

    socket.leave(documentId);

    if (activeUsers[documentId]) {
        delete activeUsers[documentId][socket.id];

        const remainingUsers = Object.values(
            activeUsers[documentId]
        );

        io.to(documentId).emit(
            "active-users",
            remainingUsers
        );

        if (Object.keys(activeUsers[documentId]).length === 0) {
            delete activeUsers[documentId];
        }
    }

    socket.data.currentDocument = null;
    socket.data.documentRole = null;
};

// AUTHENTICATE SOCKET CONNECTION
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token;

        if (!token) {
            return next(new Error("Authentication required"));
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return next(new Error("User not found"));
        }

        // Store authenticated user on socket
        socket.data.user = user;

        next();

    } catch (error) {
        console.error(
            "Socket authentication failed:",
            error.message
        );

        next(new Error("Invalid authentication token"));
    }
});

// SOCKET CONNECTION
io.on("connection", (socket) => {

    const currentUser = socket.data.user;

    const userId = currentUser._id.toString();

    const userName =
        typeof currentUser.name === "string" &&
            currentUser.name.trim()
            ? currentUser.name.trim()
            : currentUser.email || "User";

    console.log("Authenticated user connected:", userName);

    // JOIN DOCUMENT
    socket.on("join-document", async (data, callback) => {
        try {
            const documentId = data?.documentId;

            if (!documentId) {
                if (typeof callback === "function") {
                    callback({
                        success: false,
                        message: "Document ID required"
                    });
                }

                return;
            }

            // Check document ownership or shared permission
            const role = await getDocumentRole(
                documentId,
                userId
            );

            if (!role) {
                if (typeof callback === "function") {
                    callback({
                        success: false,
                        message: "Access denied"
                    });
                }

                console.log(
                    `${userName} was denied access to ${documentId}`
                );

                return;
            }

            // Leave previous document if switching documents
            const previousDocument = socket.data.currentDocument;

            if (previousDocument && previousDocument !== documentId) {
                removeUserFromDocument(socket, previousDocument);
            }

            // Join authorized document room
            await socket.join(documentId);

            socket.data.currentDocument = documentId;
            socket.data.documentRole = role;

            // Initialize active users for this document
            if (!activeUsers[documentId]) {
                activeUsers[documentId] = {};
            }

            // Add authenticated user
            activeUsers[documentId][socket.id] = userName;

            // Get active users
            const currentActiveUsers = Object.values(
                activeUsers[documentId]
            );

            // Broadcast updated collaborator list
            io.to(documentId).emit(
                "active-users",
                currentActiveUsers
            );

            console.log(
                `${userName} joined ${documentId} as ${role}`
            );

            // Confirm successful join
            if (typeof callback === "function") {
                callback({
                    success: true,
                    role,
                    activeUsers: currentActiveUsers
                });
            }

        } catch (error) {
            console.error("Join document error:", error);

            if (typeof callback === "function") {
                callback({
                    success: false,
                    message: "Unable to join document"
                });
            }
        }
    });

    // LEAVE DOCUMENT
    socket.on("leave-document", (data) => {
        const documentId = data?.documentId;

        if (
            !documentId ||
            socket.data.currentDocument !== documentId
        ) {
            return;
        }

        removeUserFromDocument(socket, documentId);

        console.log(
            `${userName} left document ${documentId}`
        );
    });

    // REAL-TIME DOCUMENT EDIT
    socket.on("send-changes", async (data) => {
        try {
            const { documentId, delta } = data || {};

            // Ensure socket belongs to this document
            if (
                !documentId ||
                socket.data.currentDocument !== documentId
            ) {
                return;
            }

            // Recheck ownership or permission
            const role = await getDocumentRole(
                documentId,
                userId
            );

            // Only owners and editors can edit
            if (!["owner", "editor"].includes(role)) {
                socket.emit("permission-denied", {
                    message: "You do not have permission to edit this document"
                });

                return;
            }

            socket.data.documentRole = role;

            // Broadcast changes to other document members
            socket.to(documentId).emit(
                "receive-changes",
                delta
            );

        } catch (error) {
            console.error("Document change error:", error);
        }
    });

    // CHAT
    socket.on("send-message", async (data) => {
        try {
            const { documentId, message, fileUrl } = data || {};

            if (
                !documentId ||
                socket.data.currentDocument !== documentId
            ) {
                return;
            }

            // Verify document access
            const role = await getDocumentRole(
                documentId,
                userId
            );

            if (!role) {
                return;
            }

            io.to(documentId).emit("receive-message", {
                message,
                fileUrl,
                sender: {
                    name: userName
                },
                timestamp: new Date()
            });

        } catch (error) {
            console.error("Chat error:", error);
        }
    });

    // CURSOR MOVEMENT
    socket.on("cursor-move", (data) => {
        const { documentId, index } = data || {};

        if (
            !documentId ||
            socket.data.currentDocument !== documentId
        ) {
            return;
        }

        socket.to(documentId).emit("cursor-update", {
            user: userName,
            index
        });
    });

    // DISCONNECT
    socket.on("disconnect", () => {
        const documentId = socket.data.currentDocument;

        if (documentId) {
            removeUserFromDocument(socket, documentId);
        }

        console.log("User disconnected:", userName);
    });

});

// START SERVER
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
