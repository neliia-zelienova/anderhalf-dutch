import { vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { MagicLinkService } from './magic-link.service.ts';
import { ConfigService } from '@nestjs/config';
import { AuthRepository } from './auth-repository.ts';
import { hashToken } from './token.utils.ts';
import { MAGIC_LINK_TTL } from '../constants/auth.constants.ts';
import { UnauthorizedException } from '@nestjs/common/exceptions/index.js';

const fakeAuthRepository = {
  saveMagicLink: vi.fn(),
  consumeMagicLink: vi.fn(),
};

vi.mock('./token.utils.ts', async (importOriginal) => {
  const originalModule: {
    hashToken: (token: string) => string;
    generateToken: () => string;
  } = await importOriginal();
  return {
    generateToken() {
      return 'generated-token';
    },
    hashToken: vi.fn(originalModule?.hashToken),
  };
});

describe('MagicLinkService', () => {
  let magicLinkService: MagicLinkService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        MagicLinkService,
        { provide: AuthRepository, useValue: fakeAuthRepository },
        { provide: ConfigService, useValue: { get: vi.fn() } },
      ],
    }).compile();
    magicLinkService = moduleRef.get(MagicLinkService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('sendMagicLink', () => {
    it('send a magic link', async () => {
      const email = 'test@example.com';
      const hashedToken = hashToken('generated-token');
      vi.useFakeTimers();
      const now = new Date('2026-01-01T12:00:00Z');
      vi.setSystemTime(now);
      await magicLinkService.sendMagicLink(email);
      expect(fakeAuthRepository.saveMagicLink).toHaveBeenCalledWith(
        hashedToken,
        email,
        new Date(now.getTime() + MAGIC_LINK_TTL * 1000),
      );
    });
  });

  describe('consumeMagicLink', () => {
    it('rejects an expired magic link', async () => {
      const token = 'generated-token';
      const hashedToken = hashToken(token);
      fakeAuthRepository.consumeMagicLink.mockResolvedValue({
        id: hashedToken,
        email: 'test@example.com',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() - MAGIC_LINK_TTL * 1000),
        redirectTo: null,
      });
      await expect(magicLinkService.consumeMagicLink(token)).rejects.toThrow(
        UnauthorizedException,
      );
    });
    it('rejects incorrect magic link', async () => {
      const token = 'incorrect-generated-token';
      fakeAuthRepository.consumeMagicLink.mockResolvedValue(null);
      await expect(magicLinkService.consumeMagicLink(token)).rejects.toThrow(
        UnauthorizedException,
      );
    });
    it('consume a magic link', async () => {
      const token = 'generated-token';
      const email = 'test@example.com';
      const hashedToken = hashToken(token);
      fakeAuthRepository.consumeMagicLink.mockResolvedValue({
        id: hashedToken,
        email,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + MAGIC_LINK_TTL * 1000),
        redirectTo: null,
      });
      const result = await magicLinkService.consumeMagicLink(token);
      expect(fakeAuthRepository.consumeMagicLink).toHaveBeenCalledWith(
        hashedToken,
      );
      expect(result).toBe(email);
    });
  });
});
