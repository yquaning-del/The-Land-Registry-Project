'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Upload, ArrowLeft, CheckCircle, FileText, ScrollText } from 'lucide-react'
import Link from 'next/link'

type DocumentCategory = 'LAND_TITLE' | 'INDENTURE'

const TITLE_SUB_TYPES: Record<DocumentCategory, { value: string; label: string }[]> = {
  LAND_TITLE: [
    { value: 'CERTIFICATE_OF_OCCUPANCY', label: 'Certificate of Occupancy' },
    { value: 'FREEHOLD', label: 'Freehold' },
    { value: 'LEASEHOLD', label: 'Leasehold' },
    { value: 'GOVERNOR_CONSENT', label: "Governor's Consent (Nigeria)" },
    { value: 'DEED_OF_ASSIGNMENT', label: 'Deed of Assignment' },
  ],
  INDENTURE: [
    { value: 'STOOL_INDENTURE', label: 'Stool Indenture' },
    { value: 'FAMILY_INDENTURE', label: 'Family Indenture' },
    { value: 'CUSTOMARY_FREEHOLD', label: 'Customary Freehold' },
  ],
}

const GRANTOR_TYPES = [
  { value: 'STOOL', label: 'Stool' },
  { value: 'FAMILY', label: 'Family' },
  { value: 'INDIVIDUAL', label: 'Individual' },
  { value: 'TRADITIONAL_AUTHORITY', label: 'Traditional Authority' },
  { value: 'STATE', label: 'State / Government' },
  { value: 'CORPORATE', label: 'Corporate' },
]

