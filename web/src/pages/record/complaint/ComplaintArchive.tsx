import React, { useState, useEffect } from 'react';
import { 
  Archive, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  AlertTriangle, 
  Eye, 
  Download, 
  Trash2,
  RotateCcw,
  FileText,
  ChevronDown,
  X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/api/api';
import { toast } from 'sonner';
import { getArchivedComplaints } from './restful-api/complaint-api';
import { Button } from '@/components/ui/button/button';
import { Link } from "react-router-dom";
import { BsChevronLeft } from 'react-icons/bs';

type Complaint = {
  id: string;
  complainant: string;
  category: string;
  description: string;
  dateCreated: string;
  dateArchived: string;
  status: string;
  priority: string;
  accusedPersons: string[];
  location: string;
};

const ArchiveComplaints = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedComplaints, setSelectedComplaints] = useState<string[]>([]);
  const { getAccessToken } = useAuth();

  const categories = ['all', 'Noise Complaint', 'Property Dispute', 'Harassment', 'Theft', 'Public Nuisance'];
  const dateRanges = [
    { value: 'all', label: 'All Time' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'last90days', label: 'Last 90 Days' },
    { value: 'last6months', label: 'Last 6 Months' },
    { value: 'lastyear', label: 'Last Year' }
  ];

  // Update the fetchComplaints function in ArchiveComplaints
const fetchComplaints = async () => {
  try {
    const response = await getArchivedComplaints();
    
    // Transform the API response to match our Complaint type
    const formattedComplaints = response.data.map((complaint: any) => ({
      id: complaint.comp_id.toString(),
      complainant: complaint.cpnt?.cpnt_name || 'Anonymous',
      category: complaint.comp_incident_type || 'Uncategorized',
      description: complaint.comp_allegation || '',
      dateCreated: complaint.comp_created_at,
      dateArchived: new Date().toISOString(),
      status: 'Archived',
      priority: complaint.comp_category, 
      accusedPersons: complaint.accused_persons?.map((a: any) => a.acsd_name) || [],
      location: complaint.cpnt?.add?.add_barangay || 'Not specified'
    }));

    setComplaints(formattedComplaints);
    setFilteredComplaints(formattedComplaints);
  } catch (error: any) {
    console.error('Failed to fetch archived complaints:', error);
    toast.error('Failed to load archived complaints', {
      description: error.response?.data?.message || error.message
    });
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    filterComplaints();
  }, [searchTerm, selectedCategory, selectedDateRange, complaints]);

  const filterComplaints = () => {
    let filtered = complaints;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(complaint =>
        complaint.complainant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(complaint => complaint.category === selectedCategory);
    }

    // Date range filter
    if (selectedDateRange !== 'all') {
      const now = new Date();
      let cutoffDate;

      switch (selectedDateRange) {
        case 'last30days':
          cutoffDate = new Date(now.setDate(now.getDate() - 30));
          break;
        case 'last90days':
          cutoffDate = new Date(now.setDate(now.getDate() - 90));
          break;
        case 'last6months':
          cutoffDate = new Date(now.setMonth(now.getMonth() - 6));
          break;
        case 'lastyear':
          cutoffDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          cutoffDate = null;
      }

      if (cutoffDate) {
        filtered = filtered.filter(complaint => 
          new Date(complaint.dateArchived) >= cutoffDate
        );
      }
    }

    setFilteredComplaints(filtered);
  };

  const handleSelectComplaint = (complaintId: string) => {
    setSelectedComplaints(prev => 
      prev.includes(complaintId) 
        ? prev.filter(id => id !== complaintId)
        : [...prev, complaintId]
    );
  };

  const handleSelectAll = () => {
    if (selectedComplaints.length === filteredComplaints.length) {
      setSelectedComplaints([]);
    } else {
      setSelectedComplaints(filteredComplaints.map(complaint => complaint.id));
    }
  };

