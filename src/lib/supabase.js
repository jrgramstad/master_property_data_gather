/**
 * Supabase Client Configuration
 * Handles all database operations for Property Master List
 */

import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.'
  )
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ============================================================================
// PROPERTY API FUNCTIONS
// ============================================================================

/**
 * Get all properties with dashboard info
 * @returns {Promise<Array>} Array of property objects
 */
export async function getAllProperties() {
  const { data, error} = await supabase
    .from('properties')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Get property by ID
 * @param {string} id - Property UUID
 * @returns {Promise<Object>} Property object
 */
export async function getPropertyById(id) {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

/**
 * Create new property
 * @param {Object} propertyData - Property data object
 * @returns {Promise<Object>} Created property object
 */
export async function createProperty(propertyData) {
  const { data, error } = await supabase
    .from('properties')
    .insert([propertyData])
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update existing property
 * @param {string} id - Property UUID
 * @param {Object} propertyData - Property data object
 * @returns {Promise<Object>} Updated property object
 */
export async function updateProperty(id, propertyData) {
  const { data, error } = await supabase
    .from('properties')
    .update(propertyData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Save property (create or update)
 * @param {Object} propertyData - Property data object (with optional id)
 * @returns {Promise<Object>} Saved property object
 */
export async function saveProperty(propertyData) {
  if (propertyData.id) {
    // Update existing
    const { id, ...dataWithoutId } = propertyData
    return await updateProperty(id, dataWithoutId)
  } else {
    // Create new
    return await createProperty(propertyData)
  }
}

/**
 * Delete property
 * @param {string} id - Property UUID
 * @returns {Promise<void>}
 */
export async function deleteProperty(id) {
  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ============================================================================
// DROPDOWN OPTIONS API
// ============================================================================

/**
 * Get all dropdown options grouped by type
 * @returns {Promise<Object>} Object with option types as keys
 */
export async function getDropdownOptions() {
  const { data, error } = await supabase
    .from('dropdown_options')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) throw error

  // Group by option_type
  const grouped = {}
  data.forEach(option => {
    if (!grouped[option.option_type]) {
      grouped[option.option_type] = []
    }
    grouped[option.option_type].push(option.option_value)
  })

  return grouped
}

/**
 * Get dropdown options by type
 * @param {string} optionType - Type of options to retrieve
 * @returns {Promise<Array>} Array of option values
 */
export async function getDropdownOptionsByType(optionType) {
  const { data, error } = await supabase
    .from('dropdown_options')
    .select('option_value')
    .eq('option_type', optionType)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return data.map(item => item.option_value)
}

// ============================================================================
// PROPERTY TAXES API
// ============================================================================

/**
 * Get all property taxes with property names
 * @param {number} taxYear - Optional year filter
 * @returns {Promise<Array>} Array of property tax objects
 */
export async function getPropertyTaxes(taxYear = null) {
  let query = supabase
    .from('property_taxes')
    .select(`
      *,
      properties (
        id,
        address
      )
    `)
    .order('tax_year', { ascending: false })
    .order('created_at', { ascending: false })

  if (taxYear) {
    query = query.eq('tax_year', taxYear)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

/**
 * Get distinct tax years from property_taxes
 * @returns {Promise<Array>} Array of years
 */
export async function getTaxYears() {
  const { data, error } = await supabase
    .from('property_taxes')
    .select('tax_year')
    .order('tax_year', { ascending: false })

  if (error) throw error

  // Get unique years
  const years = [...new Set(data.map(row => row.tax_year))]
  return years
}

/**
 * Get all properties with id and address for matching
 * @returns {Promise<Array>} Array of {id, address} objects
 */
export async function getPropertiesForMatching() {
  const { data, error } = await supabase
    .from('properties')
    .select('id, address')

  if (error) throw error
  return data || []
}

/**
 * Upsert property taxes (insert or update on conflict)
 * @param {Array} records - Array of property tax records
 * @returns {Promise<Object>} Result with inserted and updated counts
 */
export async function upsertPropertyTaxes(records) {
  const { data, error } = await supabase
    .from('property_taxes')
    .upsert(records, { onConflict: 'property_id,tax_year' })
    .select()

  if (error) throw error
  return data || []
}

// ============================================================================
// STATISTICS API
// ============================================================================

/**
 * Get dashboard statistics
 * @returns {Promise<Object>} Statistics object
 */
export async function getDashboardStats() {
  const { data, error } = await supabase
    .from('property_statistics')
    .select('*')
    .single()

  if (error) throw error

  return {
    total: data.total_properties || 0,
    completed: data.completed || 0,
    inProgress: data.in_progress || 0,
    notStarted: data.not_started || 0,
    completionRate: Math.round((data.completed / data.total_properties) * 100) || 0
  }
}

/**
 * Get property list for dropdown (simplified view)
 * @returns {Promise<Array>} Array of {id, name, address} objects
 */
export async function getPropertyList() {
  const { data, error } = await supabase
    .from('properties')
    .select('id, address')
    .order('address', { ascending: true })

  if (error) throw error
  return data || []
}

// ============================================================================
// REAL-TIME SUBSCRIPTIONS (Optional)
// ============================================================================

/**
 * Subscribe to property changes
 * @param {Function} callback - Callback function when data changes
 * @returns {Object} Subscription object
 */
export function subscribeToProperties(callback) {
  return supabase
    .channel('properties-changes')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'properties' },
      callback
    )
    .subscribe()
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Test database connection
 * @returns {Promise<boolean>} True if connected
 */
export async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('count')
      .limit(1)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

/**
 * Format currency values
 * @param {number} value
 * @returns {string} Formatted currency
 */
export function formatCurrency(value) {
  if (!value || isNaN(value)) return '$0'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

/**
 * Format date for display
 * @param {string|Date} dateValue
 * @returns {string} Formatted date
 */
export function formatDate(dateValue) {
  if (!dateValue) return ''
  const date = new Date(dateValue)
  if (isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Format date for input field (YYYY-MM-DD)
 * @param {string|Date} dateValue
 * @returns {string} Formatted date
 */
export function formatDateForInput(dateValue) {
  if (!dateValue) return ''
  const date = new Date(dateValue)
  if (isNaN(date.getTime())) return ''
  return date.toISOString().split('T')[0]
}
