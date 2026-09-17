# CodeX - Collaborative AI-Powered Code Editor

<p align="center">
  <img src="public/logo.png" alt="CodeX Logo" width="140"/>
</p>

## Project Overview
# CodeX — Complete Product Vision

## 1. What is CodeX?

CodeX is intended to become a **complete developer learning, collaboration, AI assistance, and competitive programming platform**.

The goal is not to build another simple code editor or another simple DSA problem website.

The goal is to create one platform where a developer can:

* Learn programming and DSA
* Practice problems
* Prepare for technical interviews
* Ask and solve doubts
* Get help from AI
* Write and test code
* Study alone
* Study with friends
* Communicate with other developers
* Collaborate in real time
* Share screens
* Use audio/video calls
* Draw and explain algorithms visually
* Participate in coding competitions
* Compete individually or in teams
* Submit solutions
* Receive verdicts
* Build a competitive rating
* Track learning progress
* Build a developer profile

In simple terms:

> **Learn → Practice → Collaborate → Get Help → Compete → Improve**

CodeX should connect all of these activities into one developer ecosystem.

---

# 2. The Problem CodeX Solves

Today, a developer may need many different platforms:

```text
Learning
→ YouTube / Courses / Articles

Problem Solving
→ LeetCode / Codeforces / HackerRank

Communication
→ Discord / Slack

Video Meetings
→ Google Meet

Collaborative Coding
→ VS Code Live Share / Replit

Whiteboarding
→ Excalidraw / Miro

AI Assistance
→ ChatGPT / Gemini / Claude

Interview Preparation
→ Multiple separate platforms
```

The idea behind CodeX is to bring the most useful parts of these workflows into one integrated environment.

A learner should not have to continuously switch between multiple applications while learning and solving programming problems.

---

# 3. Target Users

The primary users are:

### Beginner Developers

People learning:

* Programming
* DSA
* Problem solving
* Coding fundamentals

### College Students

Students preparing for:

* Placements
* Coding interviews
* Competitive programming
* Technical interviews

### Interview Candidates

Developers preparing for:

* DSA interviews
* Coding rounds
* Technical interviews
* Mock interviews

### Competitive Programmers

Users interested in:

* Coding contests
* Rankings
* Ratings
* Team competitions
* Problem solving

### Developer Study Groups

Friends or communities who want to:

* Study together
* Discuss problems
* Code together
* Conduct study sessions
* Share screens
* Communicate through audio/video

---

# 4. Core Product Areas

CodeX should be organized around several major product domains.

```text
CodeX
│
├── Identity & Users
├── Learning / Academy
├── Problems & Practice
├── Collaboration
├── Communication
├── AI Mentor
├── Competitive Programming
├── Teams & Social
└── Platform Infrastructure
```

These are product domains, not necessarily the exact final folder structure.

---

# 5. Identity & User System

Every person should have an individual CodeX account.

The system should support:

* Registration
* Login
* Logout
* Authentication
* Authorization
* User profile
* Avatar
* Username
* Bio
* Skills
* Learning statistics
* Problem-solving statistics
* Achievements
* Rating
* Rank
* Activity
* Friends/connections
* Notifications
* Preferences

The important architectural change is:

> A user should be the primary identity of the platform.

Teams and projects should belong to users, rather than the entire platform being centered around teams.

---

# 6. CodeX Academy

The Academy is the educational part of CodeX.

Initially, DSA is the primary subject.

However, the learning system should be designed so additional subjects can be added later.

Potential future subjects:

```text
Computer Science Academy
│
├── DSA
├── OOP
├── DBMS
├── Operating Systems
├── Computer Networks
├── System Design
└── Other subjects
```

The first major implementation should focus on DSA.

---

# 7. DSA Learning System

DSA should not simply be a collection of problems.

Users should be able to follow a structured learning path.

Example:

```text
DSA Roadmap

Programming Basics
       ↓
Complexity Analysis
       ↓
Arrays
       ↓
Strings
       ↓
Linked Lists
       ↓
Stacks & Queues
       ↓
Recursion
       ↓
Binary Search
       ↓
Trees
       ↓
Graphs
       ↓
Greedy
       ↓
Dynamic Programming
       ↓
Advanced Algorithms
```

Each topic can contain:

* Concept explanation
* Examples
* Visualizations
* Code examples
* Common mistakes
* Complexity analysis
* Practice problems
* Challenges
* Notes
* Progress

---

