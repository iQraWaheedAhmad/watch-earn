import { Suspense } from 'react';
import RegistrationFormClient from './RegistrationFormClient';

export default function RegistrationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-lg">Loading registration form...</div>
      </div>
    }>
      <RegistrationFormClient />
    </Suspense>
  );
}
