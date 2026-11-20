import { jest } from "@jest/globals";
import { applyAuthTestEnv } from "./helpers/testEnv.js";

applyAuthTestEnv();

const mockRedis = {
  connect: jest.fn().mockResolvedValue(undefined),
  set: jest.fn().mockResolvedValue("OK"),
  get: jest.fn().mockResolvedValue(null),
  del: jest.fn().mockResolvedValue(1),
  exists: jest.fn().mockResolvedValue(0),
  expire: jest.fn().mockResolvedValue(1),
  expireAt: jest.fn().mockResolvedValue(1),
  zAdd: jest.fn().mockResolvedValue(1),
  zCard: jest.fn().mockResolvedValue(0),
  zRemRangeByScore: jest.fn().mockResolvedValue(0),
};

jest.unstable_mockModule("../config/redis.js", () => ({
  default: mockRedis,
}));

jest.unstable_mockModule("../services/profileImageGenerator.js", () => ({
  generateProfileImage: jest
    .fn()
    .mockResolvedValue("https://cdn.test/avatar.png"),
}));

const mockVerifyIdToken = jest.fn();
jest.unstable_mockModule("google-auth-library", () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    verifyIdToken: mockVerifyIdToken,
  })),
}));

const { MongoMemoryServer } = await import("mongodb-memory-server");
const mongoose = await import("mongoose");
const request = (await import("supertest")).default;
const app = (await import("../app.js")).default;
const User = (await import("../models/user.js")).default;
const Team = (await import("../models/team.model.js")).default;

