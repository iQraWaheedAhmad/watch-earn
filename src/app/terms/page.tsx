import React from 'react';
import Link from 'next/link';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="mb-4">Last Updated: {new Date().toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}</p>
          
          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing or using the Watch And Earn platform ("Service"), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the Service.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">2. Description of Service</h2>
          <p className="mb-4">
            Watch And Earn is a platform that allows users to earn cryptocurrency rewards by watching videos and participating in various activities. Users make an initial investment and can earn daily profits based on their selected investment plan.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3. Account Registration</h2>
          <p className="mb-4">
            To use certain features of the Service, you must register for an account. You must provide accurate and complete information and keep your account details updated. You are responsible for safeguarding your password and for all activities that occur under your account.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4. Investment and Earnings</h2>
          <p className="mb-4">
            4.1. All investments made on the platform are subject to our profit distribution policy. <br />
            4.2. Initial investments are locked for a period of 30 days. <br />
            4.3. Daily profits can be withdrawn once per day with a minimum gap of 12 hours between withdrawals. <br />
            4.4. The platform does not guarantee profits, and earnings may vary based on various factors.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5. Withdrawal Policy</h2>
          <p className="mb-4">
            5.1. Users can withdraw their earnings subject to our withdrawal policy. <br />
            5.2. A minimum gap of 12 hours must be maintained between consecutive withdrawals. <br />
            5.3. Initial investments can be withdrawn after the 30-day lock period. <br />
            5.4. All withdrawals are subject to verification and processing time.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">6. Prohibited Uses</h2>
          <p className="mb-4">
            You agree not to use the Service for any illegal purposes or to engage in activities that could damage, disable, or impair the Service's functionality.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">7. Intellectual Property</h2>
          <p className="mb-4">
            The Service and its original content, features, and functionality are and will remain the exclusive property of Watch And Earn. The Service is protected by copyright, trademark, and other laws.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">8. Termination</h2>
          <p className="mb-4">
            We may terminate or suspend your account and access to the Service immediately, without prior notice, for conduct that we believe violates these Terms of Service or is harmful to other users of the Service, us, or third parties.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">9. Limitation of Liability</h2>
          <p className="mb-4">
            In no event shall Watch And Earn, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">10. Changes to Terms</h2>
          <p className="mb-4">
            We reserve the right to modify or replace these Terms of Service at any time. It is your responsibility to review these Terms periodically for changes.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">11. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about these Terms, please <Link href="/contact" className="text-blue-600 hover:underline">contact us</Link>.
          </p>
        </div>
        
        <div className="mt-12 pt-6 border-t border-gray-200 flex justify-center">
          <Link href="/" className="text-blue-600 hover:underline">Return to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default Terms;
