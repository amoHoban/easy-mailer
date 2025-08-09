import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { EmailVerification } from '@/types';

class VerificationService {
  private readonly secret: string;
  private readonly verifications = new Map<string, EmailVerification>();

  constructor() {
    this.secret = process.env.JWT_SECRET || 'easy-mailer-secret-' + uuidv4();
  }

  createVerification(
    email: string,
    templateId: string,
    variables: Record<string, string>,
    subject: string
  ): string {
    const token = jwt.sign(
      { 
        email, 
        templateId,
        id: uuidv4(),
      },
      this.secret,
      { expiresIn: '1h' }
    );

    const verification: EmailVerification = {
      token,
      email,
      templateId,
      variables,
      subject,
      expiresAt: new Date(Date.now() + 3600000),
      verified: false,
    };

    this.verifications.set(token, verification);
    this.cleanupExpired();

    return token;
  }

  verifyToken(token: string): EmailVerification | null {
    try {
      jwt.verify(token, this.secret);
      
      const verification = this.verifications.get(token);
      if (verification && verification.expiresAt > new Date()) {
        verification.verified = true;
        return verification;
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  deleteVerification(token: string): void {
    this.verifications.delete(token);
  }

  private cleanupExpired(): void {
    const now = new Date();
    for (const [token, verification] of this.verifications.entries()) {
      if (verification.expiresAt <= now) {
        this.verifications.delete(token);
      }
    }
  }
}

export const verificationService = new VerificationService();