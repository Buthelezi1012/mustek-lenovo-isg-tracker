import React, { useState } from 'react';
import { 
  Layers, Search, Plus, Filter, UserCheck, Clock, CheckCircle2, 
  AlertCircle, MessageSquare, History, Table, Download, ShieldCheck, X, AlertTriangle, BarChart3, Tag
} from 'lucide-react';

// Exclusively 4 Authorized Team Members (No Job Titles)
const TEAM_MEMBERS = [
  "Craig Butterworth",
  "Ansia Nel",
  "Thesan Naidu",
  "Nqobile Buthelezi"
];

export default function App() {
  // 1. Initial State starts COMPLETELY EMPTY for a fresh demo/deployment
  const [tickets, setTickets] = useState([]);
  
  // Navigation & Filtering State
  const [activeTab, setActiveTab] = useState("table"); // "table", "dashboard", "kanban"
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterOwner, setFilterOwner] = useState("ALL");
  const [filterType, setFilterType] = useState("ALL");

  // Drawers and Modals State
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [targetClaimTicketId, setTargetClaimTicketId] = useState(null);
  
  // Shared Team Member Picker State
  const [selectedActionName, setSelectedActionName] = useState(TEAM_MEMBERS[0]);
  const [customNameInput, setCustomNameInput] = useState("");
  const [newCommentText, setNewCommentText] = useState("");

  // New Request Form State
  const [newForm, setNewForm] = useState({
    customer: "",
    salesperson: "",
    endUser: "",
    summary: "",
    requestType: "Server",
    estimatedValue: "",
    additional_notes: "",
    waitingFor: "None"
  });

  // Helper to determine selected active user name
  const getActiveUser = () => {
    if (selectedActionName === "CUSTOM") {
      return customNameInput.trim() || "Mustek Staff";
    }
    return selectedActionName;
  };

  // Handle Opening Claim Modal
  const handleOpenClaimModal = (ticketId, e) => {
    if (e) e.stopPropagation();
    setTargetClaimTicketId(ticketId);
    setIsClaimModalOpen(true);
  };

  // Confirm Claim Request Ownership
  const confirmClaimTicket = () => {
    const claimer = getActiveUser();
    const nowStr = new Date().toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' });
    const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 16);

    setTickets(tickets.map(t => {
      if (t.id === targetClaimTicketId) {
        const updatedComments = [
          ...t.comments, 
          { id: Date.now(), user: claimer, date: nowStr, text: `Claimed this request.` }
        ];
        const updatedAudit = [
          ...t.auditTrail,
          { date: nowStr, text: `Claimed by ${claimer}.` }
        ];
        return {
          ...t,
          owner: claimer,
          status: t.status === "New Request" ? "Assigned" : t.status,
          lastUpdated: nowIso,
          comments: updatedComments,
          auditTrail: updatedAudit
        };
      }
      return t;
    }));

    if (selectedTicket && selectedTicket.id === targetClaimTicketId) {
      setSelectedTicket(prev => ({
        ...prev,
        owner: claimer,
        status: prev.status === "New Request" ? "Assigned" : prev.status,
        lastUpdated: nowIso,
        comments: [...prev.comments, { id: Date.now(), user: claimer, date: nowStr, text: `Claimed this request.` }],
        auditTrail: [...prev.auditTrail, { date: nowStr, text: `Claimed by ${claimer}.` }]
      }));
    }

    setIsClaimModalOpen(false);
    setTargetClaimTicketId(null);
  };

  // Quick Action: Claim Next Unassigned Request
  const claimNextUnassigned = () => {
    const nextUnassigned = tickets.find(t => t.owner === "UNASSIGNED");
    if (nextUnassigned) {
      handleOpenClaimModal(nextUnassigned.id);
    } else {
      alert("There are no unassigned requests in the queue!");
    }
  };

  // Handle Status Update
  const updateTicketStatus = (ticketId, newStatus) => {
    const updater = getActiveUser();
    const nowStr = new Date().toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' });
    const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 16);

    setTickets(tickets.map(t => {
      if (t.id === ticketId) {
        const updatedAudit = [
          ...t.auditTrail,
          { date: nowStr, text: `Status updated to '${newStatus}' by ${updater}.` }
        ];
        return { ...t, status: newStatus, lastUpdated: nowIso, auditTrail: updatedAudit };
      }
      return t;
    }));

    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket(prev => ({ 
        ...prev, 
        status: newStatus, 
        lastUpdated: nowIso,
        auditTrail: [...prev.auditTrail, { date: nowStr, text: `Status updated to '${newStatus}' by ${updater}.` }]
      }));
    }
  };

  // Handle Waiting For Blocker Update
  const updateWaitingFor = (ticketId, waitingVal) => {
    const updater = getActiveUser();
    const nowStr = new Date().toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' });
    const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 16);

    setTickets(tickets.map(t => {
      if (t.id === ticketId) {
        const updatedAudit = [
          ...t.auditTrail,
          { date: nowStr, text: `Waiting For changed to '${waitingVal}' by ${updater}.` }
        ];
        return { ...t, waitingFor: waitingVal, lastUpdated: nowIso, auditTrail: updatedAudit };
      }
      return t;
    }));

    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket(prev => ({ 
        ...prev, 
        waitingFor: waitingVal, 
        lastUpdated: nowIso,
        auditTrail: [...prev.auditTrail, { date: nowStr, text: `Waiting For changed to '${waitingVal}' by ${updater}.` }]
      }));
    }
  };

  // Add Comment/Activity Log Entry
  const addComment = (ticketId) => {
    if (!newCommentText.trim()) return;
    const author = getActiveUser();
    const nowStr = new Date().toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' });
    const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const newComm = { id: Date.now(), user: author, date: nowStr, text: newCommentText.trim() };
    const newAudit = { date: nowStr, text: `Activity comment added by ${author}.` };

    setTickets(tickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          lastUpdated: nowIso,
          comments: [...t.comments, newComm],
          auditTrail: [...t.auditTrail, newAudit]
        };
      }
      return t;
    }));

    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket(prev => ({
        ...prev,
        lastUpdated: nowIso,
        comments: [...prev.comments, newComm],
        auditTrail: [...prev.auditTrail, newAudit]
      }));
    }

    setNewCommentText("");
  };

  // Create New Request Submission
  const handleCreateTicket = (e) => {
    e.preventDefault();
    if (!newForm.customer || !newForm.summary || !newForm.salesperson) {
      alert("Please fill in Customer Name, Salesperson, and Request Summary.");
      return;
    }

    const creator = getActiveUser();
    const nextId = tickets.length > 0 ? Math.max(...tickets.map(t => t.id)) + 1 : 1;
    const ticketNumber = `TKT-${new Date().getFullYear()}-${String(nextId).padStart(3, '0')}`;
    const todayStr = new Date().toISOString().split('T')[0];
    const nowStr = new Date().toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' });
    const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const newObj = {
      id: nextId,
      ticketNumber,
      customer: newForm.customer,
      salesperson: newForm.salesperson,
      endUser: newForm.endUser || "N/A",
      summary: newForm.summary,
      dateReceived: todayStr,
      requestType: newForm.requestType,
      owner: "UNASSIGNED",
      status: "New Request",
      waitingFor: newForm.waitingFor || "None",
      estimatedValue: newForm.estimatedValue || "R 0",
      additional_notes: newForm.additional_notes || "",
      lastUpdated: nowIso,
      comments: [],
      auditTrail: [
        { date: nowStr, text: `Request captured in queue by ${creator}.` }
      ]
    };

    setTickets([newObj, ...tickets]);
    setIsNewModalOpen(false);
    
    // Reset Form
    setNewForm({
      customer: "",
      salesperson: "",
      endUser: "",
      summary: "",
      requestType: "Server",
      estimatedValue: "",
      additional_notes: "",
      waitingFor: "None"
    });
  };

  // Export Tickets to CSV
  const exportCSV = () => {
    if (filteredTickets.length === 0) {
      alert("There are no requests available to export.");
      return;
    }
    const headers = ["Ticket Number", "Customer", "Salesperson", "Request Type", "Owner", "Status", "Waiting For", "Estimated Value", "Last Updated"];
    const rows = filteredTickets.map(t => [
      t.ticketNumber,
      `"${t.customer}"`,
      `"${t.salesperson}"`,
      t.requestType,
      t.owner,
      t.status,
      t.waitingFor,
      `"${t.estimatedValue}"`,
      t.lastUpdated
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Mustek_Lenovo_ISG_Tracker_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter Logic
  const filteredTickets = tickets.filter(t => {
    const matchesSearch = 
      t.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.salesperson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.owner.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "ALL" || t.status === filterStatus;
    const matchesOwner = filterOwner === "ALL" || (filterOwner === "UNASSIGNED" ? t.owner === "UNASSIGNED" : t.owner === filterOwner);
    const matchesType = filterType === "ALL" || t.requestType === filterType;

    return matchesSearch && matchesStatus && matchesOwner && matchesType;
  });

  const unassignedCount = tickets.filter(t => t.owner === "UNASSIGNED").length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* App Navigation Header */}
      <header className="bg-[#002B49] text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#003366] border border-[#00A3E0]/40 flex items-center justify-center text-[#00A3E0] shadow-sm">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg tracking-wide text-white">MUSTEK LENOVO ISG TRACKER</h1>
                <span className="bg-[#E2231A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Internal</span>
              </div>
              <p className="text-xs text-slate-300">Lenovo ISG Shared Mailbox Request Queue</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {unassignedCount > 0 && (
              <button
                onClick={claimNextUnassigned}
                className="hidden md:flex items-center gap-2 bg-[#E2231A] hover:bg-red-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow transition-colors animate-pulse"
              >
                <UserCheck className="w-4 h-4" />
                Claim Next Unassigned ({unassignedCount})
              </button>
            )}

            <button
              onClick={() => setIsNewModalOpen(true)}
              className="flex items-center gap-2 bg-[#00A3E0] hover:bg-sky-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow transition-all"
            >
              <Plus className="w-4 h-4" />
              New Request
            </button>
          </div>
        </div>
      </header>

      {/* Primary Toolbar Bar */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center py-3 gap-3">
          
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("table")}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all flex-1 sm:flex-none ${
                activeTab === "table" ? "bg-[#002B49] text-white shadow" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Table className="w-4 h-4" />
              Requests Table ({filteredTickets.length})
            </button>
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all flex-1 sm:flex-none ${
                activeTab === "dashboard" ? "bg-[#002B49] text-white shadow" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("kanban")}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all flex-1 sm:flex-none ${
                activeTab === "kanban" ? "bg-[#002B49] text-white shadow" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="w-4 h-4" />
              Kanban
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search ticket, customer, salesperson..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#00A3E0]"
              />
            </div>
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-sm"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Content Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">

        {/* ================= REQUESTS TABLE VIEW ================= */}
        {activeTab === "table" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            
            {/* Filters Bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-3 items-center justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                  <Filter className="w-4 h-4 text-slate-400" /> Filters:
                </span>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="New Request">New Request</option>
                  <option value="Assigned">Assigned</option>
                  <option value="Sizing">Sizing</option>
                  <option value="Pricing">Pricing</option>
                  <option value="PSE Validation">PSE Validation</option>
                  <option value="Awaiting Customer">Awaiting Customer</option>
                  <option value="Quote Sent">Quote Sent</option>
                  <option value="Won">Won</option>
                  <option value="Lost">Lost</option>
                  <option value="Closed">Closed</option>
                </select>

                <select
                  value={filterOwner}
                  onChange={(e) => setFilterOwner(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700"
                >
                  <option value="ALL">All Owners</option>
                  <option value="UNASSIGNED">Unassigned Only</option>
                  {TEAM_MEMBERS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>

                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700"
                >
                  <option value="ALL">All Request Types</option>
                  <option value="Server">Server</option>
                  <option value="Storage">Storage</option>
                  <option value="Warranty Renewal">Warranty Renewal</option>
                  <option value="Licensing">Licensing</option>
                  <option value="Professional Services">Professional Services</option>
                  <option value="General Opportunity">General Opportunity</option>
                </select>
              </div>

              <div className="text-xs text-slate-500 font-medium">
                Active Requests: <span className="font-bold text-[#002B49]">{filteredTickets.length}</span>
              </div>
            </div>

            {/* Table Area */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-4">Ticket #</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Summary</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Mustek Salesperson</th>
                    <th className="p-4">Owner</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Waiting For</th>
                    <th className="p-4">Last Updated</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTickets.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="p-16 text-center text-slate-400">
                        <div className="max-w-md mx-auto space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#00A3E0] flex items-center justify-center mx-auto border border-sky-100">
                            <Plus className="w-6 h-6" />
                          </div>
                          <p className="font-bold text-slate-700 text-sm">No Active Requests Captured</p>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            Click <strong className="text-[#00A3E0]">"+ New Request"</strong> at the top right to capture an incoming shared mailbox request and test the flow with your manager.
                          </p>
                          <button
                            onClick={() => setIsNewModalOpen(true)}
                            className="inline-flex items-center gap-2 bg-[#00A3E0] hover:bg-sky-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow transition-all"
                          >
                            <Plus className="w-4 h-4" />
                            Capture First Request
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredTickets.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-black text-[#002B49]">
                          <button onClick={() => setSelectedTicket(t)} className="hover:underline">
                            {t.ticketNumber}
                          </button>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-slate-900">{t.customer}</div>
                          <div className="text-[10px] text-slate-400">{t.endUser}</div>
                        </td>
                        <td className="p-4 text-slate-700 max-w-xs truncate font-medium">{t.summary}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-medium text-[10px]">
                            {t.requestType}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600">{t.salesperson}</td>
                        <td className="p-4">
                          {t.owner === "UNASSIGNED" ? (
                            <button
                              onClick={(e) => handleOpenClaimModal(t.id, e)}
                              className="bg-[#E2231A] hover:bg-red-700 text-white font-bold px-2.5 py-1 rounded-md text-[10px] shadow-sm transition-all"
                            >
                              Claim Request
                            </button>
                          ) : (
                            <span className="font-bold text-[#002B49] bg-sky-50 px-2.5 py-1 rounded-md border border-sky-100">
                              {t.owner}
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <select
                            value={t.status}
                            onChange={(e) => updateTicketStatus(t.id, e.target.value)}
                            className="bg-slate-100 border-0 rounded-lg px-2.5 py-1 font-bold text-slate-800 text-[11px]"
                          >
                            <option value="New Request">New Request</option>
                            <option value="Assigned">Assigned</option>
                            <option value="Sizing">Sizing</option>
                            <option value="Pricing">Pricing</option>
                            <option value="PSE Validation">PSE Validation</option>
                            <option value="Awaiting Customer">Awaiting Customer</option>
                            <option value="Quote Sent">Quote Sent</option>
                            <option value="Won">Won</option>
                            <option value="Lost">Lost</option>
                            <option value="Closed">Closed</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <select
                            value={t.waitingFor}
                            onChange={(e) => updateWaitingFor(t.id, e.target.value)}
                            className="bg-amber-50 text-amber-900 border-0 rounded-lg px-2.5 py-1 font-semibold text-[11px]"
                          >
                            <option value="None">None</option>
                            <option value="Customer">Customer</option>
                            <option value="Product Manager">Product Manager</option>
                            <option value="Pre-Sales Engineer">Pre-Sales Engineer</option>
                            <option value="Distributor">Distributor</option>
                            <option value="Pricing">Pricing</option>
                            <option value="Stock Confirmation">Stock Confirmation</option>
                            <option value="Technical Validation">Technical Validation</option>
                          </select>
                        </td>
                        <td className="p-4 text-[11px] text-slate-500 font-mono">
                          {t.lastUpdated}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => setSelectedTicket(t)}
                            className="px-3 py-1.5 bg-[#002B49] text-white rounded-lg font-bold text-[11px] hover:bg-[#003366] transition-colors"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ================= DASHBOARD METRICS VIEW ================= */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-slate-500 text-xs font-semibold">Total Requests</div>
                <div className="text-2xl font-black text-[#002B49] mt-2">{tickets.length}</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-slate-500 text-xs font-semibold">Unassigned Queue</div>
                <div className="text-2xl font-black text-rose-600 mt-2">{unassignedCount}</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-slate-500 text-xs font-semibold">Awaiting Customer</div>
                <div className="text-2xl font-black text-amber-600 mt-2">
                  {tickets.filter(t => t.waitingFor === "Customer").length}
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-slate-500 text-xs font-semibold">Awaiting Pricing</div>
                <div className="text-2xl font-black text-purple-600 mt-2">
                  {tickets.filter(t => t.waitingFor === "Pricing" || t.status === "Pricing").length}
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-slate-500 text-xs font-semibold">Awaiting Tech Validation</div>
                <div className="text-2xl font-black text-blue-600 mt-2">
                  {tickets.filter(t => t.waitingFor === "Pre-Sales Engineer" || t.status === "PSE Validation").length}
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-slate-500 text-xs font-semibold">Completed / Won</div>
                <div className="text-2xl font-black text-emerald-600 mt-2">
                  {tickets.filter(t => t.status === "Won" || t.status === "Closed").length}
                </div>
              </div>
            </div>

            {/* Owner Workload Overview */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-base font-bold text-[#002B49] mb-4 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#00A3E0]" />
                Team Load Breakdown
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {TEAM_MEMBERS.map(member => {
                  const assignedCount = tickets.filter(t => t.owner === member).length;
                  return (
                    <div key={member} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{member}</div>
                        <div className="text-[10px] text-slate-400">Team Member</div>
                      </div>
                      <div className="text-lg font-black text-[#002B49] bg-white px-3 py-1 rounded-lg border border-slate-200">
                        {assignedCount}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Feed */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-base font-bold text-[#002B49] mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#00A3E0]" />
                Recent Activity & Updates
              </h2>
              <div className="space-y-3">
                {tickets.flatMap(t => t.comments.map(c => ({ ...c, ticketNumber: t.ticketNumber, customer: t.customer }))).length === 0 ? (
                  <p className="text-xs text-slate-400 py-4">No comments or activity updates logged yet.</p>
                ) : (
                  tickets.flatMap(t => t.comments.map(c => ({ ...c, ticketNumber: t.ticketNumber, customer: t.customer }))).sort((a,b) => b.id - a.id).slice(0, 6).map(comm => (
                    <div key={comm.id} className="pb-3 border-b border-slate-100 text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-400 text-[10px]">
                        <span className="font-bold text-[#002B49]">{comm.user}</span>
                        <span>{comm.date}</span>
                      </div>
                      <p className="text-slate-700 font-medium">{comm.text}</p>
                      <div className="text-[10px] text-[#00A3E0] font-semibold">Ref: {comm.ticketNumber} ({comm.customer})</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= KANBAN BOARD VIEW ================= */}
        {activeTab === "kanban" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-auto pb-4">
            {["New Request", "Sizing", "Pricing", "Quote Sent"].map(stage => {
              const stageTickets = filteredTickets.filter(t => t.status === stage);
              return (
                <div key={stage} className="bg-slate-100/80 rounded-2xl p-4 border border-slate-200 flex flex-col min-h-[450px]">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                    <h3 className="font-bold text-xs uppercase text-[#002B49]">{stage}</h3>
                    <span className="bg-white font-bold text-xs px-2 py-0.5 rounded-full text-slate-700 border border-slate-200">
                      {stageTickets.length}
                    </span>
                  </div>

                  <div className="space-y-3 flex-1">
                    {stageTickets.map(t => (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTicket(t)}
                        className="bg-white p-4 rounded-xl border border-slate-200 hover:border-[#00A3E0] shadow-sm cursor-pointer space-y-2 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black text-xs text-[#002B49]">{t.ticketNumber}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                            {t.requestType}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-900">{t.customer}</h4>
                        <p className="text-xs text-slate-600 line-clamp-2">{t.summary}</p>
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-sky-800">{t.owner}</span>
                          {t.owner === "UNASSIGNED" && (
                            <button
                              onClick={(e) => handleOpenClaimModal(t.id, e)}
                              className="bg-[#E2231A] text-white font-bold px-2 py-1 rounded text-[10px]"
                            >
                              Claim
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* ================= CLAIM TICKET NAME SELECTION MODAL ================= */}
      {isClaimModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 border border-slate-200">
            <h3 className="font-bold text-base text-[#002B49]">Claim Request Ownership</h3>
            <p className="text-xs text-slate-500">Select your name from the team list to claim this request.</p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Team Member</label>
                <select
                  value={selectedActionName}
                  onChange={(e) => setSelectedActionName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                >
                  {TEAM_MEMBERS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                  <option value="CUSTOM">Type Custom Name...</option>
                </select>
              </div>

              {selectedActionName === "CUSTOM" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Enter Name</label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    value={customNameInput}
                    onChange={(e) => setCustomNameInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsClaimModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={confirmClaimTicket}
                className="px-4 py-2 text-xs font-bold bg-[#E2231A] hover:bg-red-700 text-white rounded-xl shadow"
              >
                Confirm Claim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TICKET SLIDE-OVER DRAWER ================= */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col">
            
            <div className="bg-[#002B49] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-[#00A3E0]">{selectedTicket.ticketNumber}</span>
                <h2 className="text-lg font-bold">{selectedTicket.customer}</h2>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-slate-300 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50/50">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Owner</span>
                  <span className="font-bold text-slate-900">{selectedTicket.owner}</span>
                  {selectedTicket.owner === "UNASSIGNED" && (
                    <button
                      onClick={() => handleOpenClaimModal(selectedTicket.id)}
                      className="mt-1 block bg-[#E2231A] text-white px-2 py-0.5 rounded text-[10px] font-bold"
                    >
                      Claim
                    </button>
                  )}
                </div>

                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Status</span>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value)}
                    className="w-full bg-slate-100 border-0 rounded-lg px-2 py-1 font-bold text-xs"
                  >
                    <option value="New Request">New Request</option>
                    <option value="Assigned">Assigned</option>
                    <option value="Sizing">Sizing</option>
                    <option value="Pricing">Pricing</option>
                    <option value="PSE Validation">PSE Validation</option>
                    <option value="Awaiting Customer">Awaiting Customer</option>
                    <option value="Quote Sent">Quote Sent</option>
                    <option value="Won">Won</option>
                    <option value="Lost">Lost</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Waiting For</span>
                  <select
                    value={selectedTicket.waitingFor}
                    onChange={(e) => updateWaitingFor(selectedTicket.id, e.target.value)}
                    className="w-full bg-amber-50 border-0 rounded-lg px-2 py-1 font-semibold text-xs text-amber-900"
                  >
                    <option value="None">None</option>
                    <option value="Customer">Customer</option>
                    <option value="Product Manager">Product Manager</option>
                    <option value="Pre-Sales Engineer">Pre-Sales Engineer</option>
                    <option value="Distributor">Distributor</option>
                    <option value="Pricing">Pricing</option>
                  </select>
                </div>
              </div>

              {/* Detail Cards */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-slate-400">Salesperson:</span> <strong>{selectedTicket.salesperson}</strong></div>
                  <div><span className="text-slate-400">Type:</span> <strong>{selectedTicket.requestType}</strong></div>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Summary:</span>
                  <p className="bg-slate-50 p-3 rounded-xl border border-slate-200 font-bold">{selectedTicket.summary}</p>
                </div>
              </div>

              {/* Activity Posting */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h3 className="font-bold text-xs uppercase text-[#002B49]">Post Update / Comment</h3>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Your Name</label>
                    <select
                      value={selectedActionName}
                      onChange={(e) => setSelectedActionName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-800"
                    >
                      {TEAM_MEMBERS.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                      <option value="CUSTOM">Type Custom Name...</option>
                    </select>
                  </div>

                  {selectedActionName === "CUSTOM" && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Enter Name</label>
                      <input
                        type="text"
                        placeholder="Enter full name"
                        value={customNameInput}
                        onChange={(e) => setCustomNameInput(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5"
                      />
                    </div>
                  )}
                </div>

                <textarea
                  rows="2"
                  placeholder="Type notes or update status details..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-[#00A3E0]"
                ></textarea>

                <div className="flex justify-end">
                  <button
                    onClick={() => addComment(selectedTicket.id)}
                    className="bg-[#002B49] text-white font-bold px-4 py-2 rounded-xl text-xs"
                  >
                    Post Activity
                  </button>
                </div>

                {/* Comment Feed */}
                <div className="space-y-2 pt-2">
                  {selectedTicket.comments.slice().reverse().map(c => (
                    <div key={c.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <div className="flex justify-between text-slate-400 text-[10px] mb-1">
                        <span className="font-bold text-[#002B49]">{c.user}</span>
                        <span>{c.date}</span>
                      </div>
                      <p className="text-slate-800 font-medium">{c.text}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ================= NEW REQUEST MODAL ================= */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-[#002B49]">Capture New Shared Mailbox Request</h2>
              <button onClick={() => setIsNewModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Standard Bank"
                    value={newForm.customer}
                    onChange={(e) => setNewForm({ ...newForm, customer: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mustek Salesperson *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sipho Khumalo"
                    value={newForm.salesperson}
                    onChange={(e) => setNewForm({ ...newForm, salesperson: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Request Summary *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ThinkSystem SR650 V3 server quote request"
                  value={newForm.summary}
                  onChange={(e) => setNewForm({ ...newForm, summary: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Request Type</label>
                  <select
                    value={newForm.requestType}
                    onChange={(e) => setNewForm({ ...newForm, requestType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold"
                  >
                    <option value="Server">Server</option>
                    <option value="Storage">Storage</option>
                    <option value="Warranty Renewal">Warranty Renewal</option>
                    <option value="Licensing">Licensing</option>
                    <option value="Professional Services">Professional Services</option>
                    <option value="General Opportunity">General Opportunity</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Captured By</label>
                  <select
                    value={selectedActionName}
                    onChange={(e) => setSelectedActionName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800"
                  >
                    {TEAM_MEMBERS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                    <option value="CUSTOM">Type Custom Name...</option>
                  </select>
                </div>
              </div>

              {selectedActionName === "CUSTOM" && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Enter Name</label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    value={customNameInput}
                    onChange={(e) => setCustomNameInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00A3E0] hover:bg-sky-500 text-white rounded-xl font-bold shadow"
                >
                  Save Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-400 mt-auto">
        Mustek Lenovo ISG Tracker • Shared Mailbox Queue Management
      </footer>

    </div>
  );
}
