/**
 * Wizard Component
 * Multi-step form for property data entry (Steps 1-5)
 */

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  getPropertyById,
  getPropertyList,
  getDropdownOptions,
  saveProperty,
  formatDateForInput
} from '../lib/supabase'

function Wizard() {
  const navigate = useNavigate()
  const { mode, id } = useParams()
  const isEditMode = mode === 'edit' && id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [propertyData, setPropertyData] = useState({})
  const [dropdownOptions, setDropdownOptions] = useState({})
  const [propertyList, setPropertyList] = useState([])
  const [alert, setAlert] = useState(null)
  const [savedIndicator, setSavedIndicator] = useState(false)

  const totalSteps = 5
  const stepNames = ['Property Selection', 'Basic Info', 'Financial', 'Current Status', 'Condition']

  // Load initial data
  useEffect(() => {
    loadInitialData()
  }, [])

  /**
   * Load dropdown options and property list
   */
  async function loadInitialData() {
    try {
      setLoading(true)

      const [options, list] = await Promise.all([
        getDropdownOptions(),
        getPropertyList()
      ])

      setDropdownOptions(options)
      setPropertyList(list)

      // If edit mode, load property data
      if (isEditMode) {
        const property = await getPropertyById(id)
        setPropertyData(property)
      }

      setLoading(false)
    } catch (err) {
      console.error('Error loading wizard data:', err)
      showAlert('Error loading data: ' + err.message, 'error')
      setLoading(false)
    }
  }

  /**
   * Update property data field
   */
  function updateField(field, value) {
    setPropertyData(prev => ({ ...prev, [field]: value }))
  }

  /**
   * Show alert message
   */
  function showAlert(message, type = 'info') {
    setAlert({ message, type })
    setTimeout(() => setAlert(null), 5000)
  }

  /**
   * Show saved indicator
   */
  function showSaved() {
    setSavedIndicator(true)
    setTimeout(() => setSavedIndicator(false), 2000)
  }

  /**
   * Validate current step
   */
  function validateStep() {
    const requiredFields = {
      2: [
        { field: 'address', label: 'Street Address' },
        { field: 'city', label: 'City' },
        { field: 'state', label: 'State' },
        { field: 'zip', label: 'ZIP Code' },
        { field: 'property_type', label: 'Property Type' },
        { field: 'bedrooms', label: 'Bedrooms' },
        { field: 'bathrooms', label: 'Bathrooms' }
      ],
      3: [
        { field: 'purchase_date', label: 'Purchase Date' },
        { field: 'purchase_price', label: 'Purchase Price' }
      ],
      4: [
        { field: 'occupancy_status', label: 'Occupancy Status' }
      ]
    }

    const required = requiredFields[currentStep] || []
    const missing = []

    required.forEach(({ field, label }) => {
      if (!propertyData[field] || propertyData[field] === '') {
        missing.push(label)
      }
    })

    if (missing.length > 0) {
      showAlert('Please fill in required fields: ' + missing.join(', '), 'warning')
      return false
    }

    return true
  }

  /**
   * Save and continue to next step
   */
  async function saveAndContinue() {
    if (!validateStep()) return

    try {
      setSaving(true)
      const saved = await saveProperty(propertyData)
      setPropertyData(saved)
      showSaved()
      nextStep()
    } catch (err) {
      console.error('Error saving property:', err)
      showAlert('Error saving: ' + err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  /**
   * Save and finish (last step)
   */
  async function saveAndFinish() {
    try {
      setSaving(true)
      await saveProperty(propertyData)
      showAlert('Property saved successfully!', 'success')
      setTimeout(() => navigate('/'), 2000)
    } catch (err) {
      console.error('Error saving property:', err)
      showAlert('Error saving: ' + err.message, 'error')
      setSaving(false)
    }
  }

  /**
   * Navigate to next step
   */
  function nextStep() {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
      window.scrollTo(0, 0)
    }
  }

  /**
   * Navigate to previous step
   */
  function prevStep() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo(0, 0)
    }
  }

  /**
   * Go back to dashboard
   */
  function goToDashboard() {
    navigate('/')
  }

  /**
   * Handle property selection change
   */
  async function onPropertySelected(selectedId) {
    if (selectedId === 'new') {
      setPropertyData({})
    } else {
      try {
        setLoading(true)
        const property = await getPropertyById(selectedId)
        setPropertyData(property)
        setLoading(false)
      } catch (err) {
        showAlert('Error loading property: ' + err.message, 'error')
        setLoading(false)
      }
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="wizard-container">
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="wizard-container">
      <div className="container">
        {/* Header */}
        <div className="header">
          <h1>Property Data Entry</h1>
          <p>
            {isEditMode
              ? `Editing: ${propertyData.address || 'Property'}`
              : 'Adding new property'}
          </p>
        </div>

        {/* Saved Indicator */}
        {savedIndicator && (
          <div className="saved-indicator active">
            Saved successfully!
          </div>
        )}

        {/* Alert Messages */}
        {alert && (
          <div className={`alert alert-${alert.type} active`}>
            {alert.message}
          </div>
        )}

        {/* Progress Bar */}
        <div className="progress-bar-container">
          <div className="progress-steps">
            {stepNames.map((name, index) => {
              const stepNum = index + 1
              const stepClass =
                stepNum === currentStep
                  ? 'step active'
                  : stepNum < currentStep
                  ? 'step completed'
                  : 'step'

              return (
                <div key={stepNum} className={stepClass}>
                  {stepNum}. {name}
                </div>
              )
            })}
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form Steps */}
        <div className="form-container">
          {/* STEP 1: Property Selection */}
          {currentStep === 1 && (
            <Step1
              propertyData={propertyData}
              propertyList={propertyList}
              onPropertySelected={onPropertySelected}
              goToDashboard={goToDashboard}
              nextStep={nextStep}
            />
          )}

          {/* STEP 2: Basic Info */}
          {currentStep === 2 && (
            <Step2
              propertyData={propertyData}
              updateField={updateField}
              dropdownOptions={dropdownOptions}
              prevStep={prevStep}
              saveAndContinue={saveAndContinue}
              saving={saving}
            />
          )}

          {/* STEP 3: Financial */}
          {currentStep === 3 && (
            <Step3
              propertyData={propertyData}
              updateField={updateField}
              dropdownOptions={dropdownOptions}
              prevStep={prevStep}
              saveAndContinue={saveAndContinue}
              saving={saving}
            />
          )}

          {/* STEP 4: Current Status */}
          {currentStep === 4 && (
            <Step4
              propertyData={propertyData}
              updateField={updateField}
              dropdownOptions={dropdownOptions}
              prevStep={prevStep}
              saveAndContinue={saveAndContinue}
              saving={saving}
            />
          )}

          {/* STEP 5: Condition */}
          {currentStep === 5 && (
            <Step5
              propertyData={propertyData}
              updateField={updateField}
              dropdownOptions={dropdownOptions}
              prevStep={prevStep}
              saveAndFinish={saveAndFinish}
              saving={saving}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// STEP COMPONENTS
// ============================================================================

function Step1({ propertyData, propertyList, onPropertySelected, goToDashboard, nextStep }) {
  return (
    <div className="form-section active">
      <h2 className="section-title">Select Property</h2>
      <p className="section-description">Choose an existing property to edit, or add a new one</p>

      <div className="form-group">
        <label className="form-label">Property</label>
        <select
          className="form-select"
          value={propertyData.id || 'new'}
          onChange={(e) => onPropertySelected(e.target.value)}
        >
          <option value="new">+ Add New Property</option>
          {propertyList.map((property) => (
            <option key={property.id} value={property.id}>
              {property.address}
            </option>
          ))}
        </select>
      </div>

      <div className="form-navigation">
        <button className="btn btn-secondary" onClick={goToDashboard}>
          Back to Dashboard
        </button>
        <button className="btn btn-primary" onClick={nextStep}>
          Continue
        </button>
      </div>
    </div>
  )
}

function Step2({ propertyData, updateField, dropdownOptions, prevStep, saveAndContinue, saving }) {
  return (
    <div className="form-section active">
      <h2 className="section-title">Basic Property Information</h2>
      <p className="section-description">Enter core property details</p>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label required">Street Address</label>
          <input
            type="text"
            className="form-input"
            placeholder="123 Main Street"
            value={propertyData.address || ''}
            onChange={(e) => updateField('address', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label required">City</label>
          <input
            type="text"
            className="form-input"
            placeholder="Dallas"
            value={propertyData.city || ''}
            onChange={(e) => updateField('city', e.target.value)}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label required">State</label>
          <select
            className="form-select"
            value={propertyData.state || 'TX'}
            onChange={(e) => updateField('state', e.target.value)}
          >
            <option value="">Select State</option>
            {(dropdownOptions.State || []).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label required">ZIP Code</label>
          <input
            type="text"
            className="form-input"
            placeholder="75201"
            value={propertyData.zip || ''}
            onChange={(e) => updateField('zip', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">County</label>
          <input
            type="text"
            className="form-input"
            placeholder="Dallas County"
            value={propertyData.county || ''}
            onChange={(e) => updateField('county', e.target.value)}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label required">Property Type</label>
          <select
            className="form-select"
            value={propertyData.property_type || ''}
            onChange={(e) => updateField('property_type', e.target.value)}
          >
            <option value="">Select Type</option>
            {(dropdownOptions.PropertyType || []).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label required">Bedrooms</label>
          <input
            type="number"
            className="form-input"
            min="0"
            placeholder="3"
            value={propertyData.bedrooms || ''}
            onChange={(e) => updateField('bedrooms', parseInt(e.target.value))}
          />
        </div>
        <div className="form-group">
          <label className="form-label required">Bathrooms</label>
          <input
            type="number"
            className="form-input"
            min="0"
            step="0.5"
            placeholder="2"
            value={propertyData.bathrooms || ''}
            onChange={(e) => updateField('bathrooms', parseFloat(e.target.value))}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Square Footage</label>
          <input
            type="number"
            className="form-input"
            min="0"
            placeholder="1500"
            value={propertyData.square_footage || ''}
            onChange={(e) => updateField('square_footage', parseInt(e.target.value))}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Lot Size (sq ft)</label>
          <input
            type="number"
            className="form-input"
            min="0"
            placeholder="6000"
            value={propertyData.lot_size || ''}
            onChange={(e) => updateField('lot_size', parseInt(e.target.value))}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Year Built</label>
          <input
            type="number"
            className="form-input"
            min="1800"
            max="2100"
            placeholder="1995"
            value={propertyData.year_built || ''}
            onChange={(e) => updateField('year_built', parseInt(e.target.value))}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Stories</label>
          <input
            type="number"
            className="form-input"
            min="1"
            max="10"
            placeholder="1"
            value={propertyData.stories || ''}
            onChange={(e) => updateField('stories', parseInt(e.target.value))}
          />
        </div>
      </div>

      <div className="form-navigation">
        <button className="btn btn-secondary" onClick={prevStep}>
          Previous
        </button>
        <button className="btn btn-success" onClick={saveAndContinue} disabled={saving}>
          {saving ? 'Saving...' : 'Save & Continue'}
        </button>
      </div>
    </div>
  )
}

function Step3({ propertyData, updateField, dropdownOptions, prevStep, saveAndContinue, saving }) {
  return (
    <div className="form-section active">
      <h2 className="section-title">Acquisition & Financial Details</h2>
      <p className="section-description">Purchase information and financial data</p>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label required">Purchase Date</label>
          <input
            type="date"
            className="form-input"
            value={formatDateForInput(propertyData.purchase_date) || ''}
            onChange={(e) => updateField('purchase_date', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label required">Purchase Price</label>
          <input
            type="number"
            className="form-input"
            min="0"
            placeholder="125000"
            value={propertyData.purchase_price || ''}
            onChange={(e) => updateField('purchase_price', parseFloat(e.target.value))}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Acquisition Method</label>
          <select
            className="form-select"
            value={propertyData.acquisition_method || ''}
            onChange={(e) => updateField('acquisition_method', e.target.value)}
          >
            <option value="">Select Method</option>
            {(dropdownOptions.AcquisitionMethod || []).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Current Estimated Value</label>
          <input
            type="number"
            className="form-input"
            min="0"
            placeholder="150000"
            value={propertyData.current_estimated_value || ''}
            onChange={(e) => updateField('current_estimated_value', parseFloat(e.target.value))}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Total Rehab Cost</label>
          <input
            type="number"
            className="form-input"
            min="0"
            placeholder="15000"
            value={propertyData.total_rehab_cost || ''}
            onChange={(e) => updateField('total_rehab_cost', parseFloat(e.target.value))}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Current Monthly Rent</label>
          <input
            type="number"
            className="form-input"
            min="0"
            placeholder="1200"
            value={propertyData.current_monthly_rent || ''}
            onChange={(e) => updateField('current_monthly_rent', parseFloat(e.target.value))}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Market Rent</label>
          <input
            type="number"
            className="form-input"
            min="0"
            placeholder="1250"
            value={propertyData.market_rent || ''}
            onChange={(e) => updateField('market_rent', parseFloat(e.target.value))}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Monthly Mortgage Payment</label>
          <input
            type="number"
            className="form-input"
            min="0"
            placeholder="850"
            value={propertyData.mortgage_payment || ''}
            onChange={(e) => updateField('mortgage_payment', parseFloat(e.target.value))}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Annual Property Tax</label>
          <input
            type="number"
            className="form-input"
            min="0"
            placeholder="2400"
            value={propertyData.property_tax_annual || ''}
            onChange={(e) => updateField('property_tax_annual', parseFloat(e.target.value))}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Annual Insurance</label>
          <input
            type="number"
            className="form-input"
            min="0"
            placeholder="1200"
            value={propertyData.insurance_annual || ''}
            onChange={(e) => updateField('insurance_annual', parseFloat(e.target.value))}
          />
        </div>
      </div>

      <div className="form-navigation">
        <button className="btn btn-secondary" onClick={prevStep}>
          Previous
        </button>
        <button className="btn btn-success" onClick={saveAndContinue} disabled={saving}>
          {saving ? 'Saving...' : 'Save & Continue'}
        </button>
      </div>
    </div>
  )
}

function Step4({ propertyData, updateField, dropdownOptions, prevStep, saveAndContinue, saving }) {
  return (
    <div className="form-section active">
      <h2 className="section-title">Current Status</h2>
      <p className="section-description">Occupancy and tenant information</p>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label required">Occupancy Status</label>
          <select
            className="form-select"
            value={propertyData.occupancy_status || ''}
            onChange={(e) => updateField('occupancy_status', e.target.value)}
          >
            <option value="">Select Status</option>
            {(dropdownOptions.OccupancyStatus || []).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Current Tenant Name</label>
          <input
            type="text"
            className="form-input"
            placeholder="John Smith"
            value={propertyData.current_tenant_name || ''}
            onChange={(e) => updateField('current_tenant_name', e.target.value)}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Tenant Move-In Date</label>
          <input
            type="date"
            className="form-input"
            value={formatDateForInput(propertyData.tenant_move_in_date) || ''}
            onChange={(e) => updateField('tenant_move_in_date', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Lease End Date</label>
          <input
            type="date"
            className="form-input"
            value={formatDateForInput(propertyData.lease_end_date) || ''}
            onChange={(e) => updateField('lease_end_date', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Lease Type</label>
          <select
            className="form-select"
            value={propertyData.lease_type || ''}
            onChange={(e) => updateField('lease_type', e.target.value)}
          >
            <option value="">Select Lease Type</option>
            {(dropdownOptions.LeaseType || []).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Last Rent Payment Date</label>
          <input
            type="date"
            className="form-input"
            value={formatDateForInput(propertyData.last_rent_payment_date) || ''}
            onChange={(e) => updateField('last_rent_payment_date', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Rent Payment Status</label>
          <select
            className="form-select"
            value={propertyData.rent_payment_status || ''}
            onChange={(e) => updateField('rent_payment_status', e.target.value)}
          >
            <option value="">Select Status</option>
            {(dropdownOptions.RentPaymentStatus || []).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-navigation">
        <button className="btn btn-secondary" onClick={prevStep}>
          Previous
        </button>
        <button className="btn btn-success" onClick={saveAndContinue} disabled={saving}>
          {saving ? 'Saving...' : 'Save & Continue'}
        </button>
      </div>
    </div>
  )
}

function Step5({ propertyData, updateField, dropdownOptions, prevStep, saveAndFinish, saving }) {
  return (
    <div className="form-section active">
      <h2 className="section-title">Property Condition & Maintenance</h2>
      <p className="section-description">Inspection history and maintenance records</p>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Last Inspection Date</label>
          <input
            type="date"
            className="form-input"
            value={formatDateForInput(propertyData.last_inspection_date) || ''}
            onChange={(e) => updateField('last_inspection_date', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Inspector Name</label>
          <input
            type="text"
            className="form-input"
            placeholder="Kalen"
            value={propertyData.last_inspector || ''}
            onChange={(e) => updateField('last_inspector', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Overall Condition</label>
          <select
            className="form-select"
            value={propertyData.overall_condition_rating || ''}
            onChange={(e) => updateField('overall_condition_rating', e.target.value)}
          >
            <option value="">Select Rating</option>
            {(dropdownOptions.ConditionRating || []).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Last HVAC Service Date</label>
          <input
            type="date"
            className="form-input"
            value={formatDateForInput(propertyData.last_hvac_service_date) || ''}
            onChange={(e) => updateField('last_hvac_service_date', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">HVAC Condition</label>
          <input
            type="text"
            className="form-input"
            placeholder="Good"
            value={propertyData.hvac_condition || ''}
            onChange={(e) => updateField('hvac_condition', e.target.value)}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Last Roof Inspection</label>
          <input
            type="date"
            className="form-input"
            value={formatDateForInput(propertyData.last_roof_inspection_date) || ''}
            onChange={(e) => updateField('last_roof_inspection_date', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Roof Condition</label>
          <input
            type="text"
            className="form-input"
            placeholder="Good"
            value={propertyData.roof_condition || ''}
            onChange={(e) => updateField('roof_condition', e.target.value)}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Foundation Issues</label>
          <textarea
            className="form-textarea"
            placeholder="Any foundation issues or notes..."
            value={propertyData.foundation_issues || ''}
            onChange={(e) => updateField('foundation_issues', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Plumbing Issues</label>
          <textarea
            className="form-textarea"
            placeholder="Any plumbing issues or notes..."
            value={propertyData.plumbing_issues || ''}
            onChange={(e) => updateField('plumbing_issues', e.target.value)}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Electrical Issues</label>
          <textarea
            className="form-textarea"
            placeholder="Any electrical issues or notes..."
            value={propertyData.electrical_issues || ''}
            onChange={(e) => updateField('electrical_issues', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Pending Maintenance</label>
          <textarea
            className="form-textarea"
            placeholder="Pending maintenance requests..."
            value={propertyData.pending_maintenance_requests || ''}
            onChange={(e) => updateField('pending_maintenance_requests', e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Major Repairs Needed</label>
        <textarea
          className="form-textarea"
          placeholder="List any major repairs needed..."
          value={propertyData.major_repairs_needed || ''}
          onChange={(e) => updateField('major_repairs_needed', e.target.value)}
        />
      </div>

      <div className="form-navigation">
        <button className="btn btn-secondary" onClick={prevStep}>
          Previous
        </button>
        <button className="btn btn-success" onClick={saveAndFinish} disabled={saving}>
          {saving ? 'Saving...' : 'Save & Finish'}
        </button>
      </div>
    </div>
  )
}

export default Wizard
