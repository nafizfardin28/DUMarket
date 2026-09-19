import { Body, Controller, Delete, Get, Param, ParseIntPipe, Put, UseGuards } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { RateSellerDto } from './dto/rate-seller.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../common/role.guard';
import { CurrentUser } from '../auth/current-user.decorator';

const BuyerGuard = RoleGuard('buyer');

@Controller('sellers/:sellerId/ratings')
export class RatingsController {
  constructor(private readonly ratings: RatingsService) {}

  @Get()
  findAll(@Param('sellerId', ParseIntPipe) sellerId: number) {
    return this.ratings.findAllForSeller(sellerId);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard, BuyerGuard)
  findMine(@Param('sellerId', ParseIntPipe) sellerId: number, @CurrentUser() user: { id: number }) {
    return this.ratings.findMine(sellerId, user.id);
  }

  @Put()
  @UseGuards(JwtAuthGuard, BuyerGuard)
  upsert(
    @Param('sellerId', ParseIntPipe) sellerId: number,
    @CurrentUser() user: { id: number },
    @Body() dto: RateSellerDto,
  ) {
    return this.ratings.upsert(sellerId, user.id, dto);
  }

  @Delete()
  @UseGuards(JwtAuthGuard, BuyerGuard)
  remove(@Param('sellerId', ParseIntPipe) sellerId: number, @CurrentUser() user: { id: number }) {
    return this.ratings.remove(sellerId, user.id);
  }
}
