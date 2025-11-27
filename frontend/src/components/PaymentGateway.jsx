import React, { useState } from 'react'
import { CreditCard, Smartphone, Shield, CheckCircle, ArrowLeft } from 'lucide-react'

export default function PaymentGateway({ bookingData, onPaymentSuccess, onBack }) {
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    holderName: ''
  })
  const [upiId, setUpiId] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePayment = async (e) => {
    e.preventDefault()
    setIsProcessing(true)
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      onPaymentSuccess({
        ...bookingData,
        paymentId: 'PAY_' + Date.now(),
        paymentMethod,
        status: 'paid',
        paidAt: new Date().toISOString()
      })
    }, 2000)
  }

  return (
    <div className="max-w-2xl mx-auto">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors font-medium shadow-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Booking
        </button>
      )}

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Secure Payment</h2>
          <p className="text-blue-100">Complete your booking securely</p>
        </div>

        {/* Booking Summary */}
        <div className="p-6 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4">Booking Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Lawyer</span>
              <span className="font-medium">{bookingData.lawyerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Date</span>
              <span className="font-medium">{bookingData.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Time</span>
              <span className="font-medium">{bookingData.time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Duration</span>
              <span className="font-medium">{bookingData.duration} hour(s)</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-3 border-t border-slate-200">
              <span className="text-slate-900">Total Amount</span>
              <span className="text-blue-600">${bookingData.fee}</span>
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Select Payment Method</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => setPaymentMethod('card')}
              className={`p-4 rounded-xl border-2 transition-all ${
                paymentMethod === 'card' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <CreditCard className="w-6 h-6 mx-auto mb-2 text-slate-700" />
              <p className="text-sm font-medium">Credit/Debit Card</p>
            </button>
            <button
              onClick={() => setPaymentMethod('upi')}
              className={`p-4 rounded-xl border-2 transition-all ${
                paymentMethod === 'upi' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <Smartphone className="w-6 h-6 mx-auto mb-2 text-slate-700" />
              <p className="text-sm font-medium">UPI</p>
            </button>
          </div>

          <form onSubmit={handlePayment} className="space-y-4">
            {paymentMethod === 'card' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Card Number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardDetails.cardNumber}
                    onChange={(e) => setCardDetails({...cardDetails, cardNumber: e.target.value})}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-blue-200"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={cardDetails.expiryDate}
                      onChange={(e) => setCardDetails({...cardDetails, expiryDate: e.target.value})}
                      className="w-full p-3 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-blue-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">CVV</label>
                    <input
                      type="text"
                      placeholder="123"
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                      className="w-full p-3 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-blue-200"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={cardDetails.holderName}
                    onChange={(e) => setCardDetails({...cardDetails, holderName: e.target.value})}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-blue-200"
                    required
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">UPI ID</label>
                <input
                  type="text"
                  placeholder="yourname@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-blue-200"
                  required
                />
              </div>
            )}

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 p-4 bg-green-50 rounded-xl">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-700">Secure Payment Powered by LegalPay</span>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-lg"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Processing Payment...
                </span>
              ) : (
                `Pay $${bookingData.fee}`
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}