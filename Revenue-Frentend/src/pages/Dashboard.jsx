import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Calendar, TrendingUp, Package, DollarSign, BarChart3, Info, ShoppingCart, Star, Clock, PieChart, Eye, ShoppingBag, Users, RotateCcw, CheckCircle, Loader } from "lucide-react";
import axios from "axios";

const Dashboard = () => {
  // State variables for date range, graph visibility, chart data, and statistics
  // Initialize dates as ISO strings for consistent input[type="date"] binding
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showGraph, setShowGraph] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrder, setRecentOrder] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [website, setWebsite] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Helper function to format date for display
  const formatDate = (dateString) => {
    // Convert string to Date object for formatting
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Main function to fetch and display revenue data
  const handleShowRevenue = async () => {
    setLoading(true);
    setError("");
    setShowGraph(false);

    try {
      // Input validation: Ensure 'From Date' is not after 'To Date'
      // Convert string dates to Date objects for comparison
      const fromDateObj = new Date(fromDate);
      const toDateObj = new Date(toDate);

      if (fromDateObj > toDateObj) {
        throw new Error("From date cannot be later than To date. Please select a valid range.");
      }

      // Fetch sales data
      const salesResponse = await axios.get("http://localhost:5000/api/sales-data", {
        params: {
          fromDate: fromDate, // Use the ISO string directly
          toDate: toDate,     // Use the ISO string directly
          website,
        },
      });

      // Fetch additional data in parallel
      const [productsResponse, ordersResponse, metricsResponse] = await Promise.all([
        axios.get("http://localhost:5000/api/top-products"),
        axios.get("http://localhost:5000/api/recent-orders"),
        axios.get("http://localhost:5000/api/performance-metrics")
      ]);

      const salesData = salesResponse.data;
      const productsData = productsResponse.data;
      const ordersData = ordersResponse.data;
      const metricsData = metricsResponse.data;

      // Check if data is valid and not empty
      if (!salesData || !salesData.chartData || salesData.chartData.length === 0) {
        throw new Error("No sales data available for the selected date range and website.");
      }

      // Process the chart data for display
      const processedChartData = salesData.chartData.map((entry) => ({
        date: entry.date,
        revenue: entry.revenue,
        orders: entry.orders,
        formattedRevenue: `₹${entry.revenue.toLocaleString()}`
      }));

      // Update state with fetched data
      setChartData(processedChartData);
      setTopProducts(productsData);
      setRecentOrder(ordersData);
      setPerformanceMetrics(metricsData);
      setTotalPrice(salesData.totalRevenue);
      setShowGraph(true);

    } catch (error) {
      console.error("Failed to fetch sales data:", error);
      const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Custom Tooltip component for the Recharts LineChart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg border-blue-200">
          <p className="font-medium text-gray-800">{`Date: ${label}`}</p>
          <p className="text-blue-600 font-semibold">
            {`Revenue: ₹${payload[0].value.toLocaleString()}`}
          </p>
          {payload[1] && (
            <p className="text-green-600 font-semibold">
              {`Order: ${payload[1].value}`}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Statistics Card component for displaying key metrics
  const StatsCard = ({ title, value, icon, color, subtitle }) => (
    <div className={`bg-gradient-to-r ${color} p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div className="p-2 rounded-lg bg-white bg-opacity-50">
          {React.cloneElement(icon, { className: "w-8 h-8" })}
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      {subtitle && <p className="text-sm text-gray-700">{subtitle}</p>}
    </div>
  );

  // Status Badge component for order status
  const StatusBadge = ({ status }) => {
    const getStatusStyle = (status) => {
      switch (status.toLowerCase()) {
        case 'completed':
          return 'bg-green-100 text-green-700 border-green-200';
        case 'processing':
          return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        case 'pending':
          return 'bg-gray-100 text-gray-700 border-gray-200';
        default:
          return 'bg-blue-100 text-blue-700 border-blue-200';
      }
    };

    const getStatusIcon = (status) => {
      switch (status.toLowerCase()) {
        case 'completed':
          return <CheckCircle className="w-3 h-3" />;
        case 'processing':
          return <Loader className="w-3 h-3" />;
        default:
          return <Clock className="w-3 h-3" />;
      }
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border rounded-full ${getStatusStyle(status)}`}>
        {getStatusIcon(status)}
        {status}
      </span>
    );
  };

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen font-sans antialiased">
      {/* Header Section */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2 flex items-center gap-3">
          <BarChart3 className="text-blue-600" size={40} />
          INCOME DASHBOARD
        </h1>
        <p className="text-gray-600 text-lg">Track your website revenue and analyze sales performance</p>
      </div>

      {/* Error Message Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-6 py-4 rounded-lg mb-6 shadow-sm flex items-center animate-slide-up">
          <div className="flex-shrink-0 mr-3">
            <Info className="h-5 w-5 text-red-400" />
          </div>
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-8 animate-slide-up">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Calendar className="text-blue-600" size={24} />
          Filter Options
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* From Date Picker */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow relative">
            <h3 className="text-sm font-medium mb-2 text-gray-700 flex items-center gap-2">
              <Calendar className="text-green-600 w-4 h-4" />
              From Date
            </h3>
            <input
              type="date"
              value={fromDate} // Bound to the ISO string state
              onChange={(e) => setFromDate(e.target.value)} // Update state with the ISO string
              className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-medium text-gray-800 cursor-pointer transition-colors"
            />
          </div>

          {/* To Date Picker */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow relative">
            <h3 className="text-sm font-medium mb-2 text-gray-700 flex items-center gap-2">
              <Calendar className="text-red-600 w-4 h-4" />
              To Date
            </h3>
            <input
              type="date"
              value={toDate} // Bound to the ISO string state
              onChange={(e) => setToDate(e.target.value)} // Update state with the ISO string
              className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-medium text-gray-800 cursor-pointer transition-colors"
            />
          </div>

          {/* Website Selector */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <h3 className="text-sm font-medium mb-2 text-gray-700 flex items-center gap-2">
              <Package className="text-purple-600 w-4 h-4" />
              Select Website
            </h3>
            <select
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-medium text-gray-800 cursor-pointer"
            >
              <option value="all">All Websites</option>
              <option value="Shopify">Shopify</option>
              <option value="Woocommerce">Woocommerce</option>
              <option value="Gowhats">Gowhats</option>
              <option value="Instabox">Instrabot</option>
            </select>
          </div>

          {/* Show Revenue Button */}
          <div className="flex items-end justify-center">
            <button
              onClick={handleShowRevenue}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-3 rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200 w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-bold text-lg group"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Loading...
                </>
              ) : (
                <>
                  <TrendingUp size={20} className="group-hover:scale-110 transition-transform" />
                  Show Revenue
                </>
              )}
            </button>
          </div>
        </div>

        {/* Date Range Summary */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm">
            <span className="text-blue-800 font-medium">Selected Range:</span>
            <span className="text-blue-900 font-bold mt-1 sm:mt-0">
              {formatDate(fromDate)} → {formatDate(toDate)}
            </span>
          </div>
          {website !== "all" && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm mt-2">
              <span className="text-blue-800 font-medium">Website:</span>
              <span className="text-blue-900 font-bold mt-1 sm:mt-0">{website}</span>
            </div>
          )}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm mt-2">
            <span className="text-blue-800 font-medium">Duration:</span>
            <span className="text-blue-900 font-bold mt-1 sm:mt-0">
              {Math.ceil((new Date(toDate) - new Date(fromDate)) / (1000 * 60 * 60 * 24)) + 1} days
            </span>
          </div>
        </div>
      </div>

      {/* Loading State Display */}
      {loading && (
        <div className="flex flex-col justify-center items-center py-16 bg-white rounded-2xl shadow-lg border border-gray-200 mb-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium text-lg">Fetching revenue data...</p>
          <p className="text-gray-500 text-sm mt-1">Please wait while we process your request</p>
        </div>
      )}

      {/* Results Section (displayed after data is fetched and not loading) */}
      {showGraph && !loading && (
        <div className="animate-fade-in">
          {/* Statistics Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatsCard
              title="Total Revenue"
              value={`₹${totalPrice.toLocaleString()}`}
              icon={<DollarSign className="text-green-600" />}
              color="from-green-100 to-emerald-100"
              subtitle={`Average: ₹${Math.round(totalPrice / chartData.length).toLocaleString()}/day`}
            />
            <StatsCard
              title="Total Order"
              value={chartData.reduce((sum, item) => sum + (item.orders || 0), 0).toLocaleString()}
              icon={<ShoppingCart className="text-blue-600" />}
              color="from-blue-100 to-indigo-100"
              subtitle={`Average: ${Math.round(chartData.reduce((sum, item) => sum + (item.orders || 0), 0) / chartData.length)} orders/day`}
            />
            <StatsCard
              title="Top Products"
              value={topProducts.length}
              icon={<Star className="text-amber-600" />}
              color="from-purple-100 to-pink-100"
              subtitle="Unique bestsellers"
            />
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Revenue Chart - Takes 2/3 of the space */}
            <div className="xl:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <TrendingUp className="text-blue-600" />
                  Revenue Trends
                </h3>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span className="text-gray-600">Daily Revenue</span>
                  </div>
                </div>
              </div>
              
              <div className="h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#666" 
                      fontSize={12} 
                      angle={-45} 
                      textAnchor="end" 
                      height={80} 
                    />
                    <YAxis 
                      stroke="#666" 
                      fontSize={12} 
                      tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} 
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      strokeWidth={4}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
                      activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 3, fill: '#ffffff' }}
                      name="Daily Revenue (₹)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Products List - Takes 1/3 of the space */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Package className="text-amber-600" />
                Top Products
              </h3>
              
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <Package className="text-blue-600 w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.sales} sales</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">₹{product.revenue.toLocaleString()}</p>
                      <p className={`text-xs font-medium ${product.growth.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {product.growth}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button className="w-full text-center text-blue-600 hover:text-blue-700 font-medium transition-colors hover:bg-blue-50 py-2 rounded-lg">
                  View All Products →
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Section - Recent Order and Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {/* Recent Order */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Clock className="text-blue-600" />
                Recent Order
              </h3>
              
              <div className="space-y-4">
                {recentOrder.map((orders) => (
                  <div key={orders.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 px-3 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-600">#{orders.ordersNumber}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{orders.customer}</p>
                        <p className="text-sm text-gray-500">{orders.timeAgo}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">₹{orders.amount.toLocaleString()}</p>
                      <StatusBadge status={orders.status} />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button className="w-full text-center text-blue-600 hover:text-blue-700 font-medium transition-colors hover:bg-blue-50 py-2 rounded-lg">
                  View All Order →
                </button>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <PieChart className="text-purple-600" />
                Performance Metrics
              </h3>
              
              {performanceMetrics && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Eye className="text-blue-600 w-5 h-5" />
                      </div>
                      <span className="font-medium text-gray-700">Conversion Rate</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">{performanceMetrics.conversionRate}</span>
                      <span className="text-xs text-green-600 ml-2 font-medium">{performanceMetrics.conversionChange}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <ShoppingBag className="text-green-600 w-5 h-5" />
                      </div>
                      <span className="font-medium text-gray-700">Average Order Value</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">{performanceMetrics.aov}</span>
                      <span className="text-xs text-green-600 ml-2 font-medium">{performanceMetrics.aovChange}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Users className="text-purple-600 w-5 h-5" />
                      </div>
                      <span className="font-medium text-gray-700">Customer Retention</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">{performanceMetrics.retention}</span>
                      <span className="text-xs text-green-600 ml-2 font-medium">{performanceMetrics.retentionChange}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <RotateCcw className="text-red-600 w-5 h-5" />
                      </div>
                      <span className="font-medium text-gray-700">Return Rate</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">{performanceMetrics.returnRate}</span>
                      <span className="text-xs text-red-600 ml-2 font-medium">{performanceMetrics.returnChange}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty State - Show when no results yet */}
      {!showGraph && !loading && (
        <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-200 animate-fade-in">
          <BarChart3 className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Ready to Analyze Revenue</h3>
          <p className="text-gray-500 mb-4">Select your date range and website, then click "Show Revenue" to view comprehensive sales insights</p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>Revenue Analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span>Product Performance</span>
            </div>
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              <span>Order Tracking</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
