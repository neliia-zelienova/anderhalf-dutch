import { vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { SignInService } from './sign-in.service';
import { UsersRepository } from '../users/users.repository';
import { MagicLinkService } from './magic-link.service';
import { SessionsService } from './sessions.service';
import { UnauthorizedException } from '@nestjs/common/exceptions/index.js';

const fakeUsersRepository = {
  findByEmail: vi.fn(),
  create: vi.fn(),
};
const fakeSessionsService = {
  create: vi.fn(),
  findValid: vi.fn(),
  delete: vi.fn(),
};

const fakeMagicLinkService = {
  sendMagicLink: vi.fn(),
  consumeMagicLink: vi.fn(),
};

describe('SignInService', () => {
  let signInService: SignInService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        SignInService,
        { provide: UsersRepository, useValue: fakeUsersRepository },
        { provide: SessionsService, useValue: fakeSessionsService },
        { provide: MagicLinkService, useValue: fakeMagicLinkService },
      ],
    }).compile();

    signInService = moduleRef.get(SignInService);
  });

  describe('createMagicLink', () => {
    it('creates a magic link for the given email', async () => {
      const email = 'test@example.com';
      await signInService.createMagicLink(email);
      expect(fakeMagicLinkService.sendMagicLink).toHaveBeenCalledWith(email);
    });
  });

  describe('signInWithMagicLink', () => {
    it('throws an error if the magic link token is invalid', async () => {
      const magicLinkToken = 'invalid-magic-link-token';
      fakeMagicLinkService.consumeMagicLink.mockRejectedValue(
        new UnauthorizedException(),
      );
      await expect(
        signInService.signInWithMagicLink(magicLinkToken),
      ).rejects.toThrow(UnauthorizedException);
    });
    it('signs up not existing user with a valid magic link token', async () => {
      const magicLinkToken = 'magic-link-token';
      const sessionToken = 'session-token';
      const email = 'test@example.com';
      const userId = 'new_user_id';
      fakeMagicLinkService.consumeMagicLink.mockResolvedValue(email);
      fakeUsersRepository.findByEmail.mockResolvedValue(null);
      fakeUsersRepository.create.mockResolvedValue({
        id: userId,
        email: email,
      });
      fakeSessionsService.create.mockResolvedValue(sessionToken);
      const result = await signInService.signInWithMagicLink(magicLinkToken);
      expect(fakeUsersRepository.create).toHaveBeenCalledWith(email, {
        emailVerified: true,
      });
      expect(fakeSessionsService.create).toHaveBeenCalledWith(userId);
      expect(result).toBe(sessionToken);
    });
    it('signs in existing user with a valid magic link token', async () => {
      const magicLinkToken = 'magic-link-token';
      const sessionToken = 'session-token';
      const email = 'existing_user@example.com';
      const userId = 'existing_user_id';
      fakeMagicLinkService.consumeMagicLink.mockResolvedValue(email);
      fakeUsersRepository.findByEmail.mockResolvedValue({
        id: userId,
        email: email,
      });
      fakeSessionsService.create.mockResolvedValue(sessionToken);
      const result = await signInService.signInWithMagicLink(magicLinkToken);
      expect(fakeUsersRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(fakeUsersRepository.create).not.toHaveBeenCalled();
      expect(fakeSessionsService.create).toHaveBeenCalledWith(userId);
      expect(result).toBe(sessionToken);
    });
  });
});
