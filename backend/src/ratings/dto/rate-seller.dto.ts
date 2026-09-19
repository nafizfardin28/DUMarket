import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class RateSellerDto {
  @IsInt({ message: 'Rating must be a whole number.' })
  @Min(1, { message: 'Rating must be between 1 and 5 stars.' })
  @Max(5, { message: 'Rating must be between 1 and 5 stars.' })
  stars!: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Comment must be at most 1000 characters.' })
  comment?: string;
}
