import React from 'react';
import Link from 'next/link';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="mb-4">Last Updated: {new Date().toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}</p>
          
          <p className="mb-6">
            At Watch And Earn, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">1. Information Collection</h2>
          <p className="mb-4">
            We collect several types of information from and about users of our platform, including:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Personal identification information (Name, email address, etc.)</li>
            <li>Financial information (cryptocurrency wallet addresses, transaction history)</li>
            <li>Usage data (videos watched, time spent on platform)</li>
            <li>Device and browser information</li>
          </ul>
          
          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">2. How We Use Your Information</h2>
          <p className="mb-4">
            We use information that we collect about you or that you provide to us:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>To provide and maintain our Service</li>
            <li>To process your investments and withdrawals</li>
            <li>To verify your identity and prevent fraud</li>
            <li>To notify you about changes to our Service</li>
            <li>To improve our platform and user experience</li>
            <li>To respond to your inquiries and provide customer support</li>
            <li>For any other purpose with your consent</li>
          </ul>
          
          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3. Data Security</h2>
          <p className="mb-4">
            We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4. Third-Party Disclosure</h2>
          <p className="mb-4">
            We may disclose your information:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>To comply with legal obligations</li>
            <li>To enforce our Terms of Service</li>
            <li>To protect the rights, property, or safety of our users or the public</li>
            <li>With service providers who assist us in operating our platform</li>
          </ul>
          
          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5. Cookies and Tracking</h2>
          <p className="mb-4">
            We use cookies and similar tracking technologies to track activity on our platform and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">6. Data Retention</h2>
          <p className="mb-4">
            We will retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">7. Children's Privacy</h2>
          <p className="mb-4">
            Our platform is not intended for children under the age of 18. We do not knowingly collect personal information from children under 18.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">8. Changes to This Privacy Policy</h2>
          <p className="mb-4">
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">9. Your Rights</h2>
          <p className="mb-4">
            Depending on your location, you may have certain rights regarding your personal information, including the right to access, correct, or delete your personal data.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">10. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about this Privacy Policy, please <Link href="/contact" className="text-blue-600 hover:underline">contact us</Link>.
          </p>
        </div>
        
        <div className="mt-12 pt-6 border-t border-gray-200 flex justify-center">
          <Link href="/" className="text-blue-600 hover:underline">Return to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