describe("Auth integration (dedicated memory DB)", () => {
  let mongod;
  const suffix = Date.now();

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri("codex-auth-test");
    process.env.MONGODB_URI = uri;
    await mongoose.default.connect(uri);
  });

  afterAll(async () => {
    await mongoose.default.disconnect();
    if (mongod) await mongod.stop();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    mockRedis.exists.mockResolvedValue(0);
    await User.deleteMany({});
    await Team.deleteMany({});
  });

  describe("Academy register / login / protected routes", () => {
    test("registers user and rejects duplicate email", async () => {
      const email = `learner_${suffix}@example.com`;
      const res = await request(app).post("/api/user/register").send({
        firstName: "Learner",
        emailId: email,
        password: "secret123",
        confirmPassword: "secret123",
      });
      expect(res.status).toBe(201);
      expect(res.body.token).toBeTruthy();
      expect(res.body.user.emailId).toBe(email);

      const dup = await request(app).post("/api/user/register").send({
        firstName: "Other",
        emailId: email,
        password: "secret123",
        confirmPassword: "secret123",
      });
      expect(dup.status).toBe(400);
    });

    test("login requires verified email; succeeds after verification", async () => {
      const email = `verify_${suffix}@example.com`;
      await request(app).post("/api/user/register").send({
        firstName: "VerifyMe",
        emailId: email,
        password: "secret123",
        confirmPassword: "secret123",
      });

      const blocked = await request(app).post("/api/user/login").send({
        emailId: email,
        password: "secret123",
      });
      expect(blocked.status).toBe(403);
      expect(blocked.body.needsVerification).toBe(true);

      await User.updateOne({ emailId: email }, { emailVerified: true });

      const ok = await request(app).post("/api/user/login").send({
        emailId: email.toUpperCase(),
        password: "secret123",
      });
      expect(ok.status).toBe(200);
      expect(ok.body.token).toBeTruthy();
    });

    test("protected route returns 401 without token", async () => {
      const res = await request(app).get("/api/user/check");
      expect(res.status).toBe(401);
    });

    test("protected route accepts academy Bearer token", async () => {
      const email = `bearer_${suffix}@example.com`;
      await request(app).post("/api/user/register").send({
        firstName: "Bearer",
        emailId: email,
        password: "secret123",
        confirmPassword: "secret123",
      });
      await User.updateOne({ emailId: email }, { emailVerified: true });
      const login = await request(app).post("/api/user/login").send({
        emailId: email,
        password: "secret123",
      });
      const token = login.body.token;

      const check = await request(app)
        .get("/api/user/check")
        .set("Authorization", `Bearer ${token}`);
      expect(check.status).toBe(200);
      expect(check.body.user.emailId).toBe(email);
    });

    test("logout then blocked token is rejected (scoped denylist)", async () => {
      const email = `logout_${suffix}@example.com`;
      await request(app).post("/api/user/register").send({
        firstName: "Logout",
        emailId: email,
        password: "secret123",
        confirmPassword: "secret123",
      });
      await User.updateOne({ emailId: email }, { emailVerified: true });
      const login = await request(app).post("/api/user/login").send({
        emailId: email,
        password: "secret123",
      });
      const token = login.body.token;

      mockRedis.exists.mockResolvedValue(0);
      const out = await request(app)
        .post("/api/user/logout")
        .set("Authorization", `Bearer ${token}`);
      expect(out.status).toBe(200);
      expect(mockRedis.set).toHaveBeenCalled();

      mockRedis.exists.mockResolvedValue(1);
      const denied = await request(app)
        .get("/api/user/check")
        .set("Authorization", `Bearer ${token}`);
      expect(denied.status).toBe(401);
      expect(denied.body.message).toMatch(/session expired/i);
    });
  });

  describe("Team register / login / isolation", () => {
    test("registers and logs in team; academy token rejected on team verify", async () => {
      const teamName = `team${suffix}`;
      const reg = await request(app).post("/api/auth/register").send({
        teamName,
        username: "captain",
        password: "secret123",
      });
      expect(reg.status).toBe(201);

      const login = await request(app).post("/api/auth/login").send({
        teamName,
        username: "captain",
        password: "secret123",
      });
      expect(login.status).toBe(200);
      expect(login.body.token).toBeTruthy();

      const teamToken = login.body.token;

      // Team JWT must not unlock academy userMiddleware (missing _id)
      const academyDenied = await request(app)
        .get("/api/user/check")
        .set("Authorization", `Bearer ${teamToken}`);
      expect(academyDenied.status).toBe(401);

      // Academy JWT must not unlock team verifyToken
      const email = `iso_${suffix}@example.com`;
      await request(app).post("/api/user/register").send({
        firstName: "IsoUser",
        emailId: email,
        password: "secret123",
        confirmPassword: "secret123",
      });
      await User.updateOne({ emailId: email }, { emailVerified: true });
      const acadLogin = await request(app).post("/api/user/login").send({
        emailId: email,
        password: "secret123",
      });
      const academyToken = acadLogin.body.token;

      const teamDenied = await request(app)
        .get("/api/auth/verify")
        .set("Authorization", `Bearer ${academyToken}`);
      expect(teamDenied.status).toBe(401);
    });

    test("rejects wrong team password", async () => {
      const teamName = `badpw${suffix}`;
      await request(app).post("/api/auth/register").send({
        teamName,
        username: "captain",
        password: "secret123",
      });
      const res = await request(app).post("/api/auth/login").send({
        teamName,
        username: "captain",
        password: "wrong-password",
      });
      expect(res.status).toBe(401);
    });
  });

  describe("Google Sign-In via HTTP (mocked verification — not live GIS)", () => {
    test("POST /api/user/googleLogin creates user with mocked ID token", async () => {
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({
          iss: "https://accounts.google.com",
          sub: `g-sub-${suffix}`,
          email: `google_${suffix}@example.com`,
          email_verified: true,
          given_name: "Gigi",
        }),
      });

      const res = await request(app)
        .post("/api/user/googleLogin")
        .send({ credential: "mock.google.id.token" });
      expect(res.status).toBe(200);
      expect(res.body.token).toBeTruthy();
      expect(res.body.user.emailId).toBe(`google_${suffix}@example.com`);
    });
  });
});
