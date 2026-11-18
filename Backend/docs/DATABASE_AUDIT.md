# CodeX Database & Backend Architecture Audit

## 1. Executive Summary

This document presents a comprehensive, production-grade audit of the CodeX backend architecture and MongoDB database schemas. CodeX is evolving from a collaborative code editor into a unified developer learning, collaboration, AI assistance, and competitive programming platform.

During this audit, every route, controller, service, middleware, model, and frontend consumer in the repository was analyzed. This audit establishes the baseline facts, critical architectural flaws, data integrity vulnerabilities, scalability bottlenecks, security gaps, and migration risks present in the legacy implementation.

---

## 2. Existing Architecture Overview

The existing backend is built with **Node.js + Express** (ES Modules), **MongoDB + Mongoose**, **Socket.IO**, and **JWT**.

### 2.1 The Two Disconnected Identity Systems

The most critical architectural finding is that **two completely separate authentication and identity systems** coexist in the backend:

1. **Legacy Team-Based Auth (`/api/auth`)**:
   - Backed by `Team` (`team.model.js`).
   - Uses `teamName`, `username`, and a _shared team password_.
   - Stores members embedded inside `team.members` array.
   - Issues JWT containing `{ teamName, username, isAdmin, memberId }`.
   - Used by: Collaborative Code Editor, Project Management (`/api/projects`), Project Messages (`/api/messages`), WebRTC signaling (`/api/webrtc`), Socket.IO connections.

2. **User Account Auth (`/api/user`)**:
   - Backed by `User` (`user.js`).
   - Uses individual `emailId` and `password`.
   - Issues JWT containing `{ _id, emailId, role }`.
   - Used by: DSA Academy, Problem Practice (`/api/problem`), Code Submissions (`/api/submission`), Contests (`/api/contest`), Playlists (`/api/playlists`), Discussions (`/api/discussions`), AI Interview & Doubt AI (`/api/ai`).

### Consequences of This Dual Identity System:

- A user logged into the Academy cannot automatically collaborate in a project or room without a separate "Team" login.
- In `AuthContext.jsx`, the frontend attempts a fallback hack: if an email is provided, it calls `/api/user/login`; if a username is provided, it passes `teamName: "DemoTeam"` and calls `/api/auth/login`.
- Projects are owned by `teamName: String` rather than a `User` ObjectId. If two users create different teams with different names, their projects cannot be shared across platforms or user profiles.
- Socket.IO handshakes strictly require `{ teamName, username }`, completely blocking standalone user sessions from real-time features.

---

## 3. End-to-End Dependency Map

