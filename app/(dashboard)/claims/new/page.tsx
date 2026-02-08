'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Upload, ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function NewClaimPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    parcel_id: '',
    owner_name: '',
    location: '',
    coordinates: '',
    description: '',
  })
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB')
        return
      }
      if (!selectedFile.type.includes('pdf') && !selectedFile.type.includes('image')) {
        setError('File must be a PDF or image')
        return
      }
      setFile(selectedFile)
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('Please upload a document')
      return
    }

    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Upload file to Supabase Storage
      const fileName = `${user.id}/${Date.now()}-${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('land-documents')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('land-documents')
        .getPublicUrl(fileName)

      // Create claim record
      const { data: claimData, error: claimError } = await supabase
        .from('land_claims')
        .insert({
          user_id: user.id,
          parcel_id: formData.parcel_id,
          owner_name: formData.owner_name,
          location: formData.location,
          coordinates: formData.coordinates,
          description: formData.description,
          original_document_url: publicUrl,
          verification_status: 'PENDING',
        })
        .select()
        .single()

      if (claimError) throw claimError

      // Redirect to claims page
      router.push('/dashboard/claims')
    } catch (error) {
      console.error('Error creating claim:', error)
      setError(error instanceof Error ? error.message : 'Failed to create claim')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

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
          <p className="text-gray-600">Upload your land title document for AI verification</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Land Title Information</CardTitle>
            <CardDescription>
              Please provide accurate information about your land title document
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Document Upload */}
              <div>
                <Label htmlFor="document">Land Title Document *</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    id="document"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="document" className="cursor-pointer">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900">
                      {file ? file.name : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-sm text-gray-500">
                      PDF, JPG, PNG up to 10MB
                    </p>
                  </label>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="parcel_id">Parcel ID *</Label>
                  <Input
                    id="parcel_id"
                    name="parcel_id"
                    value={formData.parcel_id}
                    onChange={handleInputChange}
                    placeholder="e.g., GA/2024/0001234"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="owner_name">Owner Name *</Label>
                  <Input
                    id="owner_name"
                    name="owner_name"
                    value={formData.owner_name}
                    onChange={handleInputChange}
                    placeholder="e.g., Kwame Mensah"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Plot 45, East Legon, Accra"
                  required
                />
              </div>

              <div>
                <Label htmlFor="coordinates">GPS Coordinates</Label>
                <Input
                  id="coordinates"
                  name="coordinates"
                  value={formData.coordinates}
                  onChange={handleInputChange}
                  placeholder="e.g., 5.6037° N, 0.1870° W"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Additional information about the land title..."
                  rows={4}
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
                  disabled={loading}
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
