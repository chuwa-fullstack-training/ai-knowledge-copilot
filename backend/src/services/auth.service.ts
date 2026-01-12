import { User, type IUser } from '../models/User';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken, type JWTPayload } from '../utils/jwt';
import logger from '../config/logger';

export interface RegisterData {
  email: string;
  password: string;
  userName?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: IUser;
  token: string;
}

export class AuthService {
  async register(data: RegisterData): Promise<AuthResponse> {
    const { email, password, userName, firstName, lastName, avatarUrl } = data;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await User.create({
      email,
      passwordHash,
      userName,
      firstName,
      lastName,
      avatarUrl,
      role: 'member',
    });

    logger.info(`User registered: ${email}`);

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return { user, token };
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const { email, password } = data;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    logger.info(`User logged in: ${email}`);

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return { user, token };
  }

  async verifyToken(token: string): Promise<JWTPayload> {
    // Token verification is handled by jwt.ts
    // This method is for additional business logic if needed
    const { verifyToken: verify } = await import('../utils/jwt');
    return verify(token);
  }

  async getUserById(userId: string): Promise<IUser | null> {
    return User.findById(userId);
  }
}

export const authService = new AuthService();
