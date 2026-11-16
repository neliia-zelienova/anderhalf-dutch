import { IsUUID } from "class-validator";

export class WordDto {
    @IsUUID()
    wordId: string;
}