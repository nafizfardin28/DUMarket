import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RateSellerDto } from './dto/rate-seller.dto';

function presentRatingBuyer(buyer: any) {
  return {
    id: buyer.id,
    full_name: buyer.fullName,
    avatar: buyer.avatar ? `/uploads/${buyer.avatar}` : null,
  };
}

function presentRating(rating: any) {
  return {
    id: rating.id,
    stars: rating.stars,
    comment: rating.comment,
    created_at: rating.createdAt,
    buyer: rating.buyer ? presentRatingBuyer(rating.buyer) : undefined,
  };
}

@Injectable()
export class RatingsService {
  constructor(private readonly prisma: PrismaService) {}

  private async requireSeller(sellerId: number) {
    const seller = await this.prisma.user.findUnique({ where: { id: sellerId } });
    if (!seller || seller.role !== 'seller') {
      throw new NotFoundException({ detail: ['Seller not found.'] });
    }
    return seller;
  }

  async findAllForSeller(sellerId: number) {
    await this.requireSeller(sellerId);

    const [ratings, agg] = await Promise.all([
      this.prisma.rating.findMany({
        where: { sellerId },
        include: { buyer: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.rating.aggregate({
        where: { sellerId },
        _avg: { stars: true },
        _count: true,
      }),
    ]);

    return {
      results: ratings.map(presentRating),
      average: agg._avg.stars ?? 0,
      count: agg._count,
    };
  }

  async findMine(sellerId: number, buyerId: number) {
    const rating = await this.prisma.rating.findUnique({
      where: { sellerId_buyerId: { sellerId, buyerId } },
    });
    return rating ? { stars: rating.stars, comment: rating.comment } : null;
  }

  async upsert(sellerId: number, buyerId: number, dto: RateSellerDto) {
    await this.requireSeller(sellerId);

    if (sellerId === buyerId) {
      throw new BadRequestException({ detail: ["You can't rate yourself."] });
    }

    const rating = await this.prisma.rating.upsert({
      where: { sellerId_buyerId: { sellerId, buyerId } },
      update: { stars: dto.stars, comment: dto.comment?.trim() || null },
      create: { sellerId, buyerId, stars: dto.stars, comment: dto.comment?.trim() || null },
      include: { buyer: true },
    });

    return presentRating(rating);
  }

  async remove(sellerId: number, buyerId: number) {
    await this.prisma.rating.deleteMany({ where: { sellerId, buyerId } });
    return { detail: 'Rating removed.' };
  }
}