export default function NewClaimPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [documentCategory, setDocumentCategory] = useState<DocumentCategory | ''>('')
  const [formData, setFormData] = useState({
    title_type: '',
    parcel_id: '',
    owner_name: '',
    location: '',
    coordinates: '',
    description: '',
    region: '',
    district: '',
    grantor_type: '',
    traditional_authority_name: '',
    family_head_name: '',
    stool_land_reference: '',
    surveyor_name: '',
    surveyor_license_number: '',
    survey_date: '',
    land_size: '',
    document_serial_number: '',
    lands_commission_file_number: '',
    duration_years: '',
  })
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const handleSelectedFile = useCallback((selectedFile: File) => {
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }
    if (!selectedFile.type.includes('pdf') && !selectedFile.type.includes('image')) {
      setError('File must be a PDF or image')
      return
    }
    setFile(selectedFile)
    setError('')
  }, [])

  const fillFromExtractedText = useCallback((text: string) => {
    const getFirstMatch = (patterns: RegExp[]) => {
      for (const p of patterns) {
        const m = text.match(p)
        if (m?.[1]) return m[1].trim()
      }
      return ''
    }

    const parcel = getFirstMatch([
      /Parcel\s*ID\s*[:#]?\s*([A-Z]{2,}\/?\d{3,}(?:\/\d+)*)/i,
      /Parcel\s*ID\s*[:#]?\s*([A-Z]{2}\d{8,12})/i,
      /Serial\s*Number\s*[:#]?\s*([A-Z0-9\/-]{6,})/i,
    ])

    const owner = getFirstMatch([
      /FOR\s*:\s*([A-Z][A-Za-z\s.'-]{2,})/,
      /This\s+is\s+to\s+certify\s+that\s+([A-Z][A-Za-z\s.'-]{2,})/i,
      /Grantee\s*[:#]?\s*([A-Z][A-Za-z\s.'-]{2,})/i,
      /Owner\s*Name\s*[:#]?\s*([A-Z][A-Za-z\s.'-]{2,})/i,
    ])

    const locality = getFirstMatch([
      /LOCALITY\s*[:\n]+\s*([A-Za-z\s.'-]{2,})/i,
      /Location\s*[:#]?\s*([^\n]{5,120})/i,
      /Address\s*[:#]?\s*([^\n]{5,120})/i,
    ])

    const region = getFirstMatch([
      /REGION\s*[:\n]+\s*([A-Za-z\s.'-]{2,})/i,
    ])

    const district = getFirstMatch([
      /DISTRICT\s*[:\n]+\s*([A-Za-z\s.'-]{2,})/i,
    ])

    const surveyorName = getFirstMatch([
      /I\s*,\s*([A-Z][A-Za-z\s.'-]{2,})\s*,\s*Licensed?\s*[Ss]urveyor/i,
      /Surveyor\s*[:#]?\s*([A-Z][A-Za-z\s.'-]{2,})/i,
    ])

    const surveyorLicense = getFirstMatch([
      /LICENSED\s*SURVEYOR\s*(?:No\.?|Number)\s*[:#]?\s*(\d{2,})/i,
      /Surveyor\s*(?:License|Licence)\s*(?:No\.?|Number)\s*[:#]?\s*([A-Z0-9\/-]{2,})/i,
    ])

    const surveyDate = getFirstMatch([
      /Date\s*[.:]?\s*(\d{1,2}\s*[-/.]\s*\d{1,2}\s*[-/.]\s*\d{4})/i,
      /Date\s+of\s+Issue\s*[:#]?\s*(\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+\s+\d{4})/i,
    ])

    const landSize = getFirstMatch([
      /Area\s*[=:#]?\s*([\d.]+)\s*Acre/i,
      /Area\s*[=:#]?\s*([\d.]+)\s*(?:sq\.?\s*m|sqm|m2)/i,
      /(\d+(?:\.\d+)?)\s*(?:Acre|Hectare|sqm)/i,
    ])

    let coords = ''
    const coordMatch = text.match(/(\-?\d{1,2}\.\d{3,})\s*,\s*(\-?\d{1,3}\.\d{3,})/)
    if (coordMatch?.[1] && coordMatch?.[2]) {
      coords = `${coordMatch[1]}, ${coordMatch[2]}`
    }

    const isIndenture = /PLAN\s+OF\s+LAND|INDENTURE|Licensed?\s+[Ss]urveyor/i.test(text)
    if (isIndenture && !documentCategory) {
      setDocumentCategory('INDENTURE')
    }

    const isCertificate = /CERTIFICATE\s+OF\s+OCCUPANCY|LANDS?\s+COMMISSION|FREEHOLD/i.test(text)
    if (isCertificate && !documentCategory) {
      setDocumentCategory('LAND_TITLE')
    }

    setFormData(prev => ({
      ...prev,
      parcel_id: prev.parcel_id || parcel,
      owner_name: prev.owner_name || owner,
      location: prev.location || locality,
      coordinates: prev.coordinates || coords,
      region: prev.region || region,
      district: prev.district || district,
      surveyor_name: prev.surveyor_name || surveyorName,
      surveyor_license_number: prev.surveyor_license_number || surveyorLicense,
      survey_date: prev.survey_date || surveyDate,
      land_size: prev.land_size || landSize,
    }))
  }, [documentCategory])

  const handleAutoFill = useCallback(async () => {
    if (!file) {
      setError('Please upload a document first')
      return
    }

    if (file.type.includes('pdf')) {
      setError('Auto-fill currently supports JPG/PNG images (PDF extraction not enabled yet)')
      return
    }

    setExtracting(true)
    setError('')

    try {
      const imageDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve((e.target?.result as string) || '')
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsDataURL(file)
      })

      const res = await fetch('/api/ocr/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageDataUrl }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text)
      }

      const data = (await res.json()) as { text?: string }
      fillFromExtractedText(data.text || '')
    } catch (e: any) {
      setError(e?.message || 'Auto-fill failed')
    } finally {
      setExtracting(false)
    }
  }, [file, fillFromExtractedText])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleSelectedFile(selectedFile)
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      handleSelectedFile(droppedFile)
    }
  }, [handleSelectedFile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('Please upload a document')
      return
    }
    if (!documentCategory) {
      setError('Please select a document category (Land Title or Indenture)')
      return
    }
    if (!validateForm()) return

    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('User not authenticated')
      }

      const coordText = formData.coordinates.trim()
      const parts = coordText
        .replace(/°/g, '')
        .replace(/[NSEW]/gi, '')
        .split(/[,\s]+/)
        .filter(Boolean)
      if (parts.length < 2 || Number.isNaN(Number(parts[0])) || Number.isNaN(Number(parts[1]))) {
        setFormErrors(prev => ({ ...prev, coordinates: 'Invalid format. Use "lat, lng" (e.g., "5.6037, -0.1870")' }))
        return
      }
      const lat = Number(parts[0])
      const lng = Number(parts[1])

      let publicUrl: string

      try {
        const uploadForm = new FormData()
        uploadForm.append('file', file)
        const res = await fetch('/api/uploads/land-document', {
          method: 'POST',
          body: uploadForm,
        })

        if (!res.ok) {
          const text = await res.text()
          throw new Error(text)
        }

        const json = (await res.json()) as { pinataUrl?: string }
        if (!json.pinataUrl) {
          throw new Error('Upload failed: missing pinataUrl')
        }
        publicUrl = json.pinataUrl
      } catch (e: any) {
        throw new Error(`Document upload failed. ${e?.message || 'Unknown error'}`)
      }

      const landSizeSqm = formData.land_size
        ? (formData.land_size.toLowerCase().includes('acre')
            ? parseFloat(formData.land_size) * 4046.86
            : parseFloat(formData.land_size)) || null
        : null

      const insertPayload: Record<string, any> = {
        claimant_id: user.id,
        original_document_url: publicUrl,
        document_type: documentCategory,
        title_type: formData.title_type || null,
        gps_coordinates: `(${lng},${lat})`,
        latitude: lat,
        longitude: lng,
        address: formData.location,
        region: formData.region || null,
        land_size_sqm: landSizeSqm,
        document_metadata: {
          parcelId: formData.parcel_id,
          ownerName: formData.owner_name,
          description: formData.description,
          district: formData.district,
          documentCategory,
        },
      }

      if (documentCategory === 'INDENTURE') {
        insertPayload.grantor_type = formData.grantor_type || null
        insertPayload.traditional_authority_name = formData.traditional_authority_name || null
        insertPayload.family_head_name = formData.family_head_name || null
        insertPayload.stool_land_reference = formData.stool_land_reference || null
        insertPayload.surveyor_license_number = formData.surveyor_license_number || null
        insertPayload.survey_date = formData.survey_date || null
        if (formData.surveyor_name) {
          insertPayload.document_metadata.surveyorName = formData.surveyor_name
        }
      }

      if (documentCategory === 'LAND_TITLE') {
        insertPayload.document_serial_number = formData.document_serial_number || null
        insertPayload.lands_commission_file_number = formData.lands_commission_file_number || null
        insertPayload.duration_years = formData.duration_years ? parseInt(formData.duration_years, 10) : null
      }

      const { error: claimError } = await supabase
        .from('land_claims')
        .insert(insertPayload)
        .select()
        .single()

      if (claimError) throw claimError

      router.push('/dashboard/claims')
    } catch (error) {
      console.error('Error creating claim:', error)
      setError(error instanceof Error ? error.message : 'Failed to create claim')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (formErrors[name]) {
      setFormErrors(prev => { const next = { ...prev }; delete next[name]; return next })
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    if (!formData.owner_name.trim()) errors.owner_name = 'Owner name is required'
    if (!formData.location.trim()) errors.location = 'Locality / address is required'
    if (documentCategory && !formData.title_type) errors.title_type = 'Please select a title type'
    if (!formData.coordinates.trim()) errors.coordinates = 'GPS coordinates are required'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const isIndenture = documentCategory === 'INDENTURE'
  const isLandTitle = documentCategory === 'LAND_TITLE'

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/claims" className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Claims
          </Link>
          <h1 className="text-4xl font-bold text-navy-900 mb-2">Submit New Claim</h1>
          <p className="text-gray-600">Upload your land document for AI verification</p>
        </div>

        {/* Document Category Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            type="button"
            onClick={() => { setDocumentCategory('LAND_TITLE'); setFormData(prev => ({ ...prev, title_type: '' })) }}
            className={
              `relative flex items-start gap-4 rounded-xl border-2 p-5 text-left transition-all ` +
              (isLandTitle
                ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500'
                : 'border-gray-200 hover:border-gray-300 bg-white')
            }
          >
            <div className={`rounded-lg p-2 ${isLandTitle ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">Land Title / Certificate</div>
              <div className="text-sm text-gray-500 mt-1">
                Government-issued certificate of occupancy, freehold, leasehold, or deed of assignment
              </div>
            </div>
            {isLandTitle && (
              <div className="absolute top-3 right-3">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              </div>
            )}
          </button>

          <button
            type="button"
            onClick={() => { setDocumentCategory('INDENTURE'); setFormData(prev => ({ ...prev, title_type: '' })) }}
            className={
              `relative flex items-start gap-4 rounded-xl border-2 p-5 text-left transition-all ` +
              (isIndenture
                ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500'
                : 'border-gray-200 hover:border-gray-300 bg-white')
            }
          >
            <div className={`rounded-lg p-2 ${isIndenture ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
              <ScrollText className="h-6 w-6" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">Indenture</div>
              <div className="text-sm text-gray-500 mt-1">
                Stool or family indenture with survey plan, grantor details, and traditional authority consent
              </div>
            </div>
            {isIndenture && (
              <div className="absolute top-3 right-3">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              </div>
            )}
          </button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {isIndenture ? 'Indenture Information' : isLandTitle ? 'Land Title Information' : 'Document Information'}
            </CardTitle>
            <CardDescription>
              {isIndenture
                ? 'Provide details from your indenture and survey plan'
                : isLandTitle
                  ? 'Provide details from your government-issued land title'
                  : 'Select a document category above, then fill in the details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Document Upload */}
              <div>
                <Label htmlFor="document">Document Upload *</Label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={
                    `mt-2 relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ` +
                    (isDragging
                      ? 'border-emerald-500 bg-emerald-50/50'
                      : 'border-gray-300 hover:border-gray-400')
                  }
                >
                  <input
                    id="document"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="pointer-events-none">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900">
                      {file ? file.name : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-sm text-gray-500">
                      PDF, JPG, PNG up to 10MB
                    </p>
                  </div>
                </div>

                {file && (
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="text-sm text-gray-600 truncate">
                      {file.name} • {(file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={extracting}
                      onClick={handleAutoFill}
                    >
                      {extracting ? 'Extracting...' : 'Auto-fill from document'}
                    </Button>
                  </div>
                )}
              </div>

              {/* Title Sub-Type */}
              {documentCategory && (
                <div>
                  <Label htmlFor="title_type">Title Type *</Label>
                  <select
                    id="title_type"
                    name="title_type"
                    value={formData.title_type}
                    onChange={handleInputChange}
                    required
                    className={`mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 ${formErrors.title_type ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'}`}
                  >
                    <option value="">Select type...</option>
                    {TITLE_SUB_TYPES[documentCategory].map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  {formErrors.title_type && <p className="mt-1 text-xs text-red-600">{formErrors.title_type}</p>}
                </div>
              )}

              {/* Common Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="parcel_id">Parcel ID</Label>
                  <Input
                    id="parcel_id"
                    name="parcel_id"
                    value={formData.parcel_id}
                    onChange={handleInputChange}
                    placeholder="e.g., GA/2024/0001234"
                  />
                </div>
                <div>
                  <Label htmlFor="owner_name">Owner / Grantee Name *</Label>
                  <Input
                    id="owner_name"
                    name="owner_name"
                    value={formData.owner_name}
                    onChange={handleInputChange}
                    placeholder="e.g., Yaw Quaning"
                    required
                    className={formErrors.owner_name ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''}
                  />
                  {formErrors.owner_name && <p className="mt-1 text-xs text-red-600">{formErrors.owner_name}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="location">Locality / Address *</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder={isIndenture ? 'e.g., Adumanya' : 'e.g., Plot 45, East Legon, Accra'}
                    required
                    className={formErrors.location ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''}
                  />
                  {formErrors.location && <p className="mt-1 text-xs text-red-600">{formErrors.location}</p>}
                </div>
                <div>
                  <Label htmlFor="district">District</Label>
                  <Input
                    id="district"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    placeholder="e.g., Soda"
                  />
                </div>
                <div>
                  <Label htmlFor="region">Region</Label>
                  <Input
                    id="region"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    placeholder="e.g., Greater Accra"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="coordinates">GPS Coordinates *</Label>
                  <Input
                    id="coordinates"
                    name="coordinates"
                    value={formData.coordinates}
                    onChange={handleInputChange}
                    placeholder="e.g., 5.6037, -0.1870"
                    required
                    className={formErrors.coordinates ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''}
                  />
                  {formErrors.coordinates && <p className="mt-1 text-xs text-red-600">{formErrors.coordinates}</p>}
                </div>
                <div>
                  <Label htmlFor="land_size">Land Size (Acres or sqm)</Label>
                  <Input
                    id="land_size"
                    name="land_size"
                    value={formData.land_size}
                    onChange={handleInputChange}
                    placeholder="e.g., 0.193 Acre"
                  />
                </div>
              </div>

              {/* Indenture-Specific Fields */}
              {isIndenture && (
                <div className="space-y-4 border-t pt-6">
                  <h3 className="font-semibold text-gray-900">Grantor & Survey Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="grantor_type">Grantor Type</Label>
                      <select
                        id="grantor_type"
                        name="grantor_type"
                        value={formData.grantor_type}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="">Select grantor type...</option>
                        {GRANTOR_TYPES.map(g => (
                          <option key={g.value} value={g.value}>{g.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="traditional_authority_name">Grantor / Traditional Authority Name</Label>
                      <Input
                        id="traditional_authority_name"
                        name="traditional_authority_name"
                        value={formData.traditional_authority_name}
                        onChange={handleInputChange}
                        placeholder="e.g., Nii Adjei Kojo II"
                      />
                    </div>
                  </div>

                  {(formData.grantor_type === 'FAMILY' || formData.grantor_type === '') && (
                    <div>
                      <Label htmlFor="family_head_name">Family Head Name</Label>
                      <Input
                        id="family_head_name"
                        name="family_head_name"
                        value={formData.family_head_name}
                        onChange={handleInputChange}
                        placeholder="e.g., Nana Ama Serwaa"
                      />
                    </div>
                  )}

                  {(formData.grantor_type === 'STOOL' || formData.grantor_type === '') && (
                    <div>
                      <Label htmlFor="stool_land_reference">Stool Land Reference</Label>
                      <Input
                        id="stool_land_reference"
                        name="stool_land_reference"
                        value={formData.stool_land_reference}
                        onChange={handleInputChange}
                        placeholder="e.g., Osu Stool Lands"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="surveyor_name">Surveyor Name</Label>
                      <Input
                        id="surveyor_name"
                        name="surveyor_name"
                        value={formData.surveyor_name}
                        onChange={handleInputChange}
                        placeholder="e.g., Cyril Gadegbeku"
                      />
                    </div>
                    <div>
                      <Label htmlFor="surveyor_license_number">Surveyor License No.</Label>
                      <Input
                        id="surveyor_license_number"
                        name="surveyor_license_number"
                        value={formData.surveyor_license_number}
                        onChange={handleInputChange}
                        placeholder="e.g., 360"
                      />
                    </div>
                    <div>
                      <Label htmlFor="survey_date">Survey Date</Label>
                      <Input
                        id="survey_date"
                        name="survey_date"
                        type="date"
                        value={formData.survey_date}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Land Title-Specific Fields */}
              {isLandTitle && (
                <div className="space-y-4 border-t pt-6">
                  <h3 className="font-semibold text-gray-900">Title Certificate Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="document_serial_number">Document Serial / Stamp Number</Label>
                      <Input
                        id="document_serial_number"
                        name="document_serial_number"
                        value={formData.document_serial_number}
                        onChange={handleInputChange}
                        placeholder="e.g., GLC/2026/001234"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lands_commission_file_number">Lands Commission File No.</Label>
                      <Input
                        id="lands_commission_file_number"
                        name="lands_commission_file_number"
                        value={formData.lands_commission_file_number}
                        onChange={handleInputChange}
                        placeholder="e.g., LC/GA/2024/5678"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="duration_years">Duration (Years)</Label>
                    <Input
                      id="duration_years"
                      name="duration_years"
                      type="number"
                      min="1"
                      max="999"
                      value={formData.duration_years}
                      onChange={handleInputChange}
                      placeholder="e.g., 99"
                    />
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <Label htmlFor="description">Additional Notes</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Any additional information about this document..."
                  rows={3}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-4">
                <Link href="/dashboard/claims">
                  <Button variant="outline" disabled={loading}>
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={loading || !documentCategory}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Submit Claim
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
