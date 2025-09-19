import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Tag, DollarSign, Edit, Trash2, PlusCircle, Filter, TrendingUp, RefreshCw, Printer, Download, Save, Search } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import * as XLSX from 'xlsx';

// --- SUB-CATEGORIES MAPPING ---
const initialSubCategories = {
  'Operating Expenses': ['Employee Salaries & Wages', 'Marketing & Advertising Costs', 'Office Rent & Lease', 'Utilities', 'Office Supplies', 'Legal & Professional Charges', 'IT & Software', 'Fuel / Transportation Costs', 'Research & Development (R&D)', 'Insurance & Loan Payments', 'Maintenance & Repairs', 'Security Services', 'Subscriptions & Membership Fees'],
  'Travel & Commuting': ['Public Transport', 'Parking Fees', 'Vehicle / Automobile Costs', 'Business Travel (Flights, Hotels, Car Rentals)'],
  'Cost of Goods Sold': ['Raw Material Costs', 'Labor / Worker Costs', 'Manufacturing & Production Costs', 'Freight & Shipping Charges', 'Other COGS Costs'],
  'Non-Operating Expenses': ['Loan Interest Payments', 'Taxes', 'Losses', 'Other Non-Operating Costs'],
  'Food': ['Groceries', 'Restaurant', 'Coffee Shops', 'Snacks'],
  'Clothing': ['Saree', 'Chudidar', 'Jeans', 'T-shirt'],
};

