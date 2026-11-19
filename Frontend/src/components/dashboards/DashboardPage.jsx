import { useEffect, useState, useCallback } from "react";
import {
  fetchUserProfile,
  fetchProblemsSolved,
  fetchAllProblems,
  fetchUserStreaks,
  fetchUserBadges,
  fetchUserRank,
  fetchAllUserSubmissions,
  fetchHeatmapData,
} from "../../utils/apis/dashboardApi";
import SidebarProfileCard from "../common/SidebarProfileCard";
import StatsOverview from "../project/StatsOverview";
import HeatmapCalendar from "../common/HeatmapCalendar";
import SubmissionsTabs from "../project/SubmissionsTabs";
import ProblemCard from "../contest/ProblemCard";
import Navbar from "../layout/Navbar";
import LoadingSpinner from "../ui/LoadingSpinner";
import { getSocket } from "../../utils/socket";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const settledValue = (result, fallback) =>
  result.status === "fulfilled" ? result.value : fallback;

const buildProblemStats = (allProblems, solvedProblems) => {
  const list = Array.isArray(allProblems) ? allProblems : [];
  const solved = Array.isArray(solvedProblems) ? solvedProblems : [];
  const countByDifficulty = (items, difficulty) =>
    items.filter(
      (p) => (p.difficulty || "").toLowerCase() === difficulty.toLowerCase(),
    ).length;

  return {
    totalProblems: list.length,
    solvedCount: solved.length,
    unsolvedCount: Math.max(list.length - solved.length, 0),
    easy: countByDifficulty(solved, "easy"),
    medium: countByDifficulty(solved, "medium"),
    hard: countByDifficulty(solved, "hard"),
    attempting: 0,
    problems: list,
  };
};

const DashboardPage = () => {
  const { user: authUser } = useSelector((state) => state.auth);
  const [profileUser, setProfileUser] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    problemsSolved: [],
    allProblems: null,
    streaks: { currentStreak: 0, maxStreak: 0 },
    badges: [],
    rank: null,
    fullSubmissions: [],
    activity: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [partialErrors, setPartialErrors] = useState([]);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPartialErrors([]);

    const results = await Promise.allSettled([
      fetchUserProfile(),
      fetchProblemsSolved(),
      fetchAllProblems(),
      fetchUserStreaks(),
      fetchUserBadges(),
      fetchUserRank(),
      fetchAllUserSubmissions(),
      fetchHeatmapData(),
    ]);

    const labels = [
      "profile",
      "solved",
      "problems",
      "streaks",
      "badges",
      "rank",
      "submissions",
      "heatmap",
    ];
    const failures = results
      .map((r, i) =>
        r.status === "rejected"
          ? `${labels[i]}: ${r.reason?.message || "failed"}`
          : null,
      )
      .filter(Boolean);

    // Hard fail only if every request failed
    if (failures.length === results.length) {
      setError(failures.join("; ") || "Failed to fetch dashboard data");
      setLoading(false);
      return;
    }

    if (failures.length) setPartialErrors(failures);

    const profile = settledValue(results[0], null);
    const solvedPayload = settledValue(results[1], { problems: [] });
    const allProblems = settledValue(results[2], []);
    const streaks = settledValue(results[3], {
      currentStreak: 0,
      maxStreak: 0,
    });
    const badgesPayload = settledValue(results[4], { badges: [] });
    const rank = settledValue(results[5], null);
    const submissions = settledValue(results[6], []);
    const heatmap = settledValue(results[7], {});

    const solvedProblems = Array.isArray(solvedPayload)
      ? solvedPayload
      : solvedPayload?.problems || [];
    const badges = Array.isArray(badgesPayload)
      ? badgesPayload
      : badgesPayload?.badges || [];
    const activity = Array.isArray(heatmap)
      ? heatmap
      : heatmap?.submissions || [];

    setProfileUser(profile);
    setDashboardData({
      problemsSolved: solvedProblems,
      allProblems: buildProblemStats(allProblems, solvedProblems),
      streaks: {
        currentStreak:
          streaks?.currentStreak ?? profile?.streak ?? 0,
        maxStreak: streaks?.maxStreak ?? 0,
      },
      badges,
      rank,
      fullSubmissions: Array.isArray(submissions) ? submissions : [],
      activity: Array.isArray(activity) ? activity : [],
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;

    const handleUserStatsUpdate = () => {
      fetchDashboardData();
    };
    socket.on("userStatsUpdate", handleUserStatsUpdate);
    return () => {
      socket.off("userStatsUpdate", handleUserStatsUpdate);
    };
  }, [fetchDashboardData]);

  const displayUser = profileUser || authUser;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-900 to-black">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (error) return <ErrorDisplay message={error} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black font-poppins text-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8 p-6 md:p-8">
        {partialErrors.length > 0 && (
          <div className="lg:col-span-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            Some widgets could not load: {partialErrors.join(" · ")}
          </div>
        )}

        <div className="lg:col-span-1 space-y-8">
          <SidebarProfileCard
            user={displayUser}
            stats={dashboardData.allProblems}
            rank={dashboardData.rank?.rank}
          />
        </div>

        <div className="lg:col-span-3 space-y-8">
          <StatsOverview
            stats={dashboardData.allProblems}
            streaks={dashboardData.streaks}
            badges={dashboardData.badges}
            rank={dashboardData.rank}
            loading={false}
            user={displayUser}
          />

          <HeatmapCalendar activity={dashboardData.activity} />

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-orange-400 flex items-center">
                  <span className="mr-2">🎯</span>
                  Recent Problems
                </h2>
                <Link
                  to="/problems"
                  className="text-orange-400 hover:text-orange-300 font-semibold text-sm transition-colors duration-200 hover:underline"
                >
                  View all →
                </Link>
              </div>

              <div className="space-y-4">
                {dashboardData.allProblems?.problems?.length > 0 ? (
                  dashboardData.allProblems.problems
                    .slice(0, 5)
                    .map((problem) => (
                      <div
                        key={problem._id}
                        className="group p-4 rounded-xl border border-gray-700 hover:border-orange-500/50 bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-300"
                      >
                        <ProblemCard problem={problem} compact />
                      </div>
                    ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="text-6xl mb-4 opacity-50">🚀</div>
                    <div className="text-gray-400 text-lg mb-2">
                      No problems available yet
                    </div>
                    <Link
                      to="/problems"
                      className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200 font-semibold"
                    >
                      Browse Problems
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          <SubmissionsTabs
            submissions={dashboardData.fullSubmissions}
            loading={false}
          />
        </div>
      </div>
    </div>
  );
};

const ErrorDisplay = ({ message }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-900 to-black">
    <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 max-w-md text-center backdrop-blur-sm">
      <div className="text-6xl mb-4">⚠️</div>
      <h3 className="text-2xl font-bold text-red-400 mb-4">
        Oops! Something went wrong
      </h3>
      <p className="text-gray-300 mb-6">{message}</p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 font-semibold"
      >
        Try Again
      </button>
    </div>
  </div>
);

export default DashboardPage;