```
Frontend Component            API Client / Hook             Backend Route & Method               Controller & Action                          Service / Middleware              Target Model & Collection
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Login.jsx                     AuthContext.jsx / authSlice   POST /api/auth/login                 authController.login                         auth.service.js                   Team ('teams')
Register.jsx                  AuthContext.jsx / authSlice   POST /api/auth/register              authController.register                      auth.service.js                   Team ('teams')
Login.jsx (User Mode)         axiosClient.js                POST /api/user/login                 userAuthenticate.login                       userMiddleware.js                 User ('users')
Register.jsx (User Mode)      axiosClient.js                POST /api/user/register              userAuthenticate.register                    profileImageGenerator.js          User ('users')
VerifyEmail.jsx               axiosClient.js                POST /api/user/verifyEmailOTP        userVerification.verifyEmailOTP              redisWrapper (volatile)           User ('users')
ForgotPassword.jsx            axiosClient.js                POST /api/user/forgot-password       userVerification.requestPasswordResetOTP     redisWrapper (volatile)           User ('users')
UserProfile.jsx               apis/userApi.js               GET  /api/user/getProfile            userAuthenticate.getProfile                  userMiddleware.js                 User ('users'), Problem ('problems')
UserProfile.jsx (Update)      apis/userApi.js               PUT  /api/user/updateProfile         userAuthenticate.updateProfile               multer / cloudinary               User ('users')
ActiveMemberPage.jsx          apis/adminApi.js              GET  /api/user/activeuser            userAuthenticate.activeUsers                 adminMiddleware.js                User ('users')
UserManagement.jsx            apis/adminApi.js              GET  /api/user/users                 userAuthenticate.getAllUsers                 adminMiddleware.js                User ('users')
PlatformAnalytics.jsx         apis/adminApi.js              GET  /api/user/platform-stats        userAuthenticate.getPlatformStats            adminMiddleware.js                User, Submission, Contest, Problem
Dashboard.jsx (Streaks)       services/dashboardService.js  GET  /api/user/streaks               dashboardController.getUserStreaks           userMiddleware.js                 Submission ('submissions')
Dashboard.jsx (Badges)        services/dashboardService.js  GET  /api/user/badges                dashboardController.getUserBadges            userMiddleware.js                 Submission ('submissions')
Dashboard.jsx (Rank)          services/dashboardService.js  GET  /api/user/rank                  dashboardController.getUserRank              userMiddleware.js                 User ('users') [FULL TABLE SCAN]
Dashboard.jsx (Heatmap)       services/dashboardService.js  GET  /api/user/heatmap               dashboardController.getHeatmapData           userMiddleware.js                 Submission ('submissions')
Dashboard.jsx (Submissions)   services/dashboardService.js  GET  /api/user/submissions           dashboardController.getAllUserSubmissions    userMiddleware.js                 Submission ('submissions')
Project.jsx (List)            slices/projectSlice.js        GET  /api/projects/get-all           project.controllers.getAllProjectsController project.service.js               Project ('projects')
Project.jsx (Create)          slices/projectSlice.js        POST /api/projects/create            project.controllers.createProjectController  project.service.js               Project ('projects')
Editor.jsx (Load)             slices/projectSlice.js        GET  /api/projects/:id               project.controllers.getProjectController     project.service.js               Project ('projects')
Editor.jsx (AutoSave)         utils/project.api.js          PUT  /api/projects/:id               project.controllers.updateProjectController  project.service.js               Project ('projects')
Editor.jsx (AI Review)        slices/projectSlice.js        POST /api/projects/:id/review        project.controllers.reviewProjectController  ai.service.js (Gemini)            Project ('projects')
Chat.jsx (Project Chat)       server.js (Socket.IO)         SOCKET chat-message                  server.js inline handler                     message.service.js                Message ('messages')
Chat.jsx (Fetch History)      server.js (Socket.IO)         SOCKET join-project                  server.js inline handler                     message.service.js                Message ('messages')
CodeEditor.jsx (Sync)         server.js (Socket.IO)         SOCKET code-change                   server.js inline broadcast                   N/A (Ephemeral)                   None
VideoCall.jsx (Signaling)     server.js (Socket.IO)         SOCKET call-user / answer-call       server.js inline broadcast                   call.service.js (In-Memory)       None
WebRTC (ICE / TURN)           webrtc/peer.js                GET  /api/webrtc/turn                inline route in webrtc.routes.js             authMiddleware.js                 None
Explore.jsx (Problems)        slices/problemSlice.js        GET  /api/problem/getAllProblems     userProblems.getAllProblems                  problemSerializer.js              Problem ('problems')
ProblemSolve.jsx (Details)    slices/problemSlice.js        GET  /api/problem/getProblemById/:id userProblems.getProblemById                  problemSerializer.js              Problem ('problems')
ProblemSolve.jsx (Run)        slices/problemSlice.js        POST /api/submission/run/:id         userSubmission.runCode                       Judge0 / problemUtility.js        Problem ('problems')
ProblemSolve.jsx (Submit)     slices/problemSlice.js        POST /api/submission/submit/:id      userSubmission.submitCode                    Judge0 / problemUtility.js        Submission ('submissions'), User ('users')
CreateProblem.jsx             apis/adminApi.js              POST /api/problem/create             userProblems.createProblem                   Judge0 verification               Problem ('problems')
UpdateProblem.jsx             apis/adminApi.js              PUT  /api/problem/update/:id         userProblems.updateProblem                   adminMiddleware.js                Problem ('problems')
DeleteProblem.jsx             apis/adminApi.js              DELETE /api/problem/delete/:id       userProblems.deleteProblem                   adminMiddleware.js                Problem ('problems')
ContestPage.jsx               apis/contestApi/contest.js    GET  /api/contest                    contestController.getAllContests             problemSerializer.js              Contest ('contests')
ContestDetail.jsx             apis/contestApi/contest.js    GET  /api/contest/:id                contestController.getContestById             problemSerializer.js              Contest ('contests')
ContestDetail.jsx (Register)  apis/contestApi/contest.js    POST /api/contest/:id/register       contestController.registerForContest         userMiddleware.js                 Contest ('contests')
ContestSolve.jsx (Submit)     apis/contestApi/contest.js    POST /api/contest/.../submit         contestSubmissionController.submitContestCode Judge0 / leaderboardController   ContestSubmission, Leaderboard
ContestLeaderboard.jsx        apis/contestApi/contest.js    GET  /api/contest/:id/leaderboard    leaderboardController.getContestLeaderboard  userMiddleware.js                 Leaderboard ('leaderboards')
PlaylistCreate.jsx            axiosClient.js                POST /api/playlists                  playlistRouter inline handler                userMiddleware.js                 Playlist ('playlists')
PlaylistDetail.jsx            axiosClient.js                GET  /api/playlists/:id              playlistRouter inline handler                userMiddleware.js                 Playlist ('playlists')
Discuss.jsx                   axiosClient.js                GET  /api/discussions                discussionController.getDiscussions          discussionController.js           Discussion ('discussions')
Discuss.jsx (Create)          axiosClient.js                POST /api/discussions                discussionController.createDiscussion        discussionController.js           Discussion ('discussions')
Interview.jsx (Session)       utils/interviewAPI.js         POST /api/ai/create-session          interview.createSession                      interview.js (In-Memory Map)      None (Ephemeral Map)
Interview.jsx (Continue)      utils/interviewAPI.js         POST /api/ai/continue                interview.continueInterview                  Gemini API                        None (Ephemeral Map)
Interview.jsx (Feedback)      utils/interviewAPI.js         POST /api/ai/generate-feedback/:id   interview.generateFeedback                   Gemini API                        None (global.interviewFeedback Map)
DoubtAi.jsx                   axiosClient.js                POST /api/ai/chat                    doubtAi.js                                   Gemini API / userMiddleware       None (No chat persistence)
AssistantModal.jsx            axiosClient.js                POST /api/ai/assistant               aiAssistantController.handleAssistantQuery   Gemini API / userMiddleware       None (No chat persistence)
```

