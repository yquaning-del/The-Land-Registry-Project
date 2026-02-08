'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, MapPin, FileText, Loader2, CheckCircle, AlertTriangle, XCircle, Shield, Ban, Plus, Trash2 } from 'lucide-react'
import { verificationAgent, type VerificationResult } from '@/services/verificationAgent'
import { CollisionResult } from '@/services/spatialRegistry'

interface ClaimIntakeFormProps {
  onSubmit?: (formData: FormData) => Promise<void>
}

export function ClaimIntakeForm({ onSubmit }: ClaimIntakeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)
  
  // Collision detection state
  const [coordinates, setCoordinates] = useState<{ lat: string; lng: string }[]>([
    { lat: '', lng: '' },
    { lat: '', lng: '' },
    { lat: '', lng: '' },
  ])
  const [isCheckingCollision, setIsCheckingCollision] = useState(false)
  const [collisionResult, setCollisionResult] = useState<CollisionResult | null>(null)
  const [sellerName, setSellerName] = useState('')

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      setVerificationResult(null)
      
      // Trigger AI verification immediately
      await performVerification(file)
    }
  }

  const performVerification = async (file: File) => {
    setIsVerifying(true)
    try {
      const result = await verificationAgent.performDeepMatch(file)
      setVerificationResult(result)
    } catch (error) {
      console.error('Verification failed:', error)
      setVerificationResult({
        status: 'NEEDS_REVIEW',
        confidenceScore: 0,
        fraudConfidenceScore: 1,
        reasoning: ['Verification service unavailable - manual review required'],
        ocrResult: {
          grantorName: null,
          parcelId: null,
          documentDate: null,
          extractedText: '',
          confidence: 0,
        },
        fuzzyMatch: {
          matched: false,
          matchScore: 0,
          matchedRecord: null,
          matchType: 'NO_MATCH',
        },
        forgeryHeuristics: {
          nameMatch: { passed: false, score: 0, reason: 'Verification failed' },
          dateAnomaly: { passed: false, reason: 'Verification failed' },
          formattingCheck: { passed: false, suspiciousPatterns: [], reason: 'Verification failed' },
        },
        recommendation: 'System error - escalate to manual review',
        timestamp: new Date().toISOString(),
      })
    } finally {
      setIsVerifying(false)
    }
  }

  // Add coordinate point
  const addCoordinate = () => {
    setCoordinates([...coordinates, { lat: '', lng: '' }])
  }

  // Remove coordinate point
  const removeCoordinate = (index: number) => {
    if (coordinates.length > 3) {
      setCoordinates(coordinates.filter((_, i) => i !== index))
    }
  }

  // Update coordinate
  const updateCoordinate = (index: number, field: 'lat' | 'lng', value: string) => {
    const newCoords = [...coordinates]
    newCoords[index][field] = value
    setCoordinates(newCoords)
    // Reset collision result when coordinates change
    setCollisionResult(null)
  }

  // Check for coordinate collision
  const checkCollision = async () => {
    // Validate coordinates
    const validCoords = coordinates.filter(
      c => c.lat !== '' && c.lng !== '' && !isNaN(parseFloat(c.lat)) && !isNaN(parseFloat(c.lng))
    )

    if (validCoords.length < 3) {
      alert('Please enter at least 3 valid coordinate points to define the land boundary')
      return
    }

    setIsCheckingCollision(true)
    try {
      const coordsArray = validCoords.map(c => ({
        lat: parseFloat(c.lat),
        lng: parseFloat(c.lng),
      }))

      const response = await fetch('/api/spatial/collision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coordinates: coordsArray,
          sellerId: sellerName || verificationResult?.ocrResult?.grantorName || 'unknown',
        }),
      })

      const result = await response.json()
      setCollisionResult(result)
    } catch (error) {
      console.error('Collision check failed:', error)
      setCollisionResult({
        hasCollision: false,
        isBlocked: false,
        overlapPercentage: 0,
        conflictingClaims: [],
        message: 'Unable to check for collisions - please try again',
        alertLevel: 'NONE',
      })
    } finally {
      setIsCheckingCollision(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Block submission if collision detected and blocked
    if (collisionResult?.isBlocked) {
      alert('Cannot submit claim - coordinate collision detected. Please review the conflicting claims.')
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      
      // Add coordinates to form data
      const validCoords = coordinates.filter(
        c => c.lat !== '' && c.lng !== '' && !isNaN(parseFloat(c.lat)) && !isNaN(parseFloat(c.lng))
      )
      formData.set('polygonCoordinates', JSON.stringify(validCoords.map(c => ({
        lat: parseFloat(c.lat),
        lng: parseFloat(c.lng),
      }))))
      
      // Add collision check result
      if (collisionResult) {
        formData.set('collisionCheckResult', JSON.stringify(collisionResult))
      }
      
      if (onSubmit) {
        await onSubmit(formData)
      } else {
        console.log('Form submitted:', Object.fromEntries(formData))
        alert('Claim submitted successfully! (Demo mode)')
      }
    } catch (error) {
      console.error('Error submitting claim:', error)
      alert('Error submitting claim. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Submit Land Claim
        </CardTitle>
        <CardDescription>
          Upload your land documents and provide location details for AI verification
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="document">
              Land Document <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center gap-4">
              <Input
                id="document"
                name="document"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                required
                className="cursor-pointer"
              />
              <Upload className="h-5 w-5 text-muted-foreground" />
            </div>
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {selectedFile.name}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Accepted formats: PDF, JPG, PNG (Max 10MB)
            </p>

            {/* Real-time AI Verification Display */}
            {isVerifying && (
              <div className="mt-4 p-4 border border-blue-200 bg-blue-50 rounded-md">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    Running AI Deep Match Verification...
                  </span>
                </div>
                <p className="text-xs text-blue-700 mt-1">
                  Extracting text, matching records, and checking for forgery patterns
                </p>
              </div>
            )}

            {verificationResult && !isVerifying && (
              <div className={`mt-4 p-4 border rounded-md ${
                verificationResult.status === 'CLEAR' 
                  ? 'border-green-200 bg-green-50' 
                  : verificationResult.status === 'NEEDS_REVIEW'
                  ? 'border-yellow-200 bg-yellow-50'
                  : 'border-red-200 bg-red-50'
              }`}>
                <div className="flex items-start gap-3">
                  {verificationResult.status === 'CLEAR' && (
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  )}
                  {verificationResult.status === 'NEEDS_REVIEW' && (
                    <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  )}
                  {verificationResult.status === 'REJECTED' && (
                    <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`font-semibold ${
                        verificationResult.status === 'CLEAR' 
                          ? 'text-green-900' 
                          : verificationResult.status === 'NEEDS_REVIEW'
                          ? 'text-yellow-900'
                          : 'text-red-900'
                      }`}>
                        {verificationResult.status === 'CLEAR' && 'Document Verified ✓'}
                        {verificationResult.status === 'NEEDS_REVIEW' && 'Review Required'}
                        {verificationResult.status === 'REJECTED' && 'High Risk Detected'}
                      </h4>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <span className="text-sm font-bold">
                          {(verificationResult.confidenceScore * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 mb-3">
                      {verificationResult.reasoning.map((reason, idx) => (
                        <p key={idx} className={`text-xs ${
                          verificationResult.status === 'CLEAR' 
                            ? 'text-green-700' 
                            : verificationResult.status === 'NEEDS_REVIEW'
                            ? 'text-yellow-700'
                            : 'text-red-700'
                        }`}>
                          {reason}
                        </p>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-gray-200">
                      <p className={`text-xs font-medium ${
                        verificationResult.status === 'CLEAR' 
                          ? 'text-green-800' 
                          : verificationResult.status === 'NEEDS_REVIEW'
                          ? 'text-yellow-800'
                          : 'text-red-800'
                      }`}>
                        {verificationResult.recommendation}
                      </p>
                    </div>

                    {/* Extracted Information */}
                    {verificationResult.ocrResult.grantorName && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs font-semibold text-gray-700 mb-1">Extracted Information:</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {verificationResult.ocrResult.grantorName && (
                            <div>
                              <span className="text-gray-600">Grantor:</span>
                              <span className="ml-1 font-medium">{verificationResult.ocrResult.grantorName}</span>
                            </div>
                          )}
                          {verificationResult.ocrResult.parcelId && (
                            <div>
                              <span className="text-gray-600">Parcel ID:</span>
                              <span className="ml-1 font-medium">{verificationResult.ocrResult.parcelId}</span>
                            </div>
                          )}
                          {verificationResult.ocrResult.documentDate && (
                            <div>
                              <span className="text-gray-600">Date:</span>
                              <span className="ml-1 font-medium">{verificationResult.ocrResult.documentDate}</span>
                            </div>
                          )}
                          {verificationResult.fuzzyMatch.matched && verificationResult.fuzzyMatch.matchedRecord && (
                            <div>
                              <span className="text-gray-600">Match:</span>
                              <span className="ml-1 font-medium">
                                {verificationResult.fuzzyMatch.matchType} ({(verificationResult.fuzzyMatch.matchScore * 100).toFixed(0)}%)
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentType">
              Document Type <span className="text-red-500">*</span>
            </Label>
            <select
              id="documentType"
              name="documentType"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Select document type</option>
              <option value="land_title">Land Title Certificate</option>
              <option value="deed">Deed of Assignment</option>
              <option value="lease">Lease Agreement</option>
              <option value="customary">Customary Land Certificate</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Seller/Grantor Name */}
          <div className="space-y-2">
            <Label htmlFor="sellerName">
              Seller/Grantor Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="sellerName"
              name="sellerName"
              type="text"
              placeholder="e.g., Nana Kwame Asante"
              value={sellerName}
              onChange={(e) => setSellerName(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              The name of the person or authority selling/granting the land
            </p>
          </div>

          {/* Land Boundary Coordinates - Collision Detection */}
          <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-semibold">
                  Land Boundary Coordinates <span className="text-red-500">*</span>
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Enter GPS coordinates from your Survey Plan (minimum 3 points)
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCoordinate}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Point
              </Button>
            </div>

            <div className="space-y-2">
              {coordinates.map((coord, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500 w-6">
                    {index + 1}.
                  </span>
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      step="any"
                      placeholder="Latitude (e.g., 5.6037)"
                      value={coord.lat}
                      onChange={(e) => updateCoordinate(index, 'lat', e.target.value)}
                    />
                    <Input
                      type="number"
                      step="any"
                      placeholder="Longitude (e.g., -0.1870)"
                      value={coord.lng}
                      onChange={(e) => updateCoordinate(index, 'lng', e.target.value)}
                    />
                  </div>
                  {coordinates.length > 3 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCoordinate(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Collision Check Button */}
            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={checkCollision}
                disabled={isCheckingCollision}
                className="w-full"
              >
                {isCheckingCollision ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Checking for Overlapping Claims...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Check for Coordinate Collision
                  </>
                )}
              </Button>
            </div>

            {/* Collision Result Display */}
            {collisionResult && (
              <div className={`mt-3 p-4 rounded-lg border ${
                collisionResult.isBlocked
                  ? 'bg-red-50 border-red-300'
                  : collisionResult.hasCollision
                  ? 'bg-yellow-50 border-yellow-300'
                  : 'bg-green-50 border-green-300'
              }`}>
                <div className="flex items-start gap-3">
                  {collisionResult.isBlocked ? (
                    <Ban className="h-6 w-6 text-red-600 flex-shrink-0" />
                  ) : collisionResult.hasCollision ? (
                    <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0" />
                  ) : (
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                  )}
                  
                  <div className="flex-1">
                    <h4 className={`font-semibold ${
                      collisionResult.isBlocked
                        ? 'text-red-900'
                        : collisionResult.hasCollision
                        ? 'text-yellow-900'
                        : 'text-green-900'
                    }`}>
                      {collisionResult.isBlocked
                        ? '🚫 Transaction Blocked - Potential Double-Sale'
                        : collisionResult.hasCollision
                        ? '⚠️ Overlap Detected - Flagged for Review'
                        : '✓ No Collision - Coordinates are Unique'}
                    </h4>
                    
                    <p className={`text-sm mt-1 ${
                      collisionResult.isBlocked
                        ? 'text-red-700'
                        : collisionResult.hasCollision
                        ? 'text-yellow-700'
                        : 'text-green-700'
                    }`}>
                      {collisionResult.message}
                    </p>

                    {/* Conflicting Claims List */}
                    {collisionResult.conflictingClaims.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs font-semibold text-gray-700 mb-2">
                          Conflicting Claims ({collisionResult.conflictingClaims.length}):
                        </p>
                        <div className="space-y-2">
                          {collisionResult.conflictingClaims.slice(0, 3).map((claim, idx) => (
                            <div key={idx} className="text-xs bg-white p-2 rounded border">
                              <div className="flex justify-between">
                                <span className="font-medium">
                                  {claim.sellerName || 'Unknown Seller'}
                                </span>
                                <span className={`font-bold ${
                                  claim.overlapPercentage >= 50 ? 'text-red-600' : 'text-yellow-600'
                                }`}>
                                  {claim.overlapPercentage.toFixed(1)}% overlap
                                </span>
                              </div>
                              <div className="text-gray-500 mt-1">
                                Claimed: {new Date(claim.claimDate).toLocaleDateString()}
                                {' • '}
                                {claim.overlapAreaSqm.toFixed(0)} sqm
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="landSize">Land Size (sq meters)</Label>
            <Input
              id="landSize"
              name="landSize"
              type="number"
              step="0.01"
              placeholder="e.g., 1000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Physical Address</Label>
            <Input
              id="address"
              name="address"
              type="text"
              placeholder="e.g., Plot 123, Main Street"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="region">
                Region <span className="text-red-500">*</span>
              </Label>
              <select
                id="region"
                name="region"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Select region</option>
                <option value="Greater Accra">Greater Accra</option>
                <option value="Ashanti">Ashanti</option>
                <option value="Western">Western</option>
                <option value="Eastern">Eastern</option>
                <option value="Central">Central</option>
                <option value="Northern">Northern</option>
                <option value="Upper East">Upper East</option>
                <option value="Upper West">Upper West</option>
                <option value="Volta">Volta</option>
                <option value="Bono">Bono</option>
                <option value="Lagos">Lagos (Nigeria)</option>
                <option value="Abuja">Abuja (Nigeria)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">
                Country <span className="text-red-500">*</span>
              </Label>
              <select
                id="country"
                name="country"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="Ghana">Ghana</option>
                <option value="Nigeria">Nigeria</option>
              </select>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm text-blue-800">
              <strong>What happens next?</strong>
              <br />
              Your claim will be verified by our AI system which analyzes your documents 
              and cross-references with satellite data. You'll receive a confidence score 
              and status update within minutes.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting Claim...
              </>
            ) : (
              'Submit Land Claim'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
