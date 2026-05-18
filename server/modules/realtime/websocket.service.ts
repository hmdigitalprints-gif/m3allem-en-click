import { Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "http";

let io: SocketIOServer | null = null;

export class RealtimeService {
  static init(server: HttpServer) {
    io = new SocketIOServer(server, {
      cors: { origin: "*" }
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
