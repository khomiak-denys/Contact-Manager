import React, { useState, useEffect, useMemo } from 'react';
import { Upload, Search, Edit, Trash2, Save, X, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

const ApiService = {
  baseUrl: 'http://localhost:5000/contact-manager/api/contracts',
  
  async uploadCsv(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.Message || errorData.error;
        } catch {
          errorMessage = await response.text();
        }
        throw new Error(errorMessage || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Upload CSV error:', error);
      throw error;
    }
  },
  
  async getContacts(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${this.baseUrl}?Page=1&PageSize=100`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.Message || errorData.error;
        } catch {
          errorMessage = await response.text();
        }
        throw new Error(errorMessage || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get contacts error:', error);
      throw error;
    }
  },
  
  async updateContact(id, contactData) {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      });
      
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.Message || errorData.error;
        } catch {
          errorMessage = await response.text();
        }
        throw new Error(errorMessage || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Update contact error:', error);
      throw error;
    }
  },
  
  async deleteContact(id) {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.Message || errorData.error;
        } catch {
          errorMessage = await response.text();
        }
        throw new Error(errorMessage || `HTTP error! status: ${response.status}`);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Delete contact error:', error);
      throw error;
    }
  }
};

const ContactManager = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filters, setFilters] = useState({
    married: '',
    minSalary: '',
    maxSalary: ''
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await ApiService.getContacts();
      
      const contactsArray = Array.isArray(data) ? data : (data.contacts || data.data || []);
      setContacts(contactsArray);
    } catch (err) {
      setError(err.message);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    try {
      setUploadLoading(true);
      setError('');
      setSuccess('');
      
      const result = await ApiService.uploadCsv(file);
      
      // Handle different response formats
      const message = result.message || result.Message || 'CSV uploaded successfully';
      const recordsCount = result.recordsProcessed || result.RecordsProcessed || result.count || 'some';
      
      setSuccess(`${message}. Processed ${recordsCount} records.`);
      
      // Refresh the contacts list
      await fetchContacts();
      
      // Clear the file input
      event.target.value = '';
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleEdit = (contact) => {
    setEditingId(contact.id);
    
    // Handle different date formats from API
    let dateValue = '';
    if (contact.dateOfBirth) {
      const date = new Date(contact.dateOfBirth);
      if (!isNaN(date.getTime())) {
        dateValue = date.toISOString().split('T')[0];
      }
    }
    
    setEditForm({
      name: contact.name || '',
      dateOfBirth: dateValue,
      married: Boolean(contact.married),
      phone: contact.phone || '',
      salary: Number(contact.salary) || 0
    });
  };

  const handleSave = async (id) => {
    try {
      setLoading(true);
      setError('');
      
      const updateData = {
        name: editForm.name.trim(),
        dateOfBirth: editForm.dateOfBirth,
        married: editForm.married,
        phone: editForm.phone.trim(),
        salary: Number(editForm.salary)
      };
      
      const updatedContact = await ApiService.updateContact(id, updateData);
      
      // Update the contact in local state
      setContacts(contacts.map(contact => 
        contact.id === id ? { ...contact, ...updatedContact } : contact
      ));
      
      setEditingId(null);
      setEditForm({});
      setSuccess('Contact updated successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    
    try {
      setLoading(true);
      setError('');
      
      await ApiService.deleteContact(id);
      
      // Remove the contact from local state
      setContacts(contacts.filter(contact => contact.id !== id));
      setSuccess('Contact deleted successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  // Filter and sort contacts
  const filteredAndSortedContacts = useMemo(() => {
    let filtered = contacts.filter(contact => {
      const name = contact.name || '';
      const phone = contact.phone || '';
      
      const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           phone.includes(searchTerm);
      
      const matchesMarried = filters.married === '' || 
                            (filters.married === 'true' && contact.married) ||
                            (filters.married === 'false' && !contact.married);
      
      const salary = parseFloat(contact.salary) || 0;
      const matchesMinSalary = filters.minSalary === '' || 
                              salary >= parseFloat(filters.minSalary);
      
      const matchesMaxSalary = filters.maxSalary === '' || 
                              salary <= parseFloat(filters.maxSalary);
      
      return matchesSearch && matchesMarried && matchesMinSalary && matchesMaxSalary;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        if (sortConfig.key === 'salary') {
          aValue = parseFloat(aValue) || 0;
          bValue = parseFloat(bValue) || 0;
        } else if (sortConfig.key === 'dateOfBirth') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        } else if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [contacts, searchTerm, filters, sortConfig]);

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="w-4 h-4" />;
    return sortConfig.direction === 'asc' ? 
      <ArrowUp className="w-4 h-4" /> : 
      <ArrowDown className="w-4 h-4" />;
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    return num.toLocaleString('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="border-b border-gray-200 p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Contact Manager</h1>
            
            {/* Upload Section */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex items-center gap-2">
                <label htmlFor="csv-upload" className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors ${uploadLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <Upload className="w-4 h-4" />
                  {uploadLoading ? 'Uploading...' : 'Upload CSV'}
                </label>
                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploadLoading}
                />
              </div>
              
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="mt-4 flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                <select
                  value={filters.married}
                  onChange={(e) => setFilters({...filters, married: e.target.value})}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All</option>
                  <option value="true">Married</option>
                  <option value="false">Single</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Salary</label>
                <input
                  type="number"
                  placeholder="Min salary"
                  value={filters.minSalary}
                  onChange={(e) => setFilters({...filters, minSalary: e.target.value})}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Salary</label>
                <input
                  type="number"
                  placeholder="Max salary"
                  value={filters.maxSalary}
                  onChange={(e) => setFilters({...filters, maxSalary: e.target.value})}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {(filters.married || filters.minSalary || filters.maxSalary) && (
                <div className="flex items-end">
                  <button
                    onClick={() => setFilters({ married: '', minSalary: '', maxSalary: '' })}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 underline"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          {(error || success) && (
            <div className="p-4 border-b border-gray-200">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-2 flex justify-between items-center">
                  <span>{error}</span>
                  <button onClick={clearMessages} className="text-red-700 hover:text-red-900">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex justify-between items-center">
                  <span>{success}</span>
                  <button onClick={clearMessages} className="text-green-700 hover:text-green-900">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-1 font-medium text-gray-900 hover:text-blue-600"
                    >
                      Name {getSortIcon('name')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort('dateOfBirth')}
                      className="flex items-center gap-1 font-medium text-gray-900 hover:text-blue-600"
                    >
                      Date of Birth {getSortIcon('dateOfBirth')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort('married')}
                      className="flex items-center gap-1 font-medium text-gray-900 hover:text-blue-600"
                    >
                      Married {getSortIcon('married')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort('phone')}
                      className="flex items-center gap-1 font-medium text-gray-900 hover:text-blue-600"
                    >
                      Phone {getSortIcon('phone')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort('salary')}
                      className="flex items-center gap-1 font-medium text-gray-900 hover:text-blue-600"
                    >
                      Salary {getSortIcon('salary')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading && filteredAndSortedContacts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      Loading contacts...
                    </td>
                  </tr>
                ) : filteredAndSortedContacts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No contacts found. Upload a CSV file to get started.
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedContacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        {editingId === contact.id ? (
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                            className="border border-gray-300 rounded px-2 py-1 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        ) : (
                          <span className="font-medium text-gray-900">{contact.name}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingId === contact.id ? (
                          <input
                            type="date"
                            value={editForm.dateOfBirth}
                            onChange={(e) => setEditForm({...editForm, dateOfBirth: e.target.value})}
                            className="border border-gray-300 rounded px-2 py-1 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        ) : (
                          <span className="text-gray-600">{formatDate(contact.dateOfBirth)}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingId === contact.id ? (
                          <select
                            value={editForm.married}
                            onChange={(e) => setEditForm({...editForm, married: e.target.value === 'true'})}
                            className="border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            contact.married ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {contact.married ? 'Yes' : 'No'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingId === contact.id ? (
                          <input
                            type="tel"
                            value={editForm.phone}
                            onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                            className="border border-gray-300 rounded px-2 py-1 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        ) : (
                          <span className="text-gray-600">{contact.phone}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingId === contact.id ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editForm.salary}
                            onChange={(e) => setEditForm({...editForm, salary: parseFloat(e.target.value)})}
                            className="border border-gray-300 rounded px-2 py-1 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        ) : (
                          <span className="font-medium text-gray-900">
                            {formatCurrency(contact.salary)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {editingId === contact.id ? (
                            <>
                              <button
                                onClick={() => handleSave(contact.id)}
                                className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                                disabled={loading}
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={handleCancel}
                                className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded"
                                disabled={loading}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEdit(contact)}
                                className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                disabled={loading}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(contact.id)}
                                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                                disabled={loading}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {filteredAndSortedContacts.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-600">
                Showing {filteredAndSortedContacts.length} of {contacts.length} contacts
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactManager;