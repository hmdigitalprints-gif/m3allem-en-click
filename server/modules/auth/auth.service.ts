import prisma from "../../lib/prisma.ts";
import jwt from "jsonwebtoken";

export class AuthService {
  static async resolveUserFromToken(token: string) {
    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET missing");
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded || !decoded.id) return null;

      // In a more secure system with device tokens, we'd verify the sessionId here.
      // E.g., `await prisma.session.findUnique({ where: { token } })`
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, role: true, email: true, name: true }
      });
      return user;
    } catch {
      return null;
    }
  }

  static generateTokens(userId: string, role: string, deviceId?: string) {
    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET missing");
    
    // JWT with short expiration (1h)
    const accessToken = jwt.sign(
      { id: userId, role, deviceId }, 
      process.env.JWT_SECRET, 
      { expiresIn: "1h" }
    );
    
    // Refresh token with longer expiration (7d)
    const refreshToken = jwt.sign(
      { id: userId, role, type: 'refresh', deviceId }, 
      process.env.JWT_SECRET, 
      { expiresIn: "7d" }
    );

    return { accessToken, refreshToken };
  }
}
