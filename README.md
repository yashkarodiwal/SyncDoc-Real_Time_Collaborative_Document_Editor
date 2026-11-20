# SyncDoc – Real-Time Collaborative Document Editor

SyncDoc is a collaborative document editing platform that enables multiple users to create, edit, share, and manage documents together in real time.

Built using the **MERN stack (MongoDB, Express.js, React.js, and Node.js)**, SyncDoc uses **Socket.IO** for real-time communication, allowing collaborators to receive document updates and communicate within a shared workspace.

## Key Features

- **Real-Time Collaboration:** Multiple users can collaborate on shared documents with live updates using Socket.IO.
- **User Authentication:** Secure user registration and login using JWT authentication and bcrypt password hashing.
- **Document Management:** Create, edit, update, and manage documents.
- **Document Sharing:** Share documents with other users and provide controlled access.
- **Role-Based Access Control (RBAC):** Assign Owner, Editor, and Viewer roles to manage document permissions.
- **Real-Time Chat:** Communicate with collaborators within a document workspace.
- **AI-Powered Assistance:** Integrate Google Gemini AI for document-related assistance.
- **Auto-Save:** Automatically save document changes to MongoDB to maintain document persistence.

## Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Real-Time Communication | Socket.IO |
| Authentication | JWT, bcrypt |
| AI Integration | Google Gemini API |

## Project Overview

SyncDoc provides a shared workspace where users can collaborate on documents, manage access permissions, communicate through real-time chat, and work together more efficiently.

**Project URL:** https://syncdoc.netlify.app/
