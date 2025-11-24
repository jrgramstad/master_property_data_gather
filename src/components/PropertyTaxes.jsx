/**
 * Property Taxes Component
 * Displays property tax records with filtering by year
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getPropertyTaxes, formatCurrency, formatDate } from '../lib/supabase'

function PropertyTaxes() {
  const [loading, setLoading] = useState(true)
  const [taxes, setTaxes] = useState([])
  const [filteredTaxes, setFilteredTaxes] = useState([])
  const [yearFilter, setYearFilter] = useState('all')
  const [error, setError] = useState(null)

  // Available years for filter
  const availableYears = [2024, 2025]

  // Load data on mount
  useEffect(() => {
    loadTaxes()
  }, [])

  // Apply filter when taxes or yearFilter changes
  useEffect(() => {
    if (yearFilter === 'all') {
      setFilteredTaxes(taxes)
    } else {
      setFilteredTaxes(taxes.filter(t => t.tax_year === parseInt(yearFilter)))
    }
  }, [taxes, yearFilter])

  /**
   * Load all property taxes
   */
  async function loadTaxes() {
    try {
      setLoading(true)
      setError(null)
      const data = await getPropertyTaxes()
      setTaxes(data)
    } catch (err) {
      console.error('Error loading property taxes:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Get status badge class
   */
  function getStatusClass(status) {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'complete'
      case 'partial':
        return 'in-progress'
      case 'unpaid':
      default:
        return 'not-started'
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading property taxes...</p>
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
          <button className="btn btn-secondary" onClick={loadTaxes} style={{ marginLeft: '10px' }}>
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
        <h1>Property Taxes</h1>
        <p>Tax records for all properties</p>
      </div>

      {/* Navigation */}
      <div className="action-buttons">
        <Link to="/" className="btn btn-secondary">
          Back to Dashboard
        </Link>
        <button className="btn btn-secondary" onClick={loadTaxes}>
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <label htmlFor="yearFilter">Tax Year:</label>
          <select
            id="yearFilter"
            className="form-select"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="all">All Years</option>
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <span style={{ color: '#666' }}>
            Showing {filteredTaxes.length} record{filteredTaxes.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Property Taxes Table */}
      {filteredTaxes.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table className="property-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Tax Year</th>
                <th>Tax Amount</th>
                <th>Status</th>
                <th>Payment Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredTaxes.map((tax) => {
                const statusClass = getStatusClass(tax.payment_status)
                return (
                  <tr key={tax.id}>
                    <td>{tax.properties?.address || 'Unknown Property'}</td>
                    <td>{tax.tax_year}</td>
                    <td>{formatCurrency(tax.tax_amount)}</td>
                    <td>
                      <span className={`progress-badge ${statusClass}`}>
                        {tax.payment_status || 'unpaid'}
                      </span>
                    </td>
                    <td>{formatDate(tax.payment_date) || '-'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">$</div>
          <h3>No Tax Records</h3>
          <p>No property tax records found{yearFilter !== 'all' ? ` for ${yearFilter}` : ''}</p>
        </div>
      )}
    </div>
  )
}

export default PropertyTaxes
