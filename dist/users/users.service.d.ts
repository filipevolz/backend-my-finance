import { Repository } from 'typeorm';
import { User } from './user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class UsersService {
    private usersRepository;
    constructor(usersRepository: Repository<User>);
    create(registerDto: RegisterDto): Promise<User>;
    findByEmailOrPhone(emailOrPhone: string): Promise<User | null>;
    validateUser(loginDto: LoginDto): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    updateResetPasswordToken(email: string, token: string, expires: Date): Promise<void>;
    findByResetToken(token: string): Promise<User | null>;
    updatePassword(userId: string, newPassword: string): Promise<void>;
    findById(id: string): Promise<User | null>;
}
