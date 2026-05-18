import prisma from "../../lib/prisma.ts";

export class AnalyticsService {
  /**
   * Generates basic operational metrics
   */
  static async getPlatformStats() {
    const [
      totalUsers,
      totalArtisans,
      totalBookings,
      completedBookings
    ] = await Promise.all([
      prisma.user.count(),
      prisma.artisan.count(),
      prisma.booking.count(),
      prisma.booking.findMany({
        where: { bookingStatus: 'completed' },
        select: { price: true, commissionAmount: true }
      })
    ]);

    let totalRevenue = 0;
    let totalCommission = 0;
    
    for (const b of completedBookings) {
      if (b.price) totalRevenue += Number(b.price) || 0;
      if (b.commissionAmount) totalCommission += Number(b.commissionAmount) || 0;
    }

    return {
      totalUsers,
      totalArtisans,
      totalBookings,
      totalRevenue,
      totalCommission
    };
  }

  static async getTopArtisans(limit = 10) {
    const artisans = await prisma.artisan.findMany({
      orderBy: { rating: 'desc' },
      take: limit,
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { bookings: true } }
      }
    });

    return artisans.map(a => ({
      id: a.id,
      name: a.user?.name,
      rating: a.rating,
      completedBookings: a._count.bookings
    }));
  }

  static async getOrderCompletionRate() {
    const total = await prisma.booking.count();
    if (total === 0) return 0;
    
    const completed = await prisma.booking.count({ where: { bookingStatus: 'completed' }});
    return (completed / total) * 100;
  }
}