# 8. Learning Flow

The ideal learning experience is:

```text
Learn Concept
      ↓
Understand Example
      ↓
Visualize
      ↓
Try Small Exercise
      ↓
Solve Problem
      ↓
Get Hint if Needed
      ↓
Submit
      ↓
Analyze Solution
      ↓
Learn From Mistakes
      ↓
Progress
```

The platform should avoid encouraging users to simply copy solutions.

The goal is to improve their problem-solving ability.

---

# 9. Problem Solving

CodeX should have a dedicated problem-solving system.

Problems should contain information such as:

```text
Problem
├── Title
├── Description
├── Constraints
├── Examples
├── Input format
├── Output format
├── Difficulty
├── Topics
├── Tags
├── Hints
├── Test cases
└── Expected solution characteristics
```

Users should be able to:

* Read problems
* Write code
* Run code
* Submit code
* Receive verdict
* See execution information
* Track solved problems
* Bookmark problems
* Revisit problems
* View their history

---

# 10. Collaborative Study Rooms

A major feature is studying with friends.

A user should be able to create or join a study room.

Example:

```text
DSA Study Room
│
├── Members
├── Chat
├── Video
├── Audio
├── Screen Share
├── Code Editor
├── Whiteboard
├── Current Problem
└── AI Mentor
```

Multiple users can work together in the same room.

For example:

Three students are solving a graph problem.

One student shares their screen.

Another draws the graph on the whiteboard.

Another edits the shared code.

Everyone discusses the approach through voice/video.

The AI can be invited into the room to explain a concept or analyze the current problem.

---

# 11. Communication

Communication should be integrated into the platform.

### Text

* Direct messages
* Group chat
* Study-room chat
* Team chat
* Problem discussion

### Audio

* One-to-one calls
* Group calls
* Study-room voice

### Video

* One-to-one calls
* Group video
* Study-room video

### Screen Sharing

Users should be able to share:

* Entire screen
* Application/window
* Browser tab

The architecture should keep WebRTC/media infrastructure separate from normal application business logic.

---

# 12. Collaborative Code Editor

CodeX already has a collaborative editor foundation.

The long-term goal is to make the editor part of the unified study environment.

Users should be able to:

* Write code
* Edit code together
* See other users
* See cursor/presence
* Run code
* Save code
* Discuss code
* Ask AI about code

The editor should remain one consistent coding environment rather than creating multiple unrelated editors throughout the application.

---

# 13. Collaborative Whiteboard

The platform should eventually include an interactive collaborative canvas similar in concept to Excalidraw.

It can be used for:

* Drawing data structures
* Graph problems
* Algorithm explanations
* System design
* Interview explanations
* Brainstorming
* Teaching

Example:

```text
Problem:
Find shortest path in graph

Whiteboard:
     A
    / \
   B   C
   |   |
   D---E
```

Multiple participants should be able to edit the same canvas in real time.

The whiteboard should be treated as another collaborative workspace capability.

---

# 14. AI Mentor

AI should be a major platform capability rather than a simple "Ask AI" button.

The AI should act as a **personal programming teacher and mentor**.

It should understand the context of the user's activity.

For example:

```text
User is solving:
Binary Search Problem

AI knows:
- Current problem
- User's code
- Previous attempts
- Error
- Topic
- Learning progress
```

This allows more useful assistance.

---

# 15. AI Capabilities

The AI Mentor should eventually support:

### Learning

* Explain DSA topics
* Explain concepts deeply
* Give examples
* Give analogies
* Create exercises
* Test understanding

### Problem Solving

* Give hints
* Explain constraints
* Analyze approaches
* Identify mistakes
* Suggest improvements
* Explain optimal approaches

### Code

* Explain code
* Debug code
* Detect bugs
* Optimize code
* Analyze time complexity
* Analyze space complexity
* Generate test cases
* Compare multiple solutions

### Interview Preparation

* Ask interview questions
* Conduct mock interviews
* Evaluate answers
* Give feedback
* Identify weak areas

The AI should preferably guide the learner progressively rather than immediately providing the complete solution.

---

# 16. Personalized Learning

Eventually CodeX should understand the user's learning profile.

Example:

```text
User

Arrays          ██████████ 90%
Strings         ████████   80%
Trees           ██████     60%
Graphs          ████       40%
DP              ██         20%
```

The system can then recommend:

```text
Recommended next:

1. Recursion revision
2. Memoization
3. 1D Dynamic Programming
4. DP practice problems
```

