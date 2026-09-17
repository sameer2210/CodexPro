import { lazy, Suspense } from 'react';
import {
  BrowserRouter as AppRouter,
  Routes as AppRoutes,
  Navigate,
  Outlet,
  Route,
} from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAppSelector } from '../store/hooks';

// Lazy load components for performance
const Login = lazy(() => import('../views/auth/Login'));
const Register = lazy(() => import('../views/auth/Register'));
const ForgotPassword = lazy(() => import('../components/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('../components/auth/ResetPassword'));

const Landing = lazy(() => import('../views/Landing'));
const Dashboard = lazy(() => import('../views/Dashboard'));
const CreateProject = lazy(() => import('../views/create-project/CreateProject'));
const Project = lazy(() => import('../views/home/project/Project'));

const Problem = lazy(() => import('../views/Problem'));
const ProblemSolve = lazy(() => import('../views/ProblemSolve'));
const ContestPage = lazy(() => import('../views/ContestPage'));
const DiscussPage = lazy(() => import('../views/DiscussPage'));
const DiscussionDetail = lazy(() => import('../views/DiscussionDetail'));
const DSAVisualizer = lazy(() => import('../views/DSAVisualizer'));
const Explore = lazy(() => import('../views/Explore'));
const Interview = lazy(() => import('../views/Interview'));
const UserProfile = lazy(() => import('../views/UserProfile'));
const AdminPage = lazy(() => import('../views/AdminPage'));
const Homepage = lazy(() => import('../views/Homepage'));

const Settings = lazy(() => import('../components/page/Settings'));
const Help = lazy(() => import('../components/page/Help'));
const ActiveMemberPage = lazy(() => import('../components/page/ActiveMemberPage'));
const Notification = lazy(() => import('../components/page/Notification'));
const Meeting = lazy(() => import('../components/page/Meeting'));
const NotFound = lazy(() => import('../views/NotFound'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0B0E11]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-[#17E1FF]/20 border-t-[#17E1FF] rounded-full animate-spin" />
      <p className="text-sm font-mono text-white/40 uppercase tracking-widest">Loading CodeX...</p>
    </div>
  </div>
);

// Private route wrapper - checks Redux state or stored token
const PrivateRoute = () => {
  const reduxIsAuth = useAppSelector(state => state.auth.isAuthenticated);
  const token = localStorage.getItem('codex_token') || localStorage.getItem('token');
  const isAuthenticated = reduxIsAuth || !!token;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// Public route wrapper - redirects to dashboard if authenticated
const PublicRoute = () => {
  const reduxIsAuth = useAppSelector(state => state.auth.isAuthenticated);
  const token = localStorage.getItem('codex_token') || localStorage.getItem('token');
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
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<Dashboard />} />
            <Route path="/create-project" element={<CreateProject />} />
            <Route path="/project/:id" element={<Project />} />

            {/* Platform Features */}
            <Route path="/problems" element={<Problem />} />
            <Route path="/problem/:problemId" element={<ProblemSolve />} />
            <Route path="/contests" element={<ContestPage />} />
            <Route path="/discuss" element={<DiscussPage />} />
            <Route path="/discussion/:discussionId" element={<DiscussionDetail />} />
            <Route path="/visualizer" element={<DSAVisualizer />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/interview" element={<Interview />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/homepage" element={<Homepage />} />

            {/* Helper pages */}
            <Route path="/meeting" element={<Meeting />} />
            <Route path="/meeting/:projectId" element={<Meeting />} />
            <Route path="/active-members" element={<ActiveMemberPage />} />
            <Route path="/team" element={<Dashboard />} />
            <Route path="/activity" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/help" element={<Help />} />
            <Route path="/notifications" element={<Notification />} />
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
