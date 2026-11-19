import { jest } from "@jest/globals";

const mockVerifyIdToken = jest.fn();
const mockFindOne = jest.fn();
const mockSave = jest.fn();

jest.unstable_mockModule("google-auth-library", () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    verifyIdToken: mockVerifyIdToken,
  })),
}));

jest.unstable_mockModule("../models/user.js", () => {
  class MockUser {
    constructor(data) {
      Object.assign(this, data);
      this._id = data._id || "user123";
      this.save = mockSave.mockResolvedValue(this);
    }
  }
  MockUser.findOne = mockFindOne;
  return { default: MockUser };
});

jest.unstable_mockModule("../config/config.js", () => ({
  default: {
    JWT_SECRET: "test-jwt-secret-at-least-32-characters-long",
    GOOGLE_CLIENT_ID: "test-google-client-id.apps.googleusercontent.com",
  },
}));

jest.unstable_mockModule("../config/redis.js", () => ({
  default: {
    set: jest.fn(),
    expireAt: jest.fn(),
    get: jest.fn(),
  },
}));

jest.unstable_mockModule("../services/profileImageGenerator.js", () => ({
  generateProfileImage: jest.fn(),
}));

jest.unstable_mockModule("../services/validator.js", () => ({
  default: jest.fn(),
}));

const { googleLogin } = await import("../controllers/userAuthenticate.js");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  return res;
};

describe("googleLogin ID token verification", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("rejects missing credential", async () => {
    const req = { body: {} };
    const res = mockRes();
    await googleLogin(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("rejects unverified email", async () => {
    mockVerifyIdToken.mockResolvedValue({
      getPayload: () => ({
        iss: "https://accounts.google.com",
        sub: "google-sub-1",
        email: "a@example.com",
        email_verified: false,
      }),
    });
    const req = { body: { credential: "fake.jwt" } };
    const res = mockRes();
    await googleLogin(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("rejects email collision without googleId (no silent link)", async () => {
    mockVerifyIdToken.mockResolvedValue({
      getPayload: () => ({
        iss: "https://accounts.google.com",
        sub: "google-sub-2",
        email: "existing@example.com",
        email_verified: true,
        given_name: "Ada",
      }),
    });
    mockFindOne
      .mockResolvedValueOnce(null) // by googleId
      .mockResolvedValueOnce({
        emailId: "existing@example.com",
        googleId: undefined,
      });

    const req = { body: { credential: "fake.jwt" } };
    const res = mockRes();
    await googleLogin(req, res);
    expect(res.status).toHaveBeenCalledWith(409);
  });

  test("creates new Google user and returns token", async () => {
    mockVerifyIdToken.mockResolvedValue({
      getPayload: () => ({
        iss: "https://accounts.google.com",
        sub: "google-sub-3",
        email: "new@example.com",
        email_verified: true,
        given_name: "Grace",
      }),
    });
    mockFindOne.mockResolvedValue(null);

    const req = { body: { credential: "fake.jwt" } };
    const res = mockRes();
    await googleLogin(req, res);
    expect(mockSave).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        token: expect.any(String),
        user: expect.objectContaining({ emailId: "new@example.com" }),
      }),
    );
  });

  test("logs in existing googleId user", async () => {
    mockVerifyIdToken.mockResolvedValue({
      getPayload: () => ({
        iss: "accounts.google.com",
        sub: "google-sub-4",
        email: "g@example.com",
        email_verified: true,
      }),
    });
    mockFindOne.mockResolvedValueOnce({
      _id: "existing-id",
      emailId: "g@example.com",
      firstName: "G",
      role: "user",
      profileImage: null,
      emailVerified: true,
      googleId: "google-sub-4",
    });

    const req = { body: { credential: "fake.jwt" } };
    const res = mockRes();
    await googleLogin(req, res);
    expect(mockSave).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        token: expect.any(String),
      }),
    );
  });
});
