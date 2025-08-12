"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

const teamMembers = [
  { name: 'Sarah Johnson', role: 'CEO & Founder', bio: 'With over 10 years...', image: '/placeholder.svg' },
  { name: 'Michael Chen', role: 'CTO', bio: 'Michael secures...', image: '/placeholder.svg' },
  { name: 'Emma Rodriguez', role: 'Head of CX', bio: 'Emma ensures...', image: '/placeholder.svg' }
];

const sectionVariant = (direction: 'left' | 'right') => ({
  hidden: { x: direction === 'left' ? -100 : 100, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.8 } }
});

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-20">

        {/* Section 1: About */}
        <motion.div
          variants={sectionVariant('left')}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-4 text-center"
        >
          <h1 className="text-4xl font-bold">About Watch And Earn</h1>
          <p className="text-gray-300">
            Learn more about our mission, vision, and the team behind the platform.
          </p>
        </motion.div>

        {/* Section 1.1 + 1.2: Mission and Vision in a Row */}
        <motion.div
          variants={sectionVariant('right')}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* Mission */}
          <div className="text-center bg-yellow-500 text-white p-8 rounded-lg">
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p>
              At , our mission is to democratize earning opportunities in the digital age.
              We believe that everyone should have access to simple and legitimate ways to generate income
              online. By providing a platform where users can earn by watching videos, we aim to make
              earning accessible to all, regardless of technical expertise or prior experience.
            </p>
          </div>

          {/* Vision */}
          <div className="text-center bg-yellow-500 text-white p-8 rounded-lg">
            <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
            <p>
              We envision a future where earning online is seamless, transparent, and rewarding.
              Our goal is to build a global community of users who can benefit from our platform's
              earning opportunities while enjoying content that interests them. We strive to continually
              innovate and expand our services to provide the best possible experience for our users.
            </p>
          </div>
        </motion.div>

        {/* Section 2: How It Works */}
        <motion.div
          variants={sectionVariant('right')}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-4 text-center"
        >
          <h2 className="text-3xl font-bold">How Watch And Earn Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-yellow-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Register & Invest</h3>
              <p className="text-gray-300">
                Create your account and choose an investment plan that suits your budget and earning goals.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Watch Videos</h3>
              <p className="text-gray-300">
                Access our library of videos and start watching to complete rounds and earn profits.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Earn & Withdraw</h3>
              <p className="text-gray-300">
                Earn daily profits based on your investment plan and withdraw your earnings following our policy.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Section 3: Our Team */}
        <motion.div
          variants={sectionVariant('left')}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-4 text-center"
        >
          <h2 className="text-3xl font-bold">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map(member => (
              <div key={member.name} className="text-center">
                <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-2">
                  <Image src={member.image} alt={member.name} width={128} height={128} className="object-cover" />
                </div>
                <h3 className="text-xl font-semibold">{member.name}</h3>
                <p className="text-yellow-400">{member.role}</p>
                <p className="text-gray-300 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Section 4: Why Choose */}
        <motion.div
          variants={sectionVariant('right')}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-4 text-center"
        >
          <h2 className="text-3xl font-bold">Why Choose Watch And Earn?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {["Secure Platform","Daily Profits","Transparent Policies","User-Friendly Interface"].map(text => (
              <div key={text} className="flex items-start">
                <div className="bg-yellow-500 rounded-full p-2 mr-3">
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold">{text}</h3>
                  <p className="text-gray-300 text-sm">Description for {text}.</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          variants={sectionVariant('left')}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center space-y-4 bg-gray-900 p-8 rounded-lg"
        >
          <h2 className="text-3xl font-bold text-white">Ready to Get Started?</h2>
          <p className="text-gray-300">Join now and begin earning with Watch And Earn today!</p>
          <Link href="/registrationfom" className="inline-block bg-yellow-500 text-black px-6 py-3 rounded-lg hover:bg-yellow-600 transition">
            Register Now
          </Link>
        </motion.div>

      </div>
    </div>
  );
}
