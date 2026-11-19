
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

// Store active users by document and socket ID
const activeUsers = {};


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

        // Store verified user on socket
        socket.data.user = user;

        next();

    } catch (error) {
        console.error("Socket authentication failed:", error.message);
        next(new Error("Invalid authentication token"));
    }
});


// SOCKET CONNECTION
io.on("connection", (socket) => {

    const currentUser = socket.data.user;

    const userId = currentUser._id.toString();

    const userName =
        currentUser.name ||
        currentUser.email ||
        "User";

    console.log("Authenticated user connected:", userName);


    // JOIN DOCUMENT
    socket.on("join-document", async ({ documentId }, callback) => {

        try {
            if (!documentId) {
                if (typeof callback === "function") {
                    callback({
                        success: false,
                        message: "Document ID required"
                    });
                }
                return;
            }

            // Check user's document permission
            const permission = await Permission.findOne({
                document: documentId,
                user: userId
            });

            if (!permission) {
                if (typeof callback === "function") {
                    callback({
                        success: false,
                        message: "Access denied"
                    });
                }
                return;
            }

            // Leave previous document room
            const previousDocument = socket.data.currentDocument;

            if (previousDocument) {
                socket.leave(previousDocument);

                if (activeUsers[previousDocument]) {
                    delete activeUsers[previousDocument][socket.id];

                    io.to(previousDocument).emit(
                        "active-users",
                        Object.values(activeUsers[previousDocument])
                    );

                    if (
                        Object.keys(activeUsers[previousDocument]).length === 0
                    ) {
                        delete activeUsers[previousDocument];
                    }
                }
            }

            // Join authorized document room
            socket.join(documentId);

            socket.data.currentDocument = documentId;
            socket.data.documentRole = permission.role;

            if (!activeUsers[documentId]) {
                activeUsers[documentId] = {};
            }

            activeUsers[documentId][socket.id] = userName;

            io.to(documentId).emit(
                "active-users",
                Object.values(activeUsers[documentId])
            );

            console.log(
                `${userName} joined ${documentId} as ${permission.role}`
            );

            if (typeof callback === "function") {
                callback({
                    success: true,
                    role: permission.role
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
    socket.on("leave-document", ({ documentId }) => {

        if (
            !documentId ||
            socket.data.currentDocument !== documentId
        ) {
            return;
        }

        socket.leave(documentId);

        socket.data.currentDocument = null;
        socket.data.documentRole = null;

        if (activeUsers[documentId]) {
            delete activeUsers[documentId][socket.id];

            io.to(documentId).emit(
                "active-users",
                Object.values(activeUsers[documentId])
            );

            if (Object.keys(activeUsers[documentId]).length === 0) {
                delete activeUsers[documentId];
            }
        }

        console.log(`${userName} left document ${documentId}`);
    });


    // REAL-TIME DOCUMENT EDIT
    socket.on("send-changes", async ({ documentId, delta }) => {

        try {
            // Ensure socket belongs to this document
            if (socket.data.currentDocument !== documentId) {
                return;
            }

            // Verify current permission from database
            const permission = await Permission.findOne({
                document: documentId,
                user: userId
            });

            // Reject users without edit permission
            if (
                !permission ||
                !["owner", "editor"].includes(permission.role)
            ) {

                socket.emit("permission-denied", {
                    message: "You do not have permission to edit this document"
                });

                return;
            }

            // Broadcast only to other authorized room members
            socket.to(documentId).emit(
                "receive-changes",
                delta
            );

        } catch (error) {
            console.error("Document change error:", error);
        }
    });


    // CHAT
    socket.on(
        "send-message",
        async ({ documentId, message, fileUrl }) => {

            try {
                if (socket.data.currentDocument !== documentId) {
                    return;
                }

                // Verify document access
                const permission = await Permission.findOne({
                    document: documentId,
                    user: userId
                });

                if (!permission) {
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
        }
    );


    // CURSOR MOVEMENT
    socket.on("cursor-move", ({ documentId, index }) => {

        if (socket.data.currentDocument !== documentId) {
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

        if (documentId && activeUsers[documentId]) {

            delete activeUsers[documentId][socket.id];

            io.to(documentId).emit(
                "active-users",
                Object.values(activeUsers[documentId])
            );

            if (Object.keys(activeUsers[documentId]).length === 0) {
                delete activeUsers[documentId];
            }
        }

        console.log("User disconnected:", userName);
    });

});


// START SERVER
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
