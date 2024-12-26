// src/components/VolunteerDashboard.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import Leaderboard from "./Leaderboard";
import Navbar from "./Navbar";

const VolunteerDashboard = () => {
  const [problems, setProblems] = useState([]);
  const [leaderboard, setLeaderboard] = useState({ volunteers: [] });
  const [selectedProblem, setSelectedProblem] = useState(null);
  const volunteerId = localStorage.getItem("userId");

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
    }
  };

  const handleStatusUpdate = async (problemId, newStatus) => {
    try {
      const response = await axios.patch(
        `/api/problems/${problemId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      await fetchData(); // Refresh all data
      setSelectedProblem(null); // Close detail view
    } catch (error) {
      console.error("Error updating problem status:", error);
    }
  };

  const openLocationInMaps = (latitude, longitude) => {
    window.open(
      `https://www.google.com/maps?q=${latitude},${longitude}`,
      "_blank"
    );
  };

  const ProblemCard = ({ problem }) => (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-semibold">{problem.title}</h3>
          <p className="text-gray-600">{problem.description}</p>
          <p className="text-sm text-gray-500 mt-2">
            Category: {problem.category.replace("_", " ")}
          </p>
          <p className="text-sm text-gray-500">Points: {problem.points}</p>
          <p className="text-sm text-gray-500">
            Status:{" "}
            <span
              className={`font-semibold ${
                problem.status === "solved"
                  ? "text-green-600"
                  : problem.status === "in_progress"
                  ? "text-yellow-600"
                  : "text-blue-600"
              }`}
            >
              {problem.status.replace("_", " ")}
            </span>
          </p>
          <p className="text-sm text-gray-500">
            Reported by: {problem.reportedBy?.name}
          </p>
        </div>
        {problem.photoUrl && (
          <img
            src={problem.photoUrl}
            alt="Problem"
            className="w-32 h-32 object-cover rounded-md"
          />
        )}
      </div>

      <div className="mt-4 flex space-x-4">
        {problem.location?.coordinates && (
          <button
            onClick={() =>
              openLocationInMaps(
                problem.location.coordinates[1],
                problem.location.coordinates[0]
              )
            }
            className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            View Location
          </button>
        )}

        {problem.status === "pending" && (
          <button
            onClick={() => handleStatusUpdate(problem._id, "assigned")}
            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Take Problem
          </button>
        )}

        {problem.status === "assigned" &&
          problem.assignedTo?._id === volunteerId && (
            <button
              onClick={() => handleStatusUpdate(problem._id, "in_progress")}
              className="px-3 py-1 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
            >
              Start Work
            </button>
          )}

        {problem.status === "in_progress" &&
          problem.assignedTo?._id === volunteerId && (
            <button
              onClick={() => handleStatusUpdate(problem._id, "solved")}
              className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Mark as Solved
            </button>
          )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Volunteer Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Available Problems</h2>
            <div className="space-y-4">
              {problems
                .filter((p) => p.status === "pending")
                .map((problem) => (
                  <ProblemCard key={problem._id} problem={problem} />
                ))}
            </div>

            <h2 className="text-2xl font-semibold mb-4 mt-8">
              Your Active Problems
            </h2>
            <div className="space-y-4">
              {problems
                .filter(
                  (p) =>
                    ["assigned", "in_progress"].includes(p.status) &&
                    p.assignedTo?._id === volunteerId
                )
                .map((problem) => (
                  <ProblemCard key={problem._id} problem={problem} />
                ))}
            </div>

            <h2 className="text-2xl font-semibold mb-4 mt-8">
              Solved Problems
            </h2>
            <div className="space-y-4">
              {problems
                .filter(
                  (p) =>
                    p.status === "solved" && p.assignedTo?._id === volunteerId
                )
                .map((problem) => (
                  <ProblemCard key={problem._id} problem={problem} />
                ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">
              Volunteer Leaderboard
            </h2>
            <Leaderboard data={{ volunteers: leaderboard.volunteers }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;