---

## 4. Current Schema Inventory & Detailed Critique

### 4.1 Collection: `teams` (`team.model.js`)

- **Fields**: `teamName` (String, unique, lowercase), `password` (String, hashed), `members` (Array of subdocuments: `username`, `isAdmin`, `lastLogin`, `joinedAt`, `isActive`), `createdAt`, `updatedAt`.
- **Primary Flaw**: Embeds members inside the team document. Storing users inside teams restricts users from existing outside that single team. The entire team shares a single team password for authentication.
- **Index**: `{ teamName: 1 }` (unique).
- **Missing**: No reference to `User` ObjectId. No creator/owner reference. No membership roles beyond boolean `isAdmin`.

### 4.2 Collection: `users` (`user.js`)

- **Fields**: `firstName`, `lastName`, `emailId` (unique, lowercase), `password`, `age`, `role` (enum: user, admin), `problemSolved` (Array of ObjectIds), `contestsCompleted` (Array of ObjectIds), `isPremium`, `tokensLeft`, `premiumExpiry`, `profileImage`, `emailVerified`, `socialLinks`, `points`, `streak`, `lastContestCompletion`, `contestHistory` (Array of objects), `paymentHistory` (Array of objects), `createdAt`, `updatedAt`.
- **Primary Flaws**:
  1. `problemSolved`: Unbounded array. For an active user solving 1,000+ problems, this array grows indefinitely in the user document.
  2. `contestHistory`: Unbounded array storing ranking, score, runtime.
  3. No `username` field on `User`. The user only has `firstName`, `lastName`, and `emailId`, while the collaborative editor and Socket.IO use `username`.
  4. Missing session tracking, refresh token rotation, email verification tokens, and password reset records in MongoDB (previously dumped into volatile Redis).

