import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { QueryListingsDto } from './dto/query-listings.dto';

// Deliberately smaller than the full user profile — a browsing buyer only
// needs enough to identify and contact the seller, not their registration
// number, email, or verification status.
function presentListingSeller(seller: any) {
  return {
    id: seller.id,
    full_name: seller.fullName,
    avatar: seller.avatar ? `/uploads/${seller.avatar}` : null,
    hall: seller.hall,
    phone: seller.phone,
  };
}

function presentListing(listing: any) {
  return {
    id: listing.id,
    title: listing.title,
    description: listing.description,
    price: listing.price,
    category: listing.category,
    hall: listing.hall,
    images: listing.images.map((filename: string) => `/uploads/${filename}`),
    status: listing.status,
    created_at: listing.createdAt,
    updated_at: listing.updatedAt,
    seller: listing.seller ? presentListingSeller(listing.seller) : undefined,
  };
}

@Injectable()
export class ListingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(sellerId: number, dto: CreateListingDto, imageFilenames: string[]) {
    const listing = await this.prisma.listing.create({
      data: {
        title: dto.title.trim(),
        description: dto.description.trim(),
        price: dto.price,
        category: dto.category,
        hall: dto.hall,
        images: imageFilenames,
        sellerId,
      },
      include: { seller: true },
    });
    return presentListing(listing);
  }

  async findAll(query: QueryListingsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const search = query.search?.trim();

    const where = {
      status: 'active' as const,
      ...(query.category ? { category: query.category } : {}),
      ...(query.hall ? { hall: query.hall } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' as const } },
              { description: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [listings, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        include: { seller: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.listing.count({ where }),
    ]);

    return {
      results: listings.map(presentListing),
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async findMine(sellerId: number) {
    const listings = await this.prisma.listing.findMany({
      where: { sellerId },
      include: { seller: true },
      orderBy: { createdAt: 'desc' },
    });
    return listings.map(presentListing);
  }

  async findOne(id: number) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: { seller: true },
    });
    if (!listing) throw new NotFoundException({ detail: ['Listing not found.'] });
    return presentListing(listing);
  }

  async update(id: number, userId: number, dto: UpdateListingDto, imageFilenames?: string[]) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException({ detail: ['Listing not found.'] });
    if (listing.sellerId !== userId) {
      throw new ForbiddenException({ detail: ["You can't edit someone else's listing."] });
    }

    const updated = await this.prisma.listing.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.description !== undefined ? { description: dto.description.trim() } : {}),
        ...(dto.price !== undefined ? { price: dto.price } : {}),
        ...(dto.category !== undefined ? { category: dto.category } : {}),
        ...(dto.hall !== undefined ? { hall: dto.hall } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(imageFilenames ? { images: imageFilenames } : {}),
      },
      include: { seller: true },
    });
    return presentListing(updated);
  }

  async remove(id: number, userId: number) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException({ detail: ['Listing not found.'] });
    if (listing.sellerId !== userId) {
      throw new ForbiddenException({ detail: ["You can't delete someone else's listing."] });
    }
    await this.prisma.listing.delete({ where: { id } });
    return { detail: 'Listing deleted.' };
  }
}