This creates a personalized learning loop.

---

# 17. Competitive Programming

CodeX should have a separate competitive programming ecosystem.

Users can compete:

### Individually

```text
User
 ↓
Contest
 ↓
Solve Problems
 ↓
Submit
 ↓
Score
 ↓
Leaderboard
 ↓
Rating
```

### As Teams

```text
Team
├── Member A
├── Member B
└── Member C

       ↓

Team Contest

       ↓

Problems

       ↓

Submissions

       ↓

Team Score

       ↓

Leaderboard
```

---

# 18. Contest System

The contest system should eventually support:

* Contest creation
* Contest scheduling
* Registration
* Problem selection
* Start/end time
* Individual participation
* Team participation
* Submission limits
* Scoring
* Penalties
* Leaderboard
* Contest history
* Rating changes

---

# 19. Online Judge

Competitive programming requires a proper execution/judging architecture.

Conceptually:

```text
User
 ↓
Code Submission
 ↓
Submission API
 ↓
Queue
 ↓
Judge Worker
 ↓
Sandbox
 ↓
Compile
 ↓
Run Test Cases
 ↓
Collect Results
 ↓
Verdict
 ↓
Leaderboard
```

The execution environment should NOT be treated as a normal API-server operation.

Untrusted code must be isolated appropriately.

The existing project has JavaScript execution using Node's VM functionality, but that should not automatically be considered a secure production sandbox for arbitrary user code.

---

# 20. Leaderboards & Ranking

Users should have competitive statistics.

Examples:

```text
Rating
Rank
Problems Solved
Contest Wins
Contest Participation
Best Contest Rank
Current Streak
```

Leaderboards can eventually be:

* Global
* Friends
* College/community
* Country
* Topic-specific
* Weekly
* Monthly
* Contest-specific
* Team

---

# 21. Relationship Between Learning and Competition

The most important part is that learning and competition should not be isolated.

The system should connect them.

Example:

```text
Learn Arrays
      ↓
Practice Arrays
      ↓
Solve Problems
      ↓
Improve Skill
      ↓
Enter Array Contest
      ↓
Competitive Rating
      ↓
Identify Weakness
      ↓
AI Recommendation
      ↓
Learn Again
```

This creates a continuous loop:

> **Learn → Practice → Compete → Analyze → Improve → Learn**

---

# 22. Social Developer Profile

Every user should have a developer profile.

Potential profile:

```text
Sameer

DSA Rating: 1540
Problems Solved: 387
Contests: 24
Current Streak: 18 days

Strong Topics:
Arrays
Binary Search
Trees

Needs Improvement:
Graphs
Dynamic Programming

Achievements:
🏆 First Contest
🔥 30 Day Streak
⚡ 100 Problems
```

This profile becomes a representation of the user's learning and competitive journey.

---

# 23. Teams

Teams should become a reusable platform concept.

A team could be used for:

* Study groups
* Competitive programming
* Projects
* Communities
* Hackathons

Users should be able to:

* Create team
* Invite users
* Join team
* Leave team
* Assign roles
* Manage permissions
* Participate in team competitions

---

# 24. Projects

The existing project/collaborative coding functionality should not necessarily disappear.

Instead, projects become another workspace type.

Potential model:

```text
Workspace
│
├── Coding Project
├── Study Room
├── Competition Room
└── Team Workspace
```

This allows the existing CodeX project functionality to evolve instead of being thrown away.

---

# 25. Overall User Journey

A typical new user might experience:

```text
Register
   ↓
Create Profile
   ↓
Choose Learning Goal
   ↓
Start DSA Roadmap
   ↓
Learn Topic
   ↓
Practice Problems
   ↓
Ask AI for Help
   ↓
Join Study Room
   ↓
Solve With Friends
   ↓
Participate in Contest
   ↓
Receive Rating
   ↓
Analyze Weak Topics
   ↓
AI Creates Recommendations
   ↓
Continue Learning
```

This is the core CodeX loop.

---

# 26. Product Philosophy

CodeX should follow these principles:

### Learning First

The platform should help users understand concepts rather than simply copy solutions.

### Collaboration First

Developers should be able to learn with other developers naturally.

### AI as Mentor

AI should assist learning, not replace thinking.

### Competition as Motivation

Competitive programming should provide measurable goals.

### One Unified Workspace

Learning, coding, communication, AI, and collaboration should work together.

