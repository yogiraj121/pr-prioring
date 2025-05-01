import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Sidebar from "./Sidebar";
import { ticketService, userService } from "../services/api";
import "./Analytics.css";

export default function CustomerAnalyticsDashboard() {
  const [period, setPeriod] = useState("10 weeks");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({
    missedChats: [
      { week: "Week 1", missedChats: 14 },
      { week: "Week 2", missedChats: 8 },
      { week: "Week 3", missedChats: 15 },
      { week: "Week 4", missedChats: 9 },
      { week: "Week 5", missedChats: 6 },
      { week: "Week 6", missedChats: 13 },
      { week: "Week 7", missedChats: 3 },
      { week: "Week 8", missedChats: 9 },
      { week: "Week 9", missedChats: 17 },
      { week: "Week 10", missedChats: 15 },
    ],
    replyTime: 0,
    resolvedPercentage: 80,
    totalChats: 122,
  });

  // Fetch user role
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await userService.getCurrentUser();
        setUserRole(response.role);
      } catch (err) {
        console.error("Failed to get user role:", err);
      }
    };
    fetchUserRole();
  }, []);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get all tickets
        const response = await ticketService.getAllTickets();
        const tickets = response.data.tickets;

        // Filter tickets based on user role
        const filteredTickets = tickets;

        // Calculate total tickets and resolved count
        const totalTickets = filteredTickets.length;
        const resolvedTickets = filteredTickets.filter(
          (t) => t.status === "resolved"
        ).length;

        // Calculate weekly missed chats (unresolved tickets)
        // Group tickets by week
        const weeklyData = {};
        const now = new Date();

        filteredTickets.forEach((ticket) => {
          const ticketDate = new Date(ticket.createdAt);
          const weekDiff = Math.floor(
            (now - ticketDate) / (7 * 24 * 60 * 60 * 1000)
          );

          if (weekDiff < 10) {
            // Only consider last 10 weeks
            const weekKey = `Week ${10 - weekDiff}`;
            if (!weeklyData[weekKey]) {
              weeklyData[weekKey] = {
                total: 0,
                unresolved: 0,
              };
            }
            weeklyData[weekKey].total++;
            if (ticket.status === "unresolved") {
              weeklyData[weekKey].unresolved++;
            }
          }
        });

        // Create missed chats data array
        const missedChats = Array.from({ length: 10 }, (_, i) => {
          const weekKey = `Week ${i + 1}`;
          return {
            week: weekKey,
            missedChats: weeklyData[weekKey]?.unresolved || 0,
          };
        });

        // Calculate average reply time
        let totalReplyTime = 0;
        let messageCount = 0;

        for (const ticket of filteredTickets) {
          if (ticket.messages && ticket.messages.length > 1) {
            const firstMessage = new Date(ticket.messages[0].timestamp);
            const firstReply = ticket.messages.find(
              (m) => m.sender !== ticket.messages[0].sender
            );

            if (firstReply) {
              const replyTime = new Date(firstReply.timestamp) - firstMessage;
              totalReplyTime += replyTime / 1000; // Convert to seconds
              messageCount++;
            }
          }
        }

        const averageReplyTime =
          messageCount > 0 ? Math.round(totalReplyTime / messageCount) : 0;

        // Calculate resolved percentage
        const resolvedPercentage =
          totalTickets > 0
            ? Math.round((resolvedTickets / totalTickets) * 100)
            : 0;

        setAnalyticsData({
          missedChats,
          replyTime: averageReplyTime,
          resolvedPercentage,
          totalChats: totalTickets,
        });
      } catch (err) {
        console.error("Error fetching analytics data:", err);
        setError("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };

    if (userRole) {
      fetchAnalyticsData();
    }
  }, [userRole, period]);

  return (
    <div className="dashboard">
      <div className="sidebar">
        <Sidebar />
      </div>

      <div className="main-content">
        <header>
          <h1>Analytics</h1>
          <div className="header-controls">
            <div className="period-selector">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option value="7 days">Last 7 days</option>
                <option value="10 weeks">Last 10 weeks</option>
                <option value="6 months">Last 6 months</option>
                <option value="1 year">Last year</option>
              </select>
            </div>
          </div>
        </header>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        <div className="analytics-panels">
          <section className="panel missed-chats">
            <div className="panel-header">
              <h2>Missed Chats</h2>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart
                  data={analyticsData.missedChats}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="week"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    domain={[
                      0,
                      Math.max(
                        ...analyticsData.missedChats.map((d) => d.missedChats)
                      ) + 5,
                    ]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="custom-tooltip">
                            <p className="label">Missed Chats</p>
                            <p className="value">{payload[0].value}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="missedChats"
                    stroke="#32CD32"
                    strokeWidth={3}
                    dot={{
                      stroke: "#32CD32",
                      strokeWidth: 2,
                      r: 4,
                      fill: "white",
                    }}
                    activeDot={{
                      r: 6,
                      stroke: "#32CD32",
                      strokeWidth: 2,
                      fill: "white",
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="panel reply-time">
            <div className="panel-header">
              <h2>Average Reply Time</h2>
            </div>
            <div className="panel-content two-column">
              <div className="description">
                <p>
                  For highest customer satisfaction rates you should aim to
                  reply to an incoming customer's message in 15 seconds or less.
                  Quick responses will get you more conversations, help you earn
                  customers trust and make more sales.
                </p>
              </div>
              <div className="metric-highlight">
                <span className="value">{analyticsData.replyTime}</span> secs
              </div>
            </div>
          </section>

          <section className="panel resolved-tickets">
            <div className="panel-header">
              <h2>Resolved Tickets</h2>
            </div>
            <div className="panel-content two-column">
              <div className="description">
                <p>
                  This shows the percentage of tickets that have been
                  successfully resolved. A higher percentage indicates better
                  customer service and support efficiency.
                  {analyticsData.resolvedPercentage >= 80
                    ? " Great job maintaining a high resolution rate!"
                    : " There's room for improvement in ticket resolution rate."}
                </p>
              </div>
              <div className="circular-progress">
                <svg viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="rgba(0, 0, 0, 0.1)"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#32CD32"
                    strokeWidth="3"
                    strokeDasharray={`${analyticsData.resolvedPercentage}, 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="percentage">
                  {analyticsData.resolvedPercentage}%
                </div>
              </div>
            </div>
          </section>

          <section className="panel total-chats">
            <div className="panel-header">
              <h2>Total Chats</h2>
            </div>
            <div className="panel-content two-column">
              <div className="description">
                <p>
                  This metric shows the total number of chats{" "}
                  {period.toLowerCase()}.
                  {userRole === "admin"
                    ? " As an admin, you can see all chats across the system."
                    : " This includes all chats assigned to you."}
                </p>
              </div>
              <div className="metric-highlight">
                <span className="value">{analyticsData.totalChats}</span> Chats
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
