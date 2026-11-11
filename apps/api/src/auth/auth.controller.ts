import { CurrentUser, Public, SignInService } from "@nestjs/authentication";
import type { User } from '@anderhalf/contracts/user';
import { Controller, HttpCode, Post } from "@nestjs/common";

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