### Progressive Architecture

The system should start as a manageable application but have clear boundaries for future scaling.

---

# 27. High-Level System

The conceptual architecture is:

```text
                         CODEX
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
     LEARNING         COLLABORATION       COMPETITION
        │                  │                  │
      DSA              Study Rooms          Contests
      Courses          Chat                 Problems
      Lessons          Audio                Submissions
      Problems         Video                Judge
      Progress         Screen Share         Leaderboard
      Interview        Editor               Rating
                       Whiteboard
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                       AI MENTOR
                           │
              ┌────────────┼────────────┐
              │            │            │
           Explain       Debug       Optimize
              │            │            │
           Hints        Problems     Interview
              │            │            │
              └────────────┼────────────┘
                           │
                       USER PROFILE
                           │
              Progress / Skills / Rating
```

---

# 28. What CodeX Should NOT Become

Avoid turning the platform into an unstructured collection of features.

Do not build:

```text
Chat
Video
AI
DSA
Contest
Editor
Team
Project
Whiteboard
```

as completely independent systems with no relationship.

Instead, they should form a coherent ecosystem.

The user should feel:

> "This is my developer workspace."

not:

> "This website has 30 unrelated features."

---

# 29. Technical Architecture Philosophy

The codebase should be organized around **business domains and responsibilities**.

Potential domains:

```text
Identity
Users
Learning
Problems
Submissions
Competition
Teams
Collaboration
Chat
Calls
AI
Notifications
```

Shared infrastructure should be separate:

```text
Database
Authentication
Realtime
WebRTC
Logging
Configuration
Storage
Queues
```

Frontend should similarly separate:

```text
Application
Features
Pages
Shared UI
State
API
Realtime
Infrastructure
```

The exact folder structure should be decided only after analyzing the existing repository.

---

# 30. Development Strategy

Do not attempt to build every feature simultaneously.

Recommended progression:

### Phase 1

Stabilize the existing CodeX architecture.

### Phase 2

Build proper user identity/profile architecture.

### Phase 3

Build DSA Academy.

### Phase 4

Build problem-solving/submission infrastructure.

### Phase 5

Build AI Mentor.

### Phase 6

Build collaborative study rooms.

### Phase 7

Improve chat/audio/video/screen sharing/whiteboard.

### Phase 8

Build competitive programming and online judging.

### Phase 9

Connect learning analytics, ratings, recommendations, and personalization.

---

# 31. Final Vision

The long-term vision of CodeX is:

> **A single platform where developers can learn computer science, practice DSA, solve problems, prepare for interviews, collaborate with friends, communicate in real time, receive AI mentorship, compete in coding contests, and continuously measure and improve their skills.**

The central loop is:

```text
             ┌──────────────┐
             │    LEARN     │
             └──────┬───────┘
                    ↓
             ┌──────────────┐
             │   PRACTICE   │
             └──────┬───────┘
                    ↓
             ┌──────────────┐
             │ COLLABORATE  │
             └──────┬───────┘
                    ↓
             ┌──────────────┐
             │   COMPETE    │
             └──────┬───────┘
                    ↓
             ┌──────────────┐
             │   ANALYZE    │
             └──────┬───────┘
                    ↓
             ┌──────────────┐
             │   IMPROVE    │
             └──────┬───────┘
                    │
                    └──────────→ LEARN
```

That loop is the heart of the CodeX product.


## Notes from repository scan

- The repository contains screenshot and demo assets in `public/`.
- A hosted live deployment URL is not confirmed in source files.
- The existing README referenced a YouTube demo and deployment link that are not verifiable from the codebase.

