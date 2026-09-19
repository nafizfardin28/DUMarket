import { IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsString()
  refresh!: string;
}