const handleRestore = async (complaintId: string) => {
  try {
    const token = getAccessToken() ?? "";
    // Use PATCH instead of GET since we're modifying data
    await api.patch(`/complaint/${complaintId}/restore/`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    
    // Update the complaint in state instead of removing it
    setComplaints(prev => prev.map(complaint => 
      complaint.id === complaintId 
        ? { ...complaint, status: 'Active', comp_is_archive: false }
        : complaint
    ));
    
    toast.success('Complaint restored successfully');
  } catch (error: any) {
    console.error('Failed to restore complaint:', error);
    toast.error('Failed to restore complaint', {
      description: error.response?.data?.message || error.message
    });
  }
};

const handleBulkRestore = async () => {
  if (selectedComplaints.length === 0) return;
  
  try {
    const token = getAccessToken() ?? "";
    await Promise.all(selectedComplaints.map(id => 
      api.patch(`/complaint/${id}/restore/`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      })
    ));
    
    // Update all selected complaints in state
    setComplaints(prev => prev.map(complaint => 
      selectedComplaints.includes(complaint.id)
        ? { ...complaint, status: 'Active', comp_is_archive: false }
        : complaint
    ));
    
    setSelectedComplaints([]);
    toast.success('Bulk restore successful', {
      description: `${selectedComplaints.length} complaint(s) have been restored.`
    });
  } catch (error: any) {
    console.error('Failed to bulk restore:', error);
    toast.error('Failed to restore some complaints', {
      description: error.response?.data?.message || error.message
    });
  }
};

  const handlePermanentDelete = async (complaintId: string) => {
    if (!confirm('Are you sure you want to permanently delete this complaint? This action cannot be undone.')) return;

    try {
      const token = getAccessToken() ?? "";
      await api.delete(`/complaint/${complaintId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      
      setComplaints(prev => prev.filter(complaint => complaint.id !== complaintId));
      toast.success('Complaint deleted permanently', {
        description: `Complaint ${complaintId} has been deleted.`
      });
    } catch (error: any) {
      console.error('Failed to delete complaint:', error);
      toast.error('Failed to delete complaint', {
        description: error.response?.data?.message || error.message
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedComplaints.length === 0) return;
    
    if (!confirm(`Are you sure you want to permanently delete ${selectedComplaints.length} complaint(s)? This action cannot be undone.`)) return;

    try {
      const token = getAccessToken() ?? "";
      await Promise.all(selectedComplaints.map(id => 
        api.delete(`/complaints/${id}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        })
      ));
      
      setComplaints(prev => prev.filter(complaint => !selectedComplaints.includes(complaint.id)));
      setSelectedComplaints([]);
      toast.success('Bulk delete successful', {
        description: `${selectedComplaints.length} complaint(s) have been deleted.`
      });
    } catch (error: any) {
      console.error('Failed to bulk delete:', error);
      toast.error('Failed to delete some complaints', {
        description: error.response?.data?.message || error.message
      });
    }
  };

  const handleExport = async () => {
    try {
      const token = getAccessToken() ?? "";
      const response = await api.get('/complaints/archived/export/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'archived_complaints_export.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('Export successful', {
        description: 'Your archived complaints have been exported.'
      });
    } catch (error: any) {
      console.error('Export failed:', error);
      toast.error('Export failed', {
        description: error.response?.data?.message || error.message
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-700 border-red-200';
      case 'Normal': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading archived complaints...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
            <Button className="text-black p-2 self-start" variant="outline">
              <Link to="/blotter-record">
                <BsChevronLeft />
              </Link>
            </Button>
          <h1 className="text-3xl font-bold text-darkBlue2">Archived Complaints</h1>
          <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            {filteredComplaints.length} archived
          </span>
        </div>
        <p className="text-gray-600">Manage and review archived complaint records</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by ID, complainant, category, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <select
                  value={selectedDateRange}
                  onChange={(e) => setSelectedDateRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {dateRanges.map(range => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedComplaints.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-blue-800 font-medium">
              {selectedComplaints.length} complaint(s) selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleBulkRestore}
                className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                Restore Selected
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complaints List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Table Header */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              checked={selectedComplaints.length === filteredComplaints.length && filteredComplaints.length > 0}
              onChange={handleSelectAll}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Select All</span>
          </div>
        </div>

        {/* Complaints */}
        {filteredComplaints.length === 0 ? (
          <div className="text-center py-12">
            <Archive className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No archived complaints found</h3>
            <p className="text-gray-500">Try adjusting your search criteria or filters</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredComplaints.map((complaint) => (
              <div key={complaint.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedComplaints.includes(complaint.id)}
                    onChange={() => handleSelectComplaint(complaint.id)}
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {complaint.id}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{complaint.complainant}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span className=''>Archived: {new Date(complaint.dateArchived).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(complaint.priority)}`}>
                          {complaint.priority}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {complaint.category}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-3 line-clamp-2">{complaint.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Accused:</span> {complaint.accusedPersons.join(', ')}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-md transition-colors text-sm">
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                        <button
                          onClick={() => handleRestore(complaint.id)}
                          className="flex items-center gap-1 px-3 py-1 text-green-600 hover:bg-green-50 rounded-md transition-colors text-sm"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Restore
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(complaint.id)}
                          className="flex items-center gap-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded-md transition-colors text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {filteredComplaints.length} of {complaints.length} archived complaints
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Archive
        </button>
      </div>
    </div>
  );
};

export default ArchiveComplaints;