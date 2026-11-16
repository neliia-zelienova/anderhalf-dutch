import { Module } from "@nestjs/common";
import { FsrsService } from "./fsrs.service.ts";

@Module({
    providers: [FsrsService],
    exports: [FsrsService],
})
export class FsrsModule {}