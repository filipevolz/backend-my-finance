"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const crypto_1 = require("crypto");
const users_service_1 = require("../users/users.service");
const email_service_1 = require("./email.service");
let AuthService = class AuthService {
    usersService;
    jwtService;
    emailService;
    constructor(usersService, jwtService, emailService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }
    async register(registerDto) {
        const user = await this.usersService.create(registerDto);
        const payload = { sub: user.id, email: user.email };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
            },
        };
    }
    async login(loginDto) {
        const user = await this.usersService.validateUser(loginDto);
        if (!user) {
            throw new common_1.UnauthorizedException('Credenciais inválidas');
        }
        const payload = { sub: user.id, email: user.email };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
            },
        };
    }
    async forgotPassword(forgotPasswordDto) {
        const { email } = forgotPasswordDto;
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new common_1.NotFoundException('Usuário não encontrado');
        }
        const resetToken = (0, crypto_1.randomBytes)(32).toString('hex');
        const resetTokenExpires = new Date();
        resetTokenExpires.setHours(resetTokenExpires.getHours() + 1);
        await this.usersService.updateResetPasswordToken(email, resetToken, resetTokenExpires);
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
        await this.emailService.sendPasswordResetEmail(user.email, resetUrl);
        return {
            message: 'E-mail de recuperação de senha enviado com sucesso',
        };
    }
    async resetPassword(resetPasswordDto) {
        const { token, password } = resetPasswordDto;
        const user = await this.usersService.findByResetToken(token);
        if (!user) {
            throw new common_1.BadRequestException('Token inválido');
        }
        if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
            throw new common_1.BadRequestException('Token expirado');
        }
        await this.usersService.updatePassword(user.id, password);
        return {
            message: 'Senha redefinida com sucesso',
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        email_service_1.EmailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map