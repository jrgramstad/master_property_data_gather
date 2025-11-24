/**
 * Property Taxes Component
 * Displays property tax records with filtering by year and CSV import
 */

import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getPropertyTaxes, getPropertiesForMatching, upsertPropertyTaxes, formatCurrency, formatDate } from '../lib/supabase'

function PropertyTaxes() {
  const [loading, setLoading] = useState(true)
  const [taxes, setTaxes] = useState([])
  const [filteredTaxes, setFilteredTaxes] = useState([])
  const [yearFilter, setYearFilter] = useState('all')
  const [error, setError] = useState(null)

  // Import state
  const [importing, setImporting] = useState(false)
  const [importResults, setImportResults] = useState(null)
  const fileInputRef = useRef(null)

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

  /**
   * Handle Import CSV button click
   */
  function handleImportClick() {
    fileInputRef.current?.click()
  }

  /**
   * Handle file selection and CSV import
   */
  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    setError(null)

    try {
      // Get properties for matching
      const properties = await getPropertiesForMatching()

      // Create lookup map (lowercase trimmed address -> property)
      const propertyMap = new Map()
      properties.forEach(p => {
        if (p.address) {
          propertyMap.set(p.address.toLowerCase().trim(), p)
        }
      })

      // Parse CSV using Papa Parse (loaded via CDN)
      window.Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const records = []
          const errors = []
          const rows = results.data

          for (const row of rows) {
            const propertyName = row.property_name?.trim()
            const taxYear = parseInt(row.tax_year)
            const taxAmount = parseFloat(row.tax_amount)
            const paymentStatus = row.payment_status?.trim() || 'unpaid'
            const paymentDate = row.payment_date?.trim() || null

            // Validate required fields
            if (!propertyName || !taxYear || isNaN(taxAmount)) {
              errors.push({
                property_name: propertyName || '(empty)',
                reason: 'Missing required fields (property_name, tax_year, or tax_amount)'
              })
              continue
            }

            // Match property by name (case insensitive)
            const property = propertyMap.get(propertyName.toLowerCase())

            if (!property) {
              errors.push({
                property_name: propertyName,
                reason: 'Property not found'
              })
              continue
            }

            records.push({
              property_id: property.id,
              tax_year: taxYear,
              tax_amount: taxAmount,
              payment_status: paymentStatus,
              payment_date: paymentDate || null
            })
          }

          // Upsert records if any
          let upsertedCount = 0
          if (records.length > 0) {
            try {
              const result = await upsertPropertyTaxes(records)
              upsertedCount = result.length
            } catch (err) {
              setError(`Import failed: ${err.message}`)
              setImporting(false)
              return
            }
          }

          // Show results
          setImportResults({
            total: rows.length,
            imported: upsertedCount,
            errors: errors
          })

          // Reload taxes
          await loadTaxes()
          setImporting(false)
        },
        error: (err) => {
          setError(`CSV parse error: ${err.message}`)
          setImporting(false)
        }
      })
    } catch (err) {
      setError(`Import error: ${err.message}`)
      setImporting(false)
    }

    // Reset file input
    e.target.value = ''
  }

  /**
   * Close import results modal
   */
  function closeResultsModal() {
    setImportResults(null)
  }

  // Loading state
  if (loading && !importing) {
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
  if (error && !importResults) {
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
        <button
          className="btn btn-primary"
          onClick={handleImportClick}
          disabled={importing}
        >
          {importing ? 'Importing...' : 'Import CSV'}
        </button>
        <button className="btn btn-secondary" onClick={loadTaxes} disabled={importing}>
          Refresh
        </button>
        <input
          type="file"
          ref={fileInputRef}
          accept=".csv"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
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

      {/* Import Results Modal */}
      {importResults && (
        <div className="modal-overlay" onClick={closeResultsModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Import Results</h2>
            <div className="import-results">
              <p><strong>{importResults.imported}</strong> record{importResults.imported !== 1 ? 's' : ''} imported/updated successfully</p>
              {importResults.errors.length > 0 && (
                <>
                  <p style={{ color: '#EA4335', marginTop: '15px' }}>
                    <strong>{importResults.errors.length}</strong> error{importResults.errors.length !== 1 ? 's' : ''}:
                  </p>
                  <ul className="error-list">
                    {importResults.errors.map((err, idx) => (
                      <li key={idx}>
                        <strong>{err.property_name}</strong>: {err.reason}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button className="btn btn-primary" onClick={closeResultsModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Importing overlay */}
      {importing && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ textAlign: 'center' }}>
            <div className="spinner"></div>
            <p>Importing CSV...</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default PropertyTaxes
