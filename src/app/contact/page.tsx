'use client';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      toast.success('Message Sent! Thank you for contacting us.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Contact Us</h1>
          <p className="mt-4 text-lg text-gray-600">
            Have questions or need assistance? We're here to help!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Contact Info */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">Email</h3>
                  <p className="text-gray-600">support@watchandearn.it.com</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Operating Hours</h3>
                  <p className="text-gray-600">Monday - Friday: 9AM - 6PM</p>
                  <p className="text-gray-600">Saturday: 10AM - 4PM</p>
                  <p className="text-gray-600">Sunday: Closed</p>
                </div>
              </CardContent>
            </Card>

            <Card>
  <CardHeader>
    <CardTitle>Follow Us</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="flex space-x-4">
      {/* Twitter */}
      <a href="#" className="text-gray-600 hover:text-yellow-500" aria-label="Twitter">
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 22.4 1.64a9.1 9.1 0 0 1-2.88 1.1A4.52 4.52 0 0 0 16.88.9a4.48 4.48 0 0 0-4.48 4.48c0 .35.04.7.11 1.03A12.81 12.81 0 0 1 3.16 2.2a4.48 4.48 0 0 0-.6 2.26c0 1.56.8 2.94 2.02 3.75A4.48 4.48 0 0 1 2.8 7.7v.06a4.48 4.48 0 0 0 3.6 4.39 4.52 4.52 0 0 1-2.02.08 4.48 4.48 0 0 0 4.2 3.13A9 9 0 0 1 2 19.54a12.7 12.7 0 0 0 6.88 2.02c8.27 0 12.8-6.85 12.8-12.8v-.58A9.22 9.22 0 0 0 23 3z" />
        </svg>
      </a>
      {/* Instagram */}
      <a href="#" className="text-gray-600 hover:text-yellow-500" aria-label="Instagram">
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M7.75 2h8.5C19.1 2 22 4.9 22 7.75v8.5C22 19.1 19.1 22 16.25 22h-8.5C4.9 22 2 19.1 2 16.25v-8.5C2 4.9 4.9 2 7.75 2zm0 2C6.23 4 5 5.23 5 6.75v10.5C5 18.77 6.23 20 7.75 20h8.5c1.52 0 2.75-1.23 2.75-2.75V6.75C19 5.23 17.77 4 16.25 4h-8.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm4.5-2.25a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5z" />
        </svg>
      </a>
      {/* Telegram */}
      <a href="#" className="text-gray-600 hover:text-yellow-500">
                    <span className="sr-only">Telegram</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.25l-2.173 10.244c-.168.78-.614.975-1.243.606l-3.346-2.455-1.646 1.578c-.168.168-.336.336-.673.336l.252-3.345 6.115-5.51c.252-.227-.056-.353-.42-.126l-7.53 4.723-3.257-1.058c-.722-.227-.722-.722.168-1.09l12.673-4.89c.588-.196 1.162.141.98.889z"></path>
                    </svg>
                  </a>
    </div>
  </CardContent>
</Card>

          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-gray-700">
                      Your Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="john.doe@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium text-gray-700">
                    Subject
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="How can we help you?"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-gray-700">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="Your message here..."
                    rows={6}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-yellow-500 text-white font-bold rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
