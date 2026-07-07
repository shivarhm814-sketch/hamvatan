import { IsString } from 'class-validator';

export class UpdateInternalNotesDto {
  @IsString()
  internalNotes!: string;
}