### 4.3 Collection: `projects` (`project.model.js`)

- **Fields**: `name`, `teamName` (lowercase String), `code` (monolithic String), `review` (String), `createdAt`, `updatedAt`.
- **Primary Flaws**:
  1. No `owner` (User ObjectId) or `team` (Team ObjectId). Only `teamName` String.
  2. Monolithic single `code` string cannot represent multi-file projects or realistic IDE file trees.
  3. No soft deletion or archival support.
  4. No collaborator permissions or access controls.

### 4.4 Collection: `messages` (`message.model.js`)

- **Fields**: `projectId` (ObjectId), `teamName` (String), `username` (String), `message` (String, max 5000), `type` (user, system, notification), `metadata` (edited, editedAt, replyTo), `createdAt`, `updatedAt`.
- **Primary Flaws**:
  1. Identified by `teamName` and `username` as raw strings rather than `senderId: ObjectId` referencing `User`.
  2. Tied exclusively to `projectId`, cannot support Direct Messages (DMs), team channels, or study groups.

### 4.5 Collection: `problems` (`problem.js`)

- **Fields**: `title`, `description`, `difficulty` ('easy','medium','hard'), `tags` (Array of Strings with massive hardcoded enum), `visibleTestCases` (Array), `hiddenTestCases` (Array), `startCode` (Array), `referenceSolution` (Array), `secureUrl`, `thumbnailUrl`, `duration`, `problemCreator` (ObjectId -> user), `createdAt`, `updatedAt`.
- **Primary Flaws**:
  1. No `slug` for clean SEO-friendly URLs.
  2. Test cases embedded in the problem document. When fetching a problem for admin inspection or updating, large hidden test cases (e.g. 100+ large inputs) cause bloated document transfers.
  3. No versioning or publication status (`draft`, `published`, `archived`).

### 4.6 Collection: `submissions` (`submission.js`)

- **Fields**: `userId` (ObjectId -> user), `problemId` (ObjectId -> problem), `code`, `language`, `status`, `runtime`, `memory`, `errorMessage`, `testCasesPassed`, `totalTestCases`, `createdAt`, `updatedAt`.
- **Missing**: No index on `{ userId: 1, createdAt: -1 }` or `{ problemId: 1, status: 1 }`.
- **Missing**: Execution result separation for detailed per-testcase execution metrics.

### 4.7 Collection: `contests` (`contest.js`)

- **Fields**: `name`, `description`, `problems` (Array of ObjectIds), `startTime`, `endTime`, `createdBy` (ObjectId -> user), `participants` (Array of ObjectIds -> user), `date`, `isPublic`, `createdAt`, `updatedAt`.
- **Primary Flaw**: `participants` is an **unbounded embedded array**. In a public contest with 10,000 participants, writing to this array causes document reallocation, lock contention, and document size overflow.

### 4.8 Collection: `contestsubmissions` (`contestSubmission.js`)

- **Fields**: `userId`, `contestId`, `problemId`, `code`, `language`, `status`, `runtime`, `memory`, `errorMessage`, `testCasesPassed`, `totalTestCases`, `score`, `submissionTime`, `createdAt`, `updatedAt`.
- **Existing Indexes**: `{ contestId: 1, userId: 1, problemId: 1 }`, `{ contestId: 1, score: -1, runtime: 1 }`.
- **Issue**: Does not track attempt numbers cleanly or penalty calculations for competitive programming ranking.

### 4.9 Collection: `leaderboards` (`leaderboard.js`)

- **Fields**: `contestId`, `rankings` (Array of objects containing: `userId`, `rank`, `score`, `problemsSolved`, `totalRuntime`, and nested `submissions` array), `isFinalized`, `lastUpdated`.
- **Severe Bottleneck**: Every single contest submission re-computes all user submissions and rewrites the entire `rankings` array inside a single document! This will fail at scale.

