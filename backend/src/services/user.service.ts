import { User, type IUser } from '../models/User';
import logger from '../config/logger';

export interface UpdateProfileData {
  userName?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

export class UserService {
  async getProfile(userId: string): Promise<IUser | null> {
    return User.findById(userId);
  }

  async updateProfile(userId: string, data: UpdateProfileData): Promise<IUser | null> {
    const { userName, firstName, lastName, avatarUrl } = data;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        ...(userName !== undefined && { userName }),
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
      { new: true, runValidators: true }
    );

    if (user) {
      logger.info(`Profile updated for user: ${userId}`);
    }

    return user;
  }

  async deleteAccount(userId: string): Promise<boolean> {
    const result = await User.findByIdAndDelete(userId);

    if (result) {
      logger.info(`User account deleted: ${userId}`);
      return true;
    }

    return false;
  }
}

export const userService = new UserService();
