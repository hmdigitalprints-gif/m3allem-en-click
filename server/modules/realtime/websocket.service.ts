import { Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "http";

let io: SocketIOServer | null = null;

export class RealtimeService {
  static init(server: HttpServer) {
    const allowedOrigins = [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:5173",
      "https://m3allem.ma",
      "https://www.m3allem.ma",
    ];

    if (process.env.APP_URL) {
      allowedOrigins.push(process.env.APP_URL);
    }

    const isOriginAllowed = (origin: string | undefined): boolean => {
      if (!origin) return true;
      if (allowedOrigins.includes(origin)) return true;
      return /^https:\/\/ais-(dev|pre)-[a-z0-9]+-\d+\.[a-z0-9-]+\.run\.app$/.test(origin);
    };

    io = new SocketIOServer(server, {
      cors: {
        origin: (origin, callback) => {
          if (isOriginAllowed(origin)) {
            callback(null, true);
          } else {
            callback(new Error("Not allowed by CORS"));
          }
        },
        credentials: true
      }
    });

    io.on("connection", (socket) => {
      console.log(`[Socket] User connected: ${socket.id}`);
      
      socket.on("join_room", (room) => {
        socket.join(room);
        console.log(`[Socket] ${socket.id} joined room ${room}`);
      });

      socket.on("leave_room", (room) => {
        socket.leave(room);
      });

      socket.on("disconnect", () => {
        console.log(`[Socket] User disconnected: ${socket.id}`);
      });
    });
  }

  static getIO() {
    return io;
  }

  static notifyUser(userId: string, eventName: string, payload: any) {
    if (io) {
      io.to(`user_${userId}`).emit(eventName, payload);
    }
  }

  static notifyAdmin(eventName: string, payload: any) {
    if (io) {
      io.to("admin_room").emit(eventName, payload);
    }
  }

  static notifyRoom(room: string, eventName: string, payload: any) {
    if (io) {
      io.to(room).emit(eventName, payload);
    }
  }
}