### 4.10 Collection: `discussions` & `comments` (`discussion.js`, `comment.js`)

- **Fields (Discussion)**: `title`, `content`, `author`, `community`, `tags`, `upvotes`, `downvotes`, `views`, timestamps.
- **Fields (Comment)**: `content`, `author`, `discussion`, `parentComment`, `upvotes`, `downvotes`, timestamps.
- **Flaws**:
  1. Upvotes and downvotes are stored as arrays of ObjectIds inside each document. For viral posts, these arrays are unbounded.
  2. No soft delete (`isDeleted`), pinning, or moderation flags.
  3. `getDiscussions` runs a secondary `Comment.countDocuments` query inside a `Promise.all` loop for every discussion on the page (classic N+1 query pattern).

### 4.11 Collection: `playlists` (`playlist.js`)

- **Fields**: `name`, `user` (ObjectId), `problems` (Array of ObjectIds), `createdAt`.
- **Flaws**: No description, no public/private visibility flag, no order/sequence of problems, no playlist sharing capability.

### 4.12 In-Memory Only Components (Risk of Data Loss)

- **AI Interview Sessions**: Stored in JavaScript `Map` (`interviewSessions = new Map()`).
- **AI Interview Feedback**: Stored in `global.interviewFeedback = new Map()`.
- **AI Chat & Doubt Solver**: No persistence at all. No token usage tracking or rate-limit records in DB.
- **WebRTC Call Sessions**: Stored in `call.service.js` memory.

---

## 5. Security & Operational Deficiencies

1. **Redis Hard Dependency**:
   - `userMiddleware.js` queries `redisWrapper.exists('token:${token}')`.
   - When Redis is offline or unconfigured, `exists()` returns `null`, causing the middleware to immediately return `503 Authentication service temporarily unavailable`.
   - In standard development or environments without managed Redis, the entire API breaks.
2. **Plaintext OTP Storage**:
   - In `userVerification.js`, OTPs were stored as raw text in Redis keys (`otp:${email}`).
   - Password reset tokens were generated with raw timestamps and stored in Redis without cryptographic hashing in MongoDB.
3. **Missing Global Error Handler**:
   - `src/app.js` had no `(err, req, res, next)` middleware, leaking stack traces in unhandled exceptions and returning HTML 500 responses instead of standard JSON.
4. **Lack of Resource Ownership Checks**:
   - In `project.controllers.js`, update and review actions only checked `teamName`, allowing any team member to overwrite any project without fine-grained author/admin checks.
5. **Full Table Scan in `getUserRank`**:
   - `dashboardController.getUserRank` executed `User.find().select('problemSolved')` loading the entire user database into Node.js memory to compute a rank with `.filter()`.

---

## 6. Target Architecture Strategy

1. **Unify Identity Around `User`**:
   - Every entity (`Team`, `Project`, `Submission`, `Discussion`, `Playlist`, `AIConversation`) references `User` by `_id`.
   - Give `User` both `username` and `email` as normalized, unique, indexed fields.
   - For legacy collaborative editor compatibility, provide seamless token generation and adapters that allow users to access teams and projects using their unified account.
2. **Normalize Relationships**:
   - Move memberships out of embedded arrays into dedicated relation collections: `TeamMembership`, `ProjectMember`, `ContestRegistration`.
   - Keep lightweight, bounded summary counts on parent documents (e.g., `memberCount`, `problemsSolvedCount`) updated via atomic operators (`$inc`).
3. **De-couple In-Memory AI and Interview State**:
   - Create `AIConversation`, `AIMessage`, and `AIUsage` to persist mentor interactions and mock interviews reliably.
4. **Resilient Token & Session Management**:
   - Store sessions and refresh tokens in `UserSession` collection in MongoDB, using Redis as an optional cache when available.
5. **Safe, Non-Destructive Migration**:
   - Provide idempotent migration scripts that extract embedded team members into primary `User` records and `TeamMembership` records without destroying existing IDs or relationships.
