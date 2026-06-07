import prisma from "../../lib/prisma.ts";

export class ArtisanService {
  static async getArtisanProfile(artisanId: string) {
    const artisan = await prisma.artisan.findUnique({
      where: { id: artisanId },
      include: {
        user: true,
        services: true,
        ratings: {
          include: { client: { select: { name: true, avatarUrl: true } } }
        }
      }
    });

    if (!artisan) throw new Error("Artisan not found");
    return artisan;
  }

  static async updateArtisanStatus(artisanId: string, isOnline: boolean) {
    return await prisma.artisan.update({
      where: { id: artisanId },
      data: { isOnline }
    });
  }
}
