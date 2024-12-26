import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import * as d3 from "d3";
import analyticsService from "../services/analyticsService";

const AnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const svgRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const analyticsData = await analyticsService.getAnalytics();
        setData(analyticsData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
        setError("Unable to load analytics. Please try again later.");
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (data && svgRef.current) {
      drawCharts();
    }
  }, [data]);

  const drawCharts = () => {
    const svg = d3.select(svgRef.current);
    const width = 600;
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };

    // Clear previous charts
    svg.selectAll("*").remove();

    // Safely check if dailyReports exists and has data
    if (!data.dailyReports || data.dailyReports.length === 0) {
      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .text("No trend data available");
      return;
    }

    // Draw trend line
    const trendLine = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleTime()
      .domain(d3.extent(data.dailyReports, (d) => new Date(d.date)))
      .range([0, width - margin.left - margin.right]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data.dailyReports, (d) => d.count)])
      .range([height - margin.top - margin.bottom, 0]);

    trendLine
      .append("path")
      .datum(data.dailyReports)
      .attr("fill", "none")
      .attr("stroke", "#10B981")
      .attr("stroke-width", 2)
      .attr(
        "d",
        d3
          .line()
          .x((d) => x(new Date(d.date)))
          .y((d) => y(d.count))
      );

    // Add axes
    trendLine
      .append("g")
      .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
      .call(d3.axisBottom(x));

    trendLine.append("g").call(d3.axisLeft(y));
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="p-6">
        <div
          className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  // No Data State
  if (!data) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded relative">
          No analytics data available.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h2>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            title: "Total Reports",
            value: data.totalReports,
            growth: data.reportGrowth,
            className: "text-gray-800",
            growthClassName: "text-green-500",
          },
          {
            title: "Resolution Rate",
            value: `${data.resolutionRate}%`,
            growth: `${data.avgResolutionTime} hours avg.`,
            className: "text-emerald-600",
            growthClassName: "text-emerald-500",
          },
          {
            title: "Active Volunteers",
            value: data.activeVolunteers,
            growth: `+${data.volunteerGrowth}%`,
            className: "text-blue-600",
            growthClassName: "text-blue-500",
          },
        ].map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h3 className="text-gray-500 text-sm">{metric.title}</h3>
            <p className={`text-3xl font-bold ${metric.className}`}>
              {metric.value}
              <span className={`text-sm ${metric.growthClassName} ml-2`}>
                {metric.growth}
              </span>
            </p>
          </motion.div>
        ))}
      </div>
      {/* Charts Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Problem Trends</h3>
          <svg ref={svgRef} className="w-full h-64" />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Category Distribution</h3>
          <div className="space-y-4">
            {Object.entries(data.categoryDistribution).map(
              ([category, count]) => (
                <div key={category} className="flex items-center">
                  <div className="w-32 text-gray-600">
                    {category.replace("_", " ")}
                  </div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500"
                        style={{
                          width: `${(count / data.totalReports) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="w-16 text-right text-gray-600">{count}</div>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Predictions Section */}
      <div className="mt-8">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Trend Predictions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="text-blue-800 font-medium">Expected Reports</h4>
              <p className="text-2xl font-bold text-blue-900 mt-2">
                {data.predictions.expectedReports}
                <span className="text-sm text-blue-700 ml-2">next week</span>
              </p>
            </div>

            <div className="p-4 bg-emerald-50 rounded-lg">
              <h4 className="text-emerald-800 font-medium">
                Estimated Resolution
              </h4>
              <p className="text-2xl font-bold text-emerald-900 mt-2">
                {data.predictions.estimatedResolution}%
                <span className="text-sm text-emerald-700 ml-2">
                  success rate
                </span>
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="text-purple-800 font-medium">
                Volunteer Engagement
              </h4>
              <p className="text-2xl font-bold text-purple-900 mt-2">
                {data.predictions.volunteerEngagement}
                <span className="text-sm text-purple-700 ml-2">active/day</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Summary */}
      <div className="mt-8">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Community Impact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-gray-600 font-medium">Most Active Areas</h4>
                <ul className="mt-2 space-y-2">
                  {data.impactMetrics.activeAreas.map((area, index) => (
                    <li key={index} className="flex justify-between">
                      <span>{area.name}</span>
                      <span className="font-medium">
                        {area.reportCount} reports
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-gray-600 font-medium">
                  Resolution Success
                </h4>
                <div className="mt-2">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{
                            width: `${data.impactMetrics.resolutionSuccess}%`,
                          }}
                        />
                      </div>
                    </div>
                    <span className="ml-4 font-medium">
                      {data.impactMetrics.resolutionSuccess}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {data.impactMetrics.totalResolved} problems resolved out of{" "}
                    {data.totalReports}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
