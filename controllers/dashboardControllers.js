const dashboardService = require("../services/dashboardService");

async function getDashboardSummary(req, res) {
  const value = await dashboardService.getDashboardSummary(req.user.id);
  return res.status(200).json({ success: true, value });
}

module.exports = { getDashboardSummary };
