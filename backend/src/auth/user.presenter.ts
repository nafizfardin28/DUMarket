import { User } from '@prisma/client';

/** Shapes a Prisma User row into exactly the JSON the frontend expects
 * (same field names the old Django UserSerializer produced). */
export function presentUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    full_name: user.fullName,
    avatar: user.avatar ? `/uploads/${user.avatar}` : null,
    regNo: user.regNo,
    role: user.role,
    hall: user.hall,
    phone: user.phone,
    is_email_verified: user.isEmailVerified,
    date_joined: user.dateJoined,
  };
}
