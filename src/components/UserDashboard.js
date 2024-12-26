/**
 * The UserDashboard component in React fetches data, displays user-reported and nearby problems, and
 * includes a leaderboard and a modal for reporting new problems.
 *
 * Returns:
 *   The `UserDashboard` component is being returned. It is a functional component that fetches data
 * from an API, displays the user's reported problems, nearby problems, and a leaderboard. It also
 * includes a button to report a new problem which opens a modal for reporting a problem.
 */
// src/components/UserDashboard.js
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import Navbar from "./Navbar";
import AnimatedCard from "./AnimatedCard";
import AnimatedSection from "./AnimatedSection";
import AnimatedButton from "./AnimatedButton";
import { showToast } from "./ToastContainer";
import ProblemList from "./ProblemList";
import ReportProblem from "./ReportProblem";
import Leaderboard from "./Leaderboard";

const UserDashboard = () => {
  const [problems, setProblems] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [leaderboard, setLeaderboard] = useState({ users: [], volunteers: [] });
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [problemsRes, leaderboardRes] = await Promise.all([
        axios.get("/api/problems", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
        axios.get("/api/problems/leaderboards"),
      ]);

      setProblems(problemsRes.data);
      setLeaderboard(leaderboardRes.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      showToast("Failed to fetch dashboard data", "error");
    }
  };

  const userProblems = problems.filter((p) => p.reportedBy?._id === userId);
  const nearbyProblems = problems.filter((p) => p.reportedBy?._id !== userId);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <motion.h1
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            className="text-4xl font-bold text-gray-800"
          >
            Dashboard
          </motion.h1>

          <AnimatedButton
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-2"
          >
            Report Problem
            <svg
              className="w-6 h-6 group-hover:rotate-45 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </AnimatedButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatedSection title="Your Reported Problems">
            <div className="space-y-4">
              {userProblems.map((problem, index) => (
                <AnimatedCard key={problem._id} delay={index * 0.1}>
                  <ProblemList problems={[problem]} />
                </AnimatedCard>
              ))}
            </div>
          </AnimatedSection>

          <div>
            <AnimatedSection title="Nearby Problems">
              <div className="h-[600px] overflow-hidden rounded-xl bg-white shadow-md">
                <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-500 scrollbar-track-gray-100">
                  {nearbyProblems.length > 0 ? (
                    <div className="space-y-4 p-4">
                      {nearbyProblems.map((problem, index) => (
                        <motion.div
                          key={problem._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <ProblemList problems={[problem]} />
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      No nearby problems reported yet
                    </div>
                  )}
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>

        <div className="mt-8">
          <AnimatedSection title="Leaderboard">
            <Leaderboard data={leaderboard} />
          </AnimatedSection>
        </div>
      </div>

      {showReportModal && (
        <ReportProblem
          onClose={() => setShowReportModal(false)}
          onSubmit={async (newProblem) => {
            setProblems([...problems, newProblem]);
            setShowReportModal(false);
            showToast("Problem reported successfully!");
            await fetchData();
          }}
        />
      )}
    </div>
  );
};

export default UserDashboard;
