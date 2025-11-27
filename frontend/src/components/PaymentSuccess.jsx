import React from 'react'
import { CheckCircle, Calendar, Clock, User, MapPin, ArrowRight, Download } from 'lucide-react'

export default function PaymentSuccess({ bookingData, onViewBooking, onGoToDashboard }) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center text-white">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-green-100">Your appointment has been booked successfully</p>
        </div>

        {/* Booking Details */}
        <div className="p-8">
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              Booking Confirmed
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Lawyer Info */}
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-900 mb-3">Lawyer Details</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{bookingData.lawyerName}</p>
                    <p className="text-sm text-slate-600">Expert Legal Counsel</p>
                  </div>
                </div>
              </div>

              {/* Appointment Info */}
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-900 mb-3">Appointment Details</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-700">{bookingData.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-700">{bookingData.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-700">Online Consultation</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                    <span className="text-sm text-slate-600">Duration</span>
                    <span className="font-medium text-slate-900">{bookingData.duration} hour(s)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="mt-6 p-4 bg-slate-50 rounded-xl">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-slate-600">Payment ID</p>
                  <p className="font-mono text-sm text-slate-900">{bookingData.paymentId}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600">Amount Paid</p>
                  <p className="text-xl font-bold text-green-600">${bookingData.fee}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button
              onClick={onViewBooking}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              View Booking Details
            </button>
            <button
              onClick={onGoToDashboard}
              className="flex-1 bg-slate-900 text-white py-3 px-6 rounded-xl font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Important Information */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <h3 className="font-semibold text-blue-900 mb-2">Important Information</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• You will receive a confirmation email with all details</li>
              <li>• Please join the consultation 5 minutes before scheduled time</li>
              <li>• Have all necessary documents ready for the consultation</li>
              <li>• You can reschedule up to 24 hours before the appointment</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}