[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Node](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Socket.IO](https://img.shields.io/badge/Realtime-Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![Gemini](https://img.shields.io/badge/AI-Google%20Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

## Live link - https://codex-psi-murex.vercel.app/

## Demo video asset

[![Watch the demo video](https://img.youtube.com/vi/gB7qztH9BIg/maxresdefault.jpg)](https://youtu.be/gB7qztH9BIg?si=hfeuMXsqUXkxoAHT)

Direct link: https://youtu.be/gB7qztH9BIg?si=hfeuMXsqUXkxoAHT


### Frontend

| Technology           | Purpose                |
| -------------------- | ---------------------- |
| React 19             | UI framework           |
| Vite                 | Build tooling          |
| Tailwind CSS         | Styling                |
| Redux Toolkit        | State management       |
| React Router DOM     | Client-side routing    |
| @monaco-editor/react | Code editor UI         |
| Socket.IO Client     | Realtime collaboration |
| Framer Motion        | Animations             |
| React Hook Form      | Form handling          |
| Yup                  | Validation             |
| axios                | HTTP client            |
| Sonner               | Notifications          |
| Recharts             | Dashboard visuals      |

### Backend

| Technology            | Purpose                 |
| --------------------- | ----------------------- |
| Node.js               | Server runtime          |
| Express.js            | HTTP API framework      |
| Mongoose              | MongoDB object modeling |
| Socket.IO             | Realtime socket server  |
| JSON Web Tokens       | Authentication          |
| Helmet                | Security headers        |
| Morgan                | HTTP request logging    |
| @google/generative-ai | Gemini AI code review   |
| node:vm               | Sandboxed JS execution  |

### Database & Storage

| Technology | Purpose            |
| ---------- | ------------------ |
| MongoDB    | Primary data store |
| Mongoose   | Schema enforcement |

### Dev Tools & Deployment

| Tool       | Purpose                    |
| ---------- | -------------------------- |
| Vite       | Frontend development       |
| nodemon    | Backend reload             |
| ESLint     | Linting                    |
| Prettier   | Formatting                 |
| Jest       | Backend tests              |
| Vitest     | Frontend tests             |
| Playwright | E2E testing                |
| cross-env  | Cross-platform env scripts |

## Project Structure


## Database Models

### Project

| Field    | Type   | Notes               |
| -------- | ------ | ------------------- |
| name     | String | Required            |
| teamName | String | Required, lowercase |
| code     | String | Project source text |
| review   | String | AI review output    |

### Message

| Field     | Type     | Notes                               |
| --------- | -------- | ----------------------------------- |
| projectId | ObjectId | References `Project`                |
| teamName  | String   | Required                            |
| username  | String   | Required                            |
| message   | String   | Required                            |
| type      | String   | `user`, `system`, or `notification` |
| metadata  | Object   | Optional edit/reply tracking        |

### Team

| Field    | Type   | Notes                              |
| -------- | ------ | ---------------------------------- |
| teamName | String | Required, unique, lowercase        |
| password | String | Hashed                             |
| members  | Array  | Member objects with activity state |

## API Reference

### Auth — `/api/auth`

| Method | Endpoint                                    | Description                        |
| ------ | ------------------------------------------- | ---------------------------------- |
| POST   | `/register`                                 | Register a new team and admin user |
| POST   | `/login`                                    | Login and receive JWT              |
| GET    | `/verify`                                   | Verify current token               |
| POST   | `/logout`                                   | Logout and mark member inactive    |
| GET    | `/team/:teamName/members`                   | Get team member list               |
| PUT    | `/team/:teamName/member/:username/activity` | Update member active status        |
| GET    | `/team/:teamName/messages`                  | Fetch team messages                |

### Projects — `/api/projects`

| Method | Endpoint       | Description                    |
| ------ | -------------- | ------------------------------ |
| POST   | `/create`      | Create a new project           |
| GET    | `/get-all`     | List all team projects         |
| GET    | `/:id`         | Get project details            |
| PUT    | `/:id`         | Update project code            |
| POST   | `/:id/execute` | Execute JavaScript code        |
| POST   | `/:id/review`  | Run AI review for project code |

### Messages — `/api/messages`

| Method | Endpoint                     | Description                 |
| ------ | ---------------------------- | --------------------------- |
| GET    | `/project/:projectId`        | Fetch project chat messages |
| GET    | `/project/:projectId/unread` | Get unread message count    |

### WebRTC — `/api/webrtc`

| Method | Endpoint | Description                       |
| ------ | -------- | --------------------------------- |
| GET    | `/turn`  | Fetch STUN/TURN ICE server config |


## Third-Party Integrations

| Service       | Purpose                              | Library                         |
| ------------- | ------------------------------------ | ------------------------------- |
| Google Gemini | AI code review generation            | `@google/generative-ai`         |
| Socket.IO     | Realtime collaboration and signaling | `socket.io`, `socket.io-client` |
| Monaco Editor | Code editor UX                       | `@monaco-editor/react`          |
| STUN/TURN     | WebRTC NAT traversal                 | Browser RTC + backend config    |
| axios         | HTTP API requests                    | `axios`                         |

## Repository Notes

- Demo and screenshot assets exist under `public/` (`demo.png`, `dashboard.png`, `code.png`, `logout.png`, `codeXDemo.mp4`).
- The old README referenced a live deployment URL and YouTube embed; those are not verifiable from repository source files and are noted as not found in code.
- The root `package.json` contains only runtime dependencies for `jsonwebtoken` and `socket.io-client`.

## 🔌 Database Models

### Project Model

```javascript
{
  name: String (required),
  teamName: String (required),
  code: String (default: ""),
  review: String (default: ""),
  timestamps: true
}
```

### Message Model

```javascript
{
  projectId: ObjectId (Project),
  teamName: String,
  username: String,
  message: String,
  type: "user" | "system" | "notification",
  metadata: { edited, editedAt, replyTo },
  timestamps: true
}
```

### Team Model

```javascript
{
  teamName: String (unique),
  password: String (hashed),
  members: [{ username, isAdmin, lastLogin, joinedAt, isActive }],
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB database
- Google Gemini API key

### Backend Setup

```bash
cd Backend
npm install
npm start
```

### Frontend Setup

```bash
cd Frontend
npm install
npm run dev
```

### Environment Variables

Create a `.env` file in `Backend/`:

```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_API_KEY=your_gemini_api_key
FRONTEND_URLS=http://localhost:5173,https://your-frontend-domain.com
STUN_URLS=stun:stun.l.google.com:19302
TURN_URLS=turn:your-turn-host:3478?transport=udp,turn:your-turn-host:3478?transport=tcp
TURN_USERNAME=your_turn_username
TURN_CREDENTIAL=your_turn_credential
```

Create a `.env` file in `Frontend/`:

```env
VITE_BACKEND_URL=http://localhost:8000
```

Node VM sandboxed code execution: Present

Uses node:vm and runs user code inside a VM context with timeout in project.service.js (line 3), project.service.js (line 37), project.service.js (line 65), project.service.js (line 68), project.service.js (line 70).

STUN/TURN config for WebRTC: Present

Backend exposes ICE config in webrtc.routes.js (line 13), reads env in config.js (line 20), config.js (line 23).

Frontend uses STUN/TURN and RTCPeerConnection in peer.js (line 17), peer.js (line 20), peer.js (line 65), and fetches backend TURN config at peer.js (line 95).

Playwright + Jest + Vitest: Present

Playwright config/spec in playwright.config.js (line 1), flow.spec.js (line 1).

Jest in backend test setup/deps: package.json (line 12), package.json (line 42).

Vitest in frontend scripts/deps: package.json (line 12), package.json (line 51), setup file setup.js (line 3).

Monaco Editor: Present

Dependency in package.json (line 16).

Editor component usage and mount/commands in CodeEditor.jsx (line 2), CodeEditor.jsx (line 182), CodeEditor.jsx (line 575).

## 🔧 Development Workflow

### 1. Project Creation

1. User navigates to `/create-project`
2. Enters project name
3. Backend creates MongoDB document
4. User is redirected to project workspace

### 2. Collaborative Coding

1. Multiple users join the same project
2. Each user connects via Socket.io
3. Code changes are broadcasted to all users
4. Chat messages are synchronized in real-time

### 3. AI Code Review

1. Developer clicks "Get Review"
2. Current code is sent to Gemini AI service
3. AI analyzes code and provides feedback
4. Review is displayed in markdown

## 🧪 Testing

- Backend: `cd Backend && npm test`
- Frontend: `cd Frontend && npm run test`
- E2E: `npx playwright test` (from repo root)

## 🚀 Deployment

### Backend Deployment

- Deploy to Render, Railway, Heroku, or AWS
- Set production environment variables
- Ensure MongoDB connection is accessible

### Frontend Deployment

- Build with `npm run build`
- Deploy to Vercel, Netlify, or any static hosting
- Point `VITE_BACKEND_URL` to production API

## 🔒 Security Considerations

- JWT-based authentication
- CORS allow-list configuration
- Input validation in controllers
- Secure API key storage in environment variables

## 👨‍💻 Developer

<div align="center">

### **Sameer Khan**

_Full Stack Developer (MERN)_

[![Portfolio](https://img.shields.io/badge/Portfolio-FF5722?style=for-the-badge&logo=google-chrome&logoColor=white)](https://portfolio-coral-two-16.vercel.app/)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/sameer2210)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/sameer2210)
[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:sameerkhan27560@gmail.com)

</div>

---

**Happy Coding with CodeX! **
