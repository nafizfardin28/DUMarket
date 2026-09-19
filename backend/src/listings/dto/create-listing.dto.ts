import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export const LISTING_CATEGORIES = ['food', 'books', 'electronics', 'clothing', 'other'] as const;

export class CreateListingDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required.' })
  title!: string;

  @IsString()
  @IsNotEmpty({ message: 'Description is required.' })
  description!: string;

  @Type(() => Number)
  @IsInt({ message: 'Price must be a whole number.' })
  @Min(1, { message: 'Price must be at least 1 taka.' })
  price!: number;

  @IsIn(LISTING_CATEGORIES, { message: 'Please select a valid category.' })
  category!: (typeof LISTING_CATEGORIES)[number];

  @IsString()
  @IsNotEmpty({ message: 'Please select your hall.' })
  hall!: string;
}
