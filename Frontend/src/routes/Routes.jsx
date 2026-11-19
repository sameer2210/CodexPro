import { lazy, Suspense } from "react";
import {
  BrowserRouter as AppRouter,
  Routes as AppRoutes,
  Navigate,
  Outlet,
  Route,
} from "react-router-dom";
import Layout from "../components/layout/Layout";
import { useAppSelector } from "../store/hooks";

// Lazy load components for performance
const Login = lazy(() => import("../views/Auth/Login"));
const Register = lazy(() => import("../views/Auth/Register"));
const ForgotPassword = lazy(() => import("../components/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("../components/auth/ResetPassword"));

const Landing = lazy(() => import("../views/Landing"));
const Dashboard = lazy(() => import("../views/Dashboard"));
const StatsDashboard = lazy(
  () => import("../components/dashboards/DashboardPage"),
);
const Premium = lazy(() => import("../components/common/Premium"));
const DoubtAi = lazy(() => import("../components/Ai/DoubtAi"));
const CreateProject = lazy(() => import("../components/project/CreateProject"));
const Project = lazy(() => import("../components/project/Project"));

// Platform Academy & Problem Solving
const Problem = lazy(() => import("../components/academy/Problem"));
const ProblemSolve = lazy(() => import("../components/academy/ProblemSolve"));
const PlaylistDetail = lazy(
  () => import("../components/academy/PlaylistDetail"),
);
const DSAVisualizer = lazy(() => import("../components/academy/DSAVisualizer"));
const Explore = lazy(() => import("../components/academy/Explore"));
const Interview = lazy(() => import("../components/academy/Interview"));

// Contest Arena
const ContestPage = lazy(() => import("../views/Arena/ContestPage"));
const ContestDetails = lazy(
  () => import("../components/contest/ContestDetails"),
);
const ContestLeaderboard = lazy(
  () => import("../components/contest/ContestLeaderboard"),
);
const ContestProblemSolve = lazy(
  () => import("../components/contest/ContestProblemSolve"),
);

// Community & Communications
const DiscussPage = lazy(() => import("../components/connections/DiscussPage"));
const DiscussionDetail = lazy(
  () => import("../components/connections/DiscussionDetail"),
);
const Meeting = lazy(() => import("../components/connections/Meeting"));
const ActiveMemberPage = lazy(
  () => import("../components/user/ActiveMemberPage"),
);

// User & Platform Core
const UserProfile = lazy(() => import("../components/user/UserProfile"));
const Homepage = lazy(() => import("../views/Homepage"));
const Settings = lazy(() => import("../components/page/Settings"));
const Help = lazy(() => import("../components/page/Help"));
const Notification = lazy(() => import("../components/page/Notification"));
const NotFound = lazy(() => import("../components/ui/NotFound"));

// Admin Management
const AdminPage = lazy(() => import("../views/Admin/AdminPage"));
const CreateProblem = lazy(() => import("../components/admin/CreateProblem"));
const UpdateProblem = lazy(() => import("../components/admin/UpdateProblem"));
const DeleteProblem = lazy(() => import("../components/admin/DeleteProblem"));
const ManageVideo = lazy(() => import("../components/admin/ManageVideo"));
const UploadVideo = lazy(() => import("../components/admin/UploadVideo"));
const UserManagement = lazy(() => import("../components/admin/UserManagement"));
const UserAnalytics = lazy(() => import("../components/admin/UserAnalytics"));
const PlatformAnalytics = lazy(
  () => import("../components/admin/PlatformAnalytics"),
);
const AdminContest = lazy(
  () => import("../components/admin/contest/AdminContest"),
);
const CreateContestForm = lazy(
  () => import("../components/admin/contest/CreateContestForm"),
);
const AdminContestDetail = lazy(
  () => import("../components/admin/contest/ContestDetail"),
);

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0B0E11]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-[#17E1FF]/20 border-t-[#17E1FF] rounded-full animate-spin" />
      <p className="text-sm font-mono text-white/40 uppercase tracking-widest">
        Loading CodeX...
      </p>
    </div>
  </div>
);

// Private route wrapper - checks Redux state or stored token
const PrivateRoute = () => {
  const reduxIsAuth = useAppSelector((state) => state.auth.isAuthenticated);
  const token =
    localStorage.getItem("codex_token") || localStorage.getItem("token");
  const isAuthenticated = reduxIsAuth || !!token;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// Public route wrapper - redirects to dashboard if authenticated
const PublicRoute = () => {
  const reduxIsAuth = useAppSelector((state) => state.auth.isAuthenticated);
  const token =
    localStorage.getItem("codex_token") || localStorage.getItem("token");
  const isAuthenticated = reduxIsAuth || !!token;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

const Routes = () => {
  return (
    <AppRouter>
      <Suspense fallback={<LoadingFallback />}>
        <AppRoutes>
          {/* Public Routes */}
          <Route element={<PublicRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Landing />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            {/* CodeX IDE & Projects */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<Dashboard />} />
            <Route path="/create-project" element={<CreateProject />} />
            <Route path="/project/:id" element={<Project />} />

            {/* Learning analytics (separate from IDE dashboard) */}
            <Route path="/stats" element={<StatsDashboard />} />
            <Route path="/premium" element={<Premium />} />

            {/* Platform Academy & Problem Solving */}
            <Route path="/problems" element={<Problem />} />
            <Route path="/problem/:problemId" element={<ProblemSolve />} />
            <Route path="/problems/:problemId" element={<ProblemSolve />} />
            <Route path="/playlists/:id" element={<PlaylistDetail />} />
            <Route path="/playlist/:id" element={<PlaylistDetail />} />
            <Route path="/visualizer" element={<DSAVisualizer />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/interview" element={<Interview />} />
            <Route path="/doubt-ai" element={<DoubtAi />} />

            {/* Contest Arena */}
            <Route path="/contests" element={<ContestPage />} />
            <Route path="/contest/:contestId" element={<ContestDetails />} />
            <Route
              path="/contest/:contestId/leaderboard"
              element={<ContestLeaderboard />}
            />
            <Route
              path="/contest/:contestId/problem/:problemId"
              element={<ContestProblemSolve />}
            />

            {/* Community & Communications */}
            <Route path="/discuss" element={<DiscussPage />} />
            <Route
              path="/discussion/:discussionId"
              element={<DiscussionDetail />}
            />
            <Route path="/meeting" element={<Meeting />} />
            <Route path="/meeting/:projectId" element={<Meeting />} />
            <Route path="/active-members" element={<ActiveMemberPage />} />

            {/* User & Platform Core */}
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/homepage" element={<Homepage />} />
            <Route path="/team" element={<Dashboard />} />
            <Route path="/activity" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/help" element={<Help />} />
            <Route path="/notifications" element={<Notification />} />

            {/* Admin Management */}
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/create" element={<CreateProblem />} />
            <Route path="/admin/update" element={<UpdateProblem />} />
            <Route path="/admin/delete" element={<DeleteProblem />} />
            <Route path="/admin/video" element={<ManageVideo />} />
            <Route path="/admin/upload/:problemId" element={<UploadVideo />} />
            <Route
              path="/admin/upload-video/:problemId"
              element={<UploadVideo />}
            />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/analytics" element={<PlatformAnalytics />} />
            <Route path="/admin/user-analytics" element={<UserAnalytics />} />
            <Route path="/admin/contest" element={<AdminContest />} />
            <Route
              path="/admin/contest/create"
              element={<CreateContestForm />}
            />
            <Route path="/admin/contest/:id" element={<AdminContestDetail />} />
          </Route>

          {/* 404 & Fallback */}
          <Route path="/not-found" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/not-found" replace />} />
        </AppRoutes>
      </Suspense>
    </AppRouter>
  );
};

export default Routes;
