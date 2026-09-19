import { PartialType } from '@nestjs/mapped-types';
import { IsIn, IsOptional } from 'class-validator';
import { CreateListingDto } from './create-listing.dto';

export class UpdateListingDto extends PartialType(CreateListingDto) {
  @IsOptional()
  @IsIn(['active', 'sold'], { message: 'Status must be either "active" or "sold".' })
  status?: 'active' | 'sold';
}
