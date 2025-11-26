
import React, { useState, useRef } from 'react';
import { Upload, MapPin, DollarSign, ArrowRight, Loader2, Sparkles, CheckCircle2, Truck, ShieldCheck, AlertCircle, Package } from 'lucide-react';
import { Job, VehicleType, AIAnalysisResult } from '../types';
import { analyzeItemImage } from '../services/geminiService';

interface RequestFlowProps {
  onJobCreated: (job: Job) => void;
}

const SERVICE_FEE_PERCENTAGE = 0.15;

const RequestFlow: React.FC<RequestFlowProps> = ({ onJobCreated }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    pickup: string;
    dropoff: string;
    distance: number;
    price: number;
    vehicleType: VehicleType;
    handlingInstructions: string;
    fragility: string;
  }>({
    title: '',
    description: '',
    pickup: '',
    dropoff: '',
    distance: 5, // Default mock distance
    price: 0,
    vehicleType: VehicleType.PICKUP,
    handlingInstructions: '',
    fragility: ''
  });

  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);

  const driverPay = formData.price;
  const platformFee = Math.round(driverPay * SERVICE_FEE_PERCENTAGE);
  const totalCost = driverPay + platformFee;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const result = await analyzeItemImage(imagePreview, formData.description, formData.distance);
      setAiAnalysis(result);
      setFormData(prev => ({
        ...prev,
        price: result.suggestedPrice,
        vehicleType: result.vehicleType
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newJob: Job = {
      id: Date.now().toString(),
      title: formData.title || "Marketplace Item",
      description: formData.description,
      pickupLocation: formData.pickup,
      dropoffLocation: formData.dropoff,
      status: 'pending',
      price: driverPay,
      platformFee: platformFee,
      vehicleType: formData.vehicleType,
      imageUrl: imagePreview || undefined,
      createdAt: Date.now(),
      distanceMiles: formData.distance,
      aiAnalysis: aiAnalysis?.reasoning,
      driverConfirmed: false,
      requesterConfirmed: false,
      handlingInstructions: formData.handlingInstructions,
      fragility: formData.fragility
    };
    onJobCreated(newJob);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-slate-900">Schedule a Pickup</h2>
        <p className="text-slate-500 mt-2">Get that free couch home without scratching your sedan.</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
        
        {/* Progress Bar */}
        <div className="bg-slate-50 border-b border-slate-100 p-4 flex justify-between items-center">
          <div className={`flex items-center ${step >= 1 ? 'text-emerald-600' : 'text-slate-400'}`}>
            <span className="font-bold mr-2">1.</span> Details
          </div>
          <div className="h-px bg-slate-200 flex-1 mx-4"></div>
          <div className={`flex items-center ${step >= 2 ? 'text-emerald-600' : 'text-slate-400'}`}>
            <span className="font-bold mr-2">2.</span> AI Analysis
          </div>
          <div className="h-px bg-slate-200 flex-1 mx-4"></div>
          <div className={`flex items-center ${step >= 3 ? 'text-emerald-600' : 'text-slate-400'}`}>
            <span className="font-bold mr-2">3.</span> Confirm
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">What did you find?</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Vintage Leather Sectional"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                  required
                  placeholder="Is it heavy? Dimensions? Stairs involved?"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none h-24"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Item Fragility (Optional)</label>
                    <div className="relative">
                        <Package className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="e.g. Delicate, Sturdy, Glass"
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            value={formData.fragility}
                            onChange={e => setFormData({...formData, fragility: e.target.value})}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Handling Instructions (Optional)</label>
                    <div className="relative">
                        <AlertCircle className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="e.g. Needs straps, 2 people required"
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            value={formData.handlingInstructions}
                            onChange={e => setFormData({...formData, handlingInstructions: e.target.value})}
                        />
                    </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Locations</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                    <input 
                      type="text" 
                      required
                      placeholder="Pickup Address"
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      value={formData.pickup}
                      onChange={e => setFormData({...formData, pickup: e.target.value})}
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-emerald-600" />
                    <input 
                      type="text" 
                      required
                      placeholder="Dropoff Address"
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      value={formData.dropoff}
                      onChange={e => setFormData({...formData, dropoff: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Upload Photo (Optional but Recommended)</label>
                <div 
                  className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="h-40 object-contain rounded-md" />
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-slate-400 mb-2" />
                      <p className="text-sm text-slate-500">Click to upload image of the item</p>
                    </>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>

              <button 
                type="button"
                onClick={async () => {
                    await runAnalysis();
                    setStep(2);
                }}
                disabled={!formData.title || !formData.description || loading}
                className="w-full bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2 h-4 w-4 text-emerald-400" />}
                {loading ? 'Analyzing...' : 'Analyze & Estimate'}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
               {aiAnalysis && (
                 <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg">
                    <div className="flex items-start">
                        <Sparkles className="h-6 w-6 text-indigo-600 mt-1 flex-shrink-0 mr-3" />
                        <div>
                            <h3 className="font-semibold text-indigo-900">AI Analysis & Handling Advice</h3>
                            <p className="text-sm text-indigo-700 mt-1">{aiAnalysis.reasoning}</p>
                            <div className="mt-3 flex gap-2 flex-wrap">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                    Weight: ~{aiAnalysis.estimatedWeightLb} lbs
                                </span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                    Difficulty: {aiAnalysis.difficultyScore}/10
                                </span>
                            </div>
                        </div>
                    </div>
                 </div>
               )}

               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Recommended Vehicle</label>
                 <select 
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({...formData, vehicleType: e.target.value as VehicleType})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                 >
                    {Object.values(VehicleType).map(v => (
                        <option key={v} value={v}>{v}</option>
                    ))}
                 </select>
               </div>

               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Driver Offer ($)</label>
                 <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                    <input 
                      type="number" 
                      required
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: parseInt(e.target.value) || 0})}
                    />
                 </div>
                 <p className="text-xs text-slate-500 mt-1">Suggested based on analysis: ${aiAnalysis?.suggestedPrice || 50}</p>
               </div>
               
               <div className="bg-slate-50 p-4 rounded-lg space-y-2 border border-slate-100">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Driver Pay:</span>
                    <span>${driverPay}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>HaulHelper Fee ({SERVICE_FEE_PERCENTAGE * 100}%):</span>
                    <span>${platformFee}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900">
                    <span>Total Cost:</span>
                    <span>${totalCost}</span>
                  </div>
               </div>

               <div className="flex space-x-3">
                   <button 
                    type="button" 
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 border border-slate-300 rounded-lg font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                   >
                       Back
                   </button>
                   <button 
                    type="button" 
                    onClick={() => setStep(3)}
                    className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                   >
                       Next: Review
                   </button>
               </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
                <div className="bg-slate-50 p-6 rounded-lg space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-lg text-slate-900">{formData.title}</h3>
                            <p className="text-sm text-slate-600">{formData.description}</p>
                        </div>
                        <div className="text-right">
                            <span className="block text-2xl font-bold text-emerald-600">${totalCost}</span>
                            <span className="text-xs text-slate-500">Total</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {formData.fragility && (
                            <div className="bg-blue-50 p-3 rounded-lg flex items-start border border-blue-100">
                                <Package className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-blue-800 uppercase tracking-wide">Fragility</p>
                                    <p className="text-sm text-blue-900">{formData.fragility}</p>
                                </div>
                            </div>
                        )}
                        {formData.handlingInstructions && (
                            <div className="bg-orange-50 p-3 rounded-lg flex items-start border border-orange-100">
                                <AlertCircle className="h-5 w-5 text-orange-600 mr-2 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-orange-800 uppercase tracking-wide">Handling</p>
                                    <p className="text-sm text-orange-900">{formData.handlingInstructions}</p>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="border-t border-slate-200 pt-4 space-y-2">
                        <div className="flex items-center text-sm text-slate-700">
                            <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                            <span className="font-medium mr-2">From:</span> {formData.pickup}
                        </div>
                        <div className="flex items-center text-sm text-slate-700">
                            <MapPin className="h-4 w-4 mr-2 text-emerald-600" />
                            <span className="font-medium mr-2">To:</span> {formData.dropoff}
                        </div>
                        <div className="flex items-center text-sm text-slate-700">
                            <Truck className="h-4 w-4 mr-2 text-blue-500" />
                            <span className="font-medium mr-2">Req:</span> {formData.vehicleType}
                        </div>
                    </div>

                    <div className="bg-emerald-50 p-3 rounded-lg flex items-start mt-2">
                        <ShieldCheck className="h-5 w-5 text-emerald-600 mr-2 flex-shrink-0" />
                        <p className="text-xs text-emerald-800">
                            Funds will be held securely in escrow. Payment is released to the driver only after both parties confirm the delivery is complete.
                        </p>
                    </div>
                </div>

                <button 
                    type="submit"
                    className="w-full bg-emerald-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all flex items-center justify-center"
                >
                    <CheckCircle2 className="mr-2" />
                    Confirm & Pay into Escrow
                </button>
            </div>
          )}
          
        </form>
      </div>
    </div>
  );
};

export default RequestFlow;