const Expenditure = () => {
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [formData, setFormData] = useState({
    date: getTodayDate(),
    type: 'Expense', // kept as default Expense; removed editable Type from the top form
    category: '',
    subCategory: '',
    description: '',
    amount: '',
    paymentMode: '',
    remark: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [categories, setCategories] = useState(Object.keys(initialSubCategories));
  const [subCategories, setSubCategories] = useState(initialSubCategories);
  const [filteredCategories, setFilteredCategories] = useState(categories);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSubCategoryDropdown, setShowSubCategoryDropdown] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showTopCosts, setShowTopCosts] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const dateInputRef = useRef(null);

  // search state for table
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTransactions = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('https://revenue-backend-ilz6.onrender.com/api/transactions');
      if (!response.ok) throw new Error('Failed to fetch transactions');
      const data = await response.json();
      setTransactions(data);
      setFilteredTransactions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransactions(); }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, category: value, subCategory: '' });
    const filtered = categories.filter(cat => cat.toLowerCase().includes(value.toLowerCase()));
    setFilteredCategories(filtered);
    setShowCategoryDropdown(true);
    setShowSubCategoryDropdown(false);
  };

  const handleSubCategoryChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, subCategory: value });
    const relatedSubs = subCategories[formData.category] || [];
    const filtered = relatedSubs.filter(sub => sub.toLowerCase().includes(value.toLowerCase()));
    setFilteredSubCategories(filtered);
    setShowSubCategoryDropdown(true);
  };

  const selectCategory = (category) => {
    setFormData({ ...formData, category, subCategory: '' });
    setShowCategoryDropdown(false);
    setFilteredSubCategories(subCategories[category] || []);
  };
  const selectSubCategory = (sub) => {
    setFormData({ ...formData, subCategory: sub });
    setShowSubCategoryDropdown(false);
  };

  const handleAddTransaction = async () => {
    if (!formData.date || !formData.amount || !formData.category || !formData.paymentMode) {
      setError('Please fill in all required fields.');
      return;
    }
    // ensure type is Expense when saving (top form removed type input)
    const newTransaction = { ...formData, amount: parseFloat(formData.amount), type: 'Expense' };
    setLoading(true);
    setError('');
    try {
      const response = await fetch('https://revenue-backend-ilz6.onrender.com/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTransaction)
      });
      if (!response.ok) throw new Error('Failed to add transaction');
      const addedTransaction = await response.json();
      const updatedTransactions = [addedTransaction, ...transactions];
      setTransactions(updatedTransactions);
      setFilteredTransactions(updatedTransactions);
      setFormData({
        date: getTodayDate(), type: 'Expense', category: '', subCategory: '', description: '', amount: '', paymentMode: '', remark: ''
      });
      setShowTopCosts(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = async (id) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`https://revenue-backend-ilz6.onrender.com/api/transactions/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete transaction');
      const updatedTransactions = transactions.filter(t => t._id !== id);
      setTransactions(updatedTransactions);
      setFilteredTransactions(updatedTransactions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTransaction = (transaction) => {
    setEditingId(transaction._id);
    setEditFormData({ ...transaction });
  };

  const handleSaveEdit = async (id) => {
    if (!editFormData.date || !editFormData.amount || !editFormData.category || !editFormData.paymentMode) {
      setError('Please fill in all required fields.');
      return;
    }
    const updatedTransaction = { ...editFormData, _id: id, amount: parseFloat(editFormData.amount) };
    setLoading(true); setError('');
    try {
      const response = await fetch(`https://revenue-backend-ilz6.onrender.com/api/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTransaction)
      });
      if (!response.ok) throw new Error('Failed to update transaction');
      const savedTransaction = await response.json();
      const updatedTransactions = transactions.map(t => t._1 === id ? savedTransaction : t);
      setTransactions(updatedTransactions);
      setFilteredTransactions(updatedTransactions);
      setEditingId(null);
      setEditFormData({});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewCategory = (e) => { e.preventDefault(); if (formData.category && !categories.includes(formData.category)) {
    setCategories(prev => [...prev, formData.category]);
    setSubCategories(prev => ({ ...prev, [formData.category]: [] }));
    setFilteredCategories([]); setShowCategoryDropdown(false);
  } };

  const handleAddNewSubCategory = (e) => { e.preventDefault(); if (formData.subCategory && formData.category && !subCategories[formData.category]?.includes(formData.subCategory)) {
    setSubCategories(prev => {
      const updated = [...(prev[formData.category] || []), formData.subCategory];
      return { ...prev, [formData.category]: updated };
    });
    setFilteredSubCategories([]); setShowSubCategoryDropdown(false);
  } };

  const applyDateFilter = () => {
    if (!startDate || !endDate) { setError('Please select both start and end dates.'); return; }
    const start = new Date(startDate); const end = new Date(endDate);
    if (start > end) { setError('Start date cannot be after end date.'); return; }
    const filtered = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      // include end date
      return transactionDate >= start && transactionDate <= new Date(end.setDate(end.getDate() + 1));
    });
    setFilteredTransactions(filtered);
    setShowTopCosts(false);
    setError('');
  };

  const toggleTopCosts = () => {
    if (!showTopCosts) {
      const expenseTransactions = filteredTransactions.filter(t => t.type === 'Expense');
      const sorted = [...expenseTransactions].sort((a, b) => b.amount - a.amount);
      setFilteredTransactions(sorted);
    } else {
      setFilteredTransactions(transactions);
      if (startDate && endDate) applyDateFilter();
    }
    setShowTopCosts(!showTopCosts);
  };

  const createDownloadLink = (data, filename) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Records');
    XLSX.writeFile(workbook, filename);
  };

  const handlePrint = () => {
    const printContent = document.getElementById('transactionTable').outerHTML;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  const handleDownload = () => { createDownloadLink(filteredTransactions, 'transactions.xlsx'); };

  // totals (only expenses info, as you wanted earlier)
  const totalExpenses = filteredTransactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalExpenseEntries = filteredTransactions.filter(t => t.type === 'Expense').length;

  const topCostData = filteredTransactions
    .filter(t => t.type === 'Expense')
    .reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + (curr.amount || 0);
      return acc;
    }, {});
  const sortedTopCostData = Object.entries(topCostData).map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount);

  // table display respects current search query (search inside filteredTransactions)
  const displayedTransactions = filteredTransactions.filter(t => {
    if (!searchQuery) return true;
    const q = searchQuery.toString().toLowerCase();
    const fields = [
      (t.date && new Date(t.date).toLocaleDateString('en-IN')) || '',
      (t.type || ''),
      (t.category || ''),
      (t.subCategory || ''),
      (t.description || ''),
      (t.paymentMode || ''),
      (t.remark || ''),
      (t.amount !== undefined && t.amount !== null) ? t.amount.toString() : ''
    ];
    return fields.some(f => f.toString().toLowerCase().includes(q));
  });

  return (
    // Important: overflow-x-hidden here helps; but also add small global CSS tweak suggested below.
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-6 font-sans overflow-x-hidden">
      <div className="max-w-7xl mx-auto w-full box-border">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center flex items-center justify-center">
          <DollarSign className="mr-4 text-green-600" size={40} />
          Expenditures Module
        </h1>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg flex items-center mb-8">
            {error}
          </div>
        )}

        {/* Add Transaction Form (Type field removed from form) */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          {/* ... form content unchanged except Type field removed */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Date */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
              <div className="flex items-center input-field" onClick={() => dateInputRef.current?.showPicker?.()}>
                <input type="date" name="date" value={formData.date} onChange={handleInputChange} ref={dateInputRef} className="w-full bg-transparent border-none focus:outline-none cursor-pointer" required />
                <Calendar size={18} className="text-gray-500" />
              </div>
            </div>

            {/* Type - REMOVED from form (we keep type in formData default as 'Expense') */}

            {/* Category */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <input type="text" name="category" value={formData.category} onChange={handleCategoryChange} onFocus={() => setShowCategoryDropdown(true)} onBlur={() => setTimeout(() => setShowCategoryDropdown(false), 200)} className="input-field" placeholder="Search or add category" required />
              {showCategoryDropdown && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((cat, index) => (
                      <li key={index} onMouseDown={() => selectCategory(cat)} className="p-2 cursor-pointer hover:bg-gray-100 transition-colors">{cat}</li>
                    ))
                  ) : (
                    <li className="p-2 text-gray-500 flex justify-between items-center">
                      No match found.
                      <button onMouseDown={handleAddNewCategory} className="font-semibold text-blue-600 hover:text-blue-800 transition-colors">+ Add "{formData.category}"</button>
                    </li>
                  )}
                </ul>
              )}
            </div>

            {/* Sub-category (if category chosen) */}
            {formData.category && (
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Sub-Category</label>
                <input type="text" name="subCategory" value={formData.subCategory} onChange={handleSubCategoryChange} onFocus={() => setShowSubCategoryDropdown(true)} onBlur={() => setTimeout(() => setShowSubCategoryDropdown(false), 200)} className="input-field" placeholder="Search or add sub-category" />
                {showSubCategoryDropdown && (
                  <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
                    {filteredSubCategories.length > 0 ? (
                      filteredSubCategories.map((sub, index) => (<li key={index} onMouseDown={() => selectSubCategory(sub)} className="p-2 cursor-pointer hover:bg-gray-100 transition-colors">{sub}</li>))
                    ) : (
                      <li className="p-2 text-gray-500 flex justify-between items-center">
                        No match found.
                        <button onMouseDown={handleAddNewSubCategory} className="font-semibold text-blue-600 hover:text-blue-800 transition-colors">+ Add "{formData.subCategory}"</button>
                      </li>
                    )}
                  </ul>
                )}
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description (optional)</label>
              <input type="text" name="description" value={formData.description} onChange={handleInputChange} className="input-field" />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (₹)</label>
              <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} className="input-field" required />
            </div>

            {/* Payment Mode */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Mode</label>
              <select name="paymentMode" value={formData.paymentMode} onChange={handleInputChange} className="input-field" required>
                <option value="">Select a payment mode</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="GPay">GPay</option>
                <option value="Cash">Cash</option>
              </select>
            </div>

            {/* Remark */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Remark (optional)</label>
              <input type="text" name="remark" value={formData.remark} onChange={handleInputChange} className="input-field" />
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <button onClick={handleAddTransaction} disabled={loading} className="bg-green-600 text-white px-8 py-3 rounded-lg shadow-lg hover:bg-green-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Adding...' : 'Add Transaction'}
            </button>
          </div>
        </div>

        {/* Filters (COMPARING BANK DETAILS removed) */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100 flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4">
          {/* left filters */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div>
              <label htmlFor="startDate" className="block text-sm font-semibold text-gray-700 mb-2">From Date</label>
              <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field" />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-semibold text-gray-700 mb-2">To Date</label>
              <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field" />
            </div>
            <button onClick={applyDateFilter} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors transform hover:scale-105 w-full sm:w-auto mt-4 sm:mt-0">
              <Filter size={18} /> Filter
            </button>
            <button onClick={toggleTopCosts} className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-orange-700 transition-colors transform hover:scale-105 w-full sm:w-auto">
              <TrendingUp size={18} /> {showTopCosts ? 'Hide' : 'Show'} Top Costs
            </button>
          </div>

          {/* right area: removed compare UI; kept layout and added nothing else here */}
          <div className="flex items-end sm:items-center gap-4 w-full sm:w-auto mt-4 sm:mt-0">
            {/* intentionally empty (compare removed) */}
          </div>
        </div>

        {/* Comparison Results removed entirely */}

        {/* ==== TOTALS: only two boxes now ==== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl shadow-lg p-6 border-l-4 border-indigo-500 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">Total Expenses Amount</p>
              <p className="text-3xl font-bold text-indigo-800 mt-2">₹{totalExpenses.toLocaleString('en-IN')}</p>
            </div>
            <div className="p-3 bg-indigo-500 rounded-full shadow-md">
              <DollarSign className="h-8 w-8 text-white" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-lg p-6 border-l-4 border-red-500 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-red-600 uppercase tracking-wide">Total Expense Entries</p>
              <p className="text-3xl font-bold text-red-800 mt-2">{totalExpenseEntries}</p>
            </div>
            <div className="p-3 bg-red-500 rounded-full shadow-md">
              <DollarSign className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        {/* Top Cost Chart */}
        {showTopCosts && filteredTransactions.some(t => t.type === 'Expense') && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <TrendingUp className="mr-3 text-orange-600" size={24} />
              Top Expenses by Category
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sortedTopCostData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                <Bar dataKey="amount" fill="#ef4444" name="Amount" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ===== Transactions Table (responsive tweaks to prevent horizontal scroll) ===== */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Calendar className="mr-3 text-purple-600" size={24} />
              Transaction Records
            </h2>
            <div className="flex items-center space-x-3">
              {/* Search input right next to Print/Download (as requested) */}
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search transactions..."
                  className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <button onClick={handlePrint} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-300 transition-colors no-print">
                <Printer size={18} /> Print
              </button>
              <button onClick={handleDownload} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-300 transition-colors no-print">
                <Download size={18} /> Download Excel
              </button>
            </div>
          </div>

          {/* responsive wrapper - removed negative margins and large padding that caused horizontal overflow */}
          <div className="overflow-x-auto">
            <table
              id="transactionTable"
              className="w-full table-auto md:table-fixed divide-y divide-gray-200 rounded-lg overflow-hidden print-table"
              style={{ tableLayout: 'fixed' }}
            >
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Date</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Type</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36">Category</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36">Sub-Category</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Amount (₹)</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell w-32">Payment Mode</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell w-36">Remark</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider no-print hidden lg:table-cell w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayedTransactions.length > 0 ? (
                  displayedTransactions.map((transaction, index) => (
                    <tr key={transaction._id || index} className="hover:bg-gray-50 align-top">
                      {editingId === transaction._id ? (
                        <>
                          <td className="px-3 py-3 text-sm text-gray-900 break-words">
                            <input type="date" name="date" value={(editFormData.date || '').split('T')[0] || ''} onChange={handleEditChange} className="input-field-small" />
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-500 break-words">
                            <select name="type" value={editFormData.type} onChange={handleEditChange} className="input-field-small">
                              <option value="Expense">Expense</option>
                              <option value="Income">Income</option>
                            </select>
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-900 break-words">
                            <input type="text" name="category" value={editFormData.category} onChange={handleEditChange} className="input-field-small" />
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-500 break-words">
                            <input type="text" name="subCategory" value={editFormData.subCategory} onChange={handleEditChange} className="input-field-small" />
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-500 break-words">
                            <input type="text" name="description" value={editFormData.description} onChange={handleEditChange} className="input-field-small" />
                          </td>
                          <td className="px-3 py-3 text-sm font-medium text-gray-900 break-words">
                            <input type="number" name="amount" value={editFormData.amount} onChange={handleEditChange} className="input-field-small" />
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-500 hidden lg:table-cell break-words">
                            <select name="paymentMode" value={editFormData.paymentMode} onChange={handleEditChange} className="input-field-small">
                              <option value="Bank Transfer">Bank Transfer</option>
                              <option value="GPay">GPay</option>
                              <option value="Cash">Cash</option>
                            </select>
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-500 hidden lg:table-cell break-words">
                            <input type="text" name="remark" value={editFormData.remark} onChange={handleEditChange} className="input-field-small" />
                          </td>
                          <td className="px-3 py-3 text-right text-sm font-medium no-print hidden lg:table-cell">
                            <div className="flex items-center space-x-2">
                              <button onClick={() => handleSaveEdit(transaction._id)} className="text-green-600 hover:text-green-900"><Save size={18} /></button>
                              <button onClick={() => setEditingId(null)} className="text-gray-500 hover:text-gray-900"><Trash2 size={18} /></button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-3 py-3 text-sm text-gray-900 break-words">{new Date(transaction.date).toLocaleDateString('en-IN')}</td>
                          <td className="px-3 py-3 text-sm text-gray-500">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${transaction.type === 'Income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {transaction.type}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-900 break-words">{transaction.category}</td>
                          <td className="px-3 py-3 text-sm text-gray-500 break-words">{transaction.subCategory || 'N/A'}</td>
                          <td className="px-3 py-3 text-sm text-gray-500 break-words max-w-[220px]">{transaction.description || 'N/A'}</td>
                          <td className="px-3 py-3 text-sm font-medium text-gray-900 break-words">₹{(transaction.amount || 0).toLocaleString('en-IN')}</td>
                          <td className="px-3 py-3 text-sm text-gray-500 hidden lg:table-cell break-words">{transaction.paymentMode}</td>
                          <td className="px-3 py-3 text-sm text-gray-500 hidden lg:table-cell break-words max-w-[180px]">{transaction.remark || 'N/A'}</td>
                          <td className="px-3 py-3 text-right text-sm font-medium no-print hidden lg:table-cell">
                            <div className="flex items-center space-x-2">
                              <button onClick={() => handleEditTransaction(transaction)} className="text-indigo-600 hover:text-indigo-900"><Edit size={18} /></button>
                              <button onClick={() => handleDeleteTransaction(transaction._id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="px-3 py-4 text-center text-gray-500">No transactions found for this period.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-4 shadow-xl">
              <RefreshCw className="animate-spin text-blue-500" size={24} />
              <span className="text-gray-700 font-medium">{loading ? 'Loading transactions...' : ''}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Expenditure;
