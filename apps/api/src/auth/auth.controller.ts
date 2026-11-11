import { CurrentUser, Public, SignInService } from "@nestjs/authentication";
import { Controller } from "@nestjs/common/decorators/core/index.js";
import { Post } from "@nestjs/common/decorators/http/index.js";
import { HttpCode } from "@nestjs/common/decorators/http/index.js";
import type { User } from '@anderhalf/contracts/user';

@Controller('auth')
export class AuthController {
    constructor(private readonly signInService: SignInService) {}
    
    @Post('logout')
    @HttpCode(204)
    @Public()
    async logout() {
        await this.signInService.signOut();
    }

    @Post('logout-all')
    @HttpCode(204)
    async logoutAll(@CurrentUser() user: User) {
        await this.signInService.signOutEverywhere(user.id);
    }
}