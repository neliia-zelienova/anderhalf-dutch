import { vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { SessionsService } from './sessions.service.ts';
import { AuthRepository } from './auth-repository.ts';
import { hashToken } from './token.utils.ts';
import { SESSION_TOUCH_INTERVAL, SESSION_TTL } from '../constants/auth.constants.ts';

const fakeRepo = {
  createSession: vi.fn(),
  findSession: vi.fn(),
  updateSession: vi.fn(),
  deleteSession: vi.fn()
};

const TEST_USER_ID = 'test-user-id';

describe('SessionsService', () => {
  let sessionsService: SessionsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
        providers: [SessionsService, { provide: AuthRepository, useValue: fakeRepo }],
      }).compile();

    sessionsService = moduleRef.get(SessionsService);
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.useRealTimers();
  })


  describe('create', () => {
    it('saves the session in DB', async () => {
        await sessionsService.create(TEST_USER_ID);
        expect(fakeRepo.createSession).toHaveBeenCalledTimes(1);
    });
    it('saves the session with the correct user ID', async () => {
        await sessionsService.create(TEST_USER_ID);
        expect(fakeRepo.createSession).toHaveBeenCalledWith(expect.objectContaining({
          userId: TEST_USER_ID,
        }));
    })
    it('returns a 43-character base64url token', async () => {
      const token = await sessionsService.create(TEST_USER_ID);
      expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    });
    it('creates a session DB row with the correct user ID', async () => {
        const token = await sessionsService.create(TEST_USER_ID);
        const hashedToken = fakeRepo.createSession.mock.calls[0][0].id;
        expect(hashedToken).toBe(hashToken(token));
        expect(hashedToken).not.toBe(token);
    });
  });

  describe('findValid', () => {
    it('return null for invalid session', async () => {
        fakeRepo.findSession.mockResolvedValue(null)
        const result = await sessionsService.findValid('invalid-token');
        expect(result).toBeNull();
    });
    it('return null when session is expired', async () => {
        const expiredToken = 'expired-token';
        fakeRepo.findSession.mockResolvedValue({
          id: hashToken(expiredToken),
          userId: TEST_USER_ID,
          expiresAt: new Date(),
          lastActiveAt: new Date()
        });
        vi.useFakeTimers({ now: Date.now() + 1000 });
        const result = await sessionsService.findValid(expiredToken);
        expect(result).toBeNull();
    });
    it('returns the session for a valid token', async () => {
        const validToken = 'valid-token';
        fakeRepo.findSession.mockResolvedValue({
          id: hashToken(validToken),
          userId: TEST_USER_ID,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
          lastActiveAt: new Date()
        });
        const result = await sessionsService.findValid(validToken);
        expect(result?.session).not.toBeNull();
        expect(result?.session.userId).toBe(TEST_USER_ID);
    });
    it('returns extended false if last activity less then SESSION_TOUCH_INTERVAL', async () => {
        const validToken = 'valid-token';
        fakeRepo.findSession.mockResolvedValue({
          id: hashToken(validToken),
          userId: TEST_USER_ID,
          expiresAt: new Date(Date.now() + SESSION_TTL * 1000),
          lastActiveAt: new Date()
        });
        vi.useFakeTimers({ now: Date.now() + SESSION_TOUCH_INTERVAL - 1000 });
        const result = await sessionsService.findValid(validToken);
        expect(result?.extended).toBe(false);
        expect(fakeRepo.updateSession).not.toHaveBeenCalled();
    })
    it('returns extended true if last activity more then SESSION_TOUCH_INTERVAL', async () => {
        const validToken = 'valid-token';
        fakeRepo.findSession.mockResolvedValue({
          id: hashToken(validToken),
          userId: TEST_USER_ID,
          expiresAt: new Date(Date.now() + SESSION_TTL * 1000),
          lastActiveAt: new Date()
        });
        vi.useFakeTimers({ now: Date.now() + SESSION_TOUCH_INTERVAL + 1000 });
        const result = await sessionsService.findValid(validToken);
        expect(result?.extended).toBe(true);
        expect(fakeRepo.updateSession).toHaveBeenCalled();
    })
  })

  describe('delete', () => {
    it('deletes the session by token hash', async () => {
        const token = 'valid-token';
        const hashedToken = hashToken(token);
        await sessionsService.delete(token);
        expect(fakeRepo.deleteSession).toHaveBeenCalledWith(hashedToken);
    });
  });
});