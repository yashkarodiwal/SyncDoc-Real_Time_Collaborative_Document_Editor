
import { io } from "socket.io-client";

export const socket = io("https://syncdoc.onrender.com", {
    autoConnect: false,
    auth: {
        token: localStorage.getItem("token")
    }
});
