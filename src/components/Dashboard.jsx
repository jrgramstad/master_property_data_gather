/**
 * Dashboard Component
 * Displays all properties with stats, filtering, and sorting
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllProperties, getDashboardStats, formatDate } from '../lib/supabase'

function Dashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [properties, setProperties] = useState([])
  const [filteredProperties, setFilteredProperties] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    notStarted: 0,
    completionRate: 0
  })
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('address')
  const [error, setError] = useState(null)

  // Load data on mount
  useEffect(() => {
    loadDashboard()
  }, [])

  // Apply filter when properties or filter changes
  useEffect(() => {
    applyFilter()
  }, [properties, filter])

  // Apply sort when filteredProperties or sortBy changes
  useEffect(() => {
    applySort()
  }, [sortBy])

  /**
   * Load all properties and stats
   */
  async function loadDashboard() {
    try {
      setLoading(true)
      setError(null)

      const [propertiesData, statsData] = await Promise.all([
        getAllProperties(),
        getDashboardStats()
      ])

      setProperties(propertiesData)
      setStats(statsData)
    } catch (err) {
      console.error('Error loading dashboard:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Apply filter to properties
   */
  function applyFilter() {
    if (filter === 'all') {
      setFilteredProperties([...properties])
    } else {
      const filtered = properties.filter(property => {
        const completeness = property.data_completeness_score || 0
        const status = getCompletenessClass(completeness)
        return status === filter
      })
      setFilteredProperties(filtered)
    }
  }

  /**
   * Apply sort to filtered properties
   */
  function applySort() {
    const sorted = [...filteredProperties].sort((a, b) => {
      switch (sortBy) {
        case 'address':
          return (a.name || a.address || '').localeCompare(b.name || b.address || '')
        case 'completeness-asc':
          return (a.data_completeness_score || 0) - (b.data_completeness_score || 0)
        case 'completeness-desc':
          return (b.data_completeness_score || 0) - (a.data_completeness_score || 0)
        case 'date':
          return new Date(b.last_verified_date || 0) - new Date(a.last_verified_date || 0)
        default:
          return 0
      }
    })
    setFilteredProperties(sorted)
  }

  /**
   * Get CSS class based on completeness score
   */
  function getCompletenessClass(score) {
    if (score === 100) return 'complete'
    if (score > 0) return 'in-progress'
    return 'not-started'
  }

  /**
   * Navigate to wizard for new property
   */
  function addNewProperty() {
    navigate('/wizard/new')
  }

  /**
   * Navigate to wizard to edit property
   */
  function editProperty(id) {
    navigate(`/wizard/edit/${id}`)
  }

  /**
   * Refresh dashboard
   */
  function refresh() {
    loadDashboard()
  }

  // Loading state
  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading properties...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="container">
        <div className="alert alert-error">
          <strong>Error:</strong> {error}
          <button className="btn btn-secondary" onClick={refresh} style={{ marginLeft: '10px' }}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <h1>Property Master List</h1>
        <p>Dashboard - Property Database</p>
      </div>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Total Properties</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.completed}</span>
          <span className="stat-label">Completed (100%)</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.inProgress}</span>
          <span className="stat-label">In Progress</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.notStarted}</span>
          <span className="stat-label">Not Started</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.completionRate}%</span>
          <span className="stat-label">Overall Progress</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="btn btn-primary btn-large" onClick={addNewProperty}>
          + Add New Property
        </button>
        <button className="btn btn-secondary" onClick={refresh}>
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <label htmlFor="filterStatus">Filter:</label>
          <select
            id="filterStatus"
            className="form-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="all">All Properties</option>
            <option value="not-started">Not Started</option>
            <option value="in-progress">In Progress</option>
            <option value="complete">Completed (100%)</option>
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="sortBy">Sort by:</label>
          <select
            id="sortBy"
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="address">Address</option>
            <option value="completeness-asc">Completeness (Low to High)</option>
            <option value="completeness-desc">Completeness (High to Low)</option>
            <option value="date">Last Verified Date</option>
          </select>
        </div>
      </div>

      {/* Property Table */}
      {filteredProperties.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table className="property-table">
            <thead>
              <tr>
                <th>Address</th>
                <th>City</th>
                <th>Type</th>
                <th>Status</th>
                <th>Completeness</th>
                <th>Last Verified</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProperties.map((property) => {
                const completeness = property.data_completeness_score || 0
                const rowClass = getCompletenessClass(completeness)
                const badgeClass = getCompletenessClass(completeness)

                return (
                  <tr key={property.id} className={rowClass} onClick={() => editProperty(property.id)}>
                    <td>{property.name || property.address || 'Unnamed Property'}</td>
                    <td>{property.city || '-'}</td>
                    <td>{property.property_type || '-'}</td>
                    <td>{property.occupancy_status || '-'}</td>
                    <td>
                      <span className={`progress-badge ${badgeClass}`}>
                        {completeness}%
                      </span>
                    </td>
                    <td>{formatDate(property.last_verified_date) || 'Never'}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button
                        className="btn btn-primary"
                        style={{ padding: '8px 16px', fontSize: '14px' }}
                        onClick={() => editProperty(property.id)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>No Properties Yet</h3>
          <p>Click "Add New Property" to get started</p>
        </div>
      )}
    </div>
  )
}

export default Dashboard
