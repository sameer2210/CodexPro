import { jest } from "@jest/globals";

/**
 * Mocked Google ID-token verification security suite.
 * Does NOT exercise live Google Identity Services / browser GIS.
 */

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
      this._id = data._id || "user-sec-1";
      this.save = mockSave.mockResolvedValue(this);
    }
  }
  MockUser.findOne = mockFindOne;
  return { default: MockUser };
});

jest.unstable_mockModule("../config/config.js", () => ({
  default: {
    JWT_SECRET: "test-jwt-secret-at-least-32-characters-long",
    GOOGLE_CLIENT_ID: "expected-audience.apps.googleusercontent.com",
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

describe("googleLogin security (mocked verification)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("rejects invalid/expired credential (library throws)", async () => {
    mockVerifyIdToken.mockRejectedValue(
      new Error("Invalid token signature: jwt malformed"),
    );
    const res = mockRes();
    await googleLogin({ body: { credential: "expired.or.bad" } }, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringMatching(/invalid or expired google credential/i),
      }),
    );
  });

  test("rejects wrong audience (Wrong recipient)", async () => {
    mockVerifyIdToken.mockRejectedValue(
      new Error("Wrong recipient, payload audience != requiredAudience"),
    );
    const res = mockRes();
    await googleLogin({ body: { credential: "wrong.aud.token" } }, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringMatching(/invalid or expired google credential/i),
      }),
    );
  });

  test("rejects invalid issuer even if verifyIdToken returns payload", async () => {
    mockVerifyIdToken.mockResolvedValue({
      getPayload: () => ({
        iss: "https://evil.example.com",
        sub: "sub-x",
        email: "x@example.com",
        email_verified: true,
      }),
    });
    const res = mockRes();
    await googleLogin({ body: { credential: "bad.iss" } }, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringMatching(/issuer/i) }),
    );
  });

  test("email collision: password account without googleId → 409", async () => {
    mockVerifyIdToken.mockResolvedValue({
      getPayload: () => ({
        iss: "https://accounts.google.com",
        sub: "new-google-sub",
        email: "taken@example.com",
        email_verified: true,
        given_name: "Taken",
      }),
    });
    mockFindOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        emailId: "taken@example.com",
        googleId: undefined,
      });
    const res = mockRes();
    await googleLogin({ body: { credential: "tok" } }, res);
    expect(res.status).toHaveBeenCalledWith(409);
  });

  test("duplicate identity: email linked to different googleId → 409", async () => {
    mockVerifyIdToken.mockResolvedValue({
      getPayload: () => ({
        iss: "https://accounts.google.com",
        sub: "attacker-sub",
        email: "linked@example.com",
        email_verified: true,
        given_name: "Linked",
      }),
    });
    mockFindOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        emailId: "linked@example.com",
        googleId: "legitimate-sub",
      });
    const res = mockRes();
    await googleLogin({ body: { credential: "tok" } }, res);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringMatching(/different google account/i),
      }),
    );
  });

  test("unauthorized: missing credential → 400", async () => {
    const res = mockRes();
    await googleLogin({ body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
