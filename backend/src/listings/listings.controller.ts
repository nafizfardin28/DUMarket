import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ListingsService } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { QueryListingsDto } from './dto/query-listings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../common/role.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { imageUploadOptions } from '../common/image-upload';

const SellerGuard = RoleGuard('seller');
const MAX_IMAGES_PER_LISTING = 4;

@Controller('listings')
export class ListingsController {
  constructor(private readonly listings: ListingsService) {}

  @Get()
  findAll(@Query() query: QueryListingsDto) {
    return this.listings.findAll(query);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard, SellerGuard)
  findMine(@CurrentUser() user: { id: number }) {
    return this.listings.findMine(user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.listings.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, SellerGuard)
  @UseInterceptors(FilesInterceptor('images', MAX_IMAGES_PER_LISTING, imageUploadOptions('images', MAX_IMAGES_PER_LISTING)))
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: { id: number },
    @Body() dto: CreateListingDto,
    @UploadedFiles() images: Express.Multer.File[] = [],
  ) {
    return this.listings.create(user.id, dto, images.map((f) => f.filename));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, SellerGuard)
  @UseInterceptors(FilesInterceptor('images', MAX_IMAGES_PER_LISTING, imageUploadOptions('images', MAX_IMAGES_PER_LISTING)))
  update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number },
    @Body() dto: UpdateListingDto,
    @UploadedFiles() images?: Express.Multer.File[],
  ) {
    const imageFilenames = images && images.length > 0 ? images.map((f) => f.filename) : undefined;
    return this.listings.update(id, user.id, dto, imageFilenames);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, SellerGuard)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: { id: number }) {
    return this.listings.remove(id, user.id);
  }
}
