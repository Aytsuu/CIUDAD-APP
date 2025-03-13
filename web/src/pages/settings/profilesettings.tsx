import React, { useState } from 'react';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
const accountFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters long'),
});

const AccountSettings = () => {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(accountFormSchema)
  });

  const onSubmit = (data) => {
    if (!emailVerified) {
      alert("Verification email sent! Please check your inbox.");
      setEmailVerified(true);
    } else {
      alert(`Password changed successfully to: ${data.newPassword}`);
      setIsChangingPassword(false);
      setEmailVerified(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-gray-500">Info about you and your preferences</p>
      </div>

      <div className="bg-white shadow-md rounded-md w-full max-w-2xl p-6">
        {/* Basic Info Section */}
        <div className="border-b pb-4 mb-4">
          <h2 className="text-xl font-bold">Basic Info</h2>
          <p className="text-gray-500">Some info may be visible to other people.</p>

          <div className="flex flex-col items-center my-4">
            <img
              src="https://randomuser.me/api/portraits/women/44.jpg"
              alt="Profile"
              className="w-20 h-20 rounded-full border-4 border-green-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Name</span>
              <span className="font-bold">Ganzon, Joshua</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Birthday</span>
              <span className="font-bold">January 1, 1999</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Gender</span>
              <span className="font-bold">Male</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email</span>
              <span className="font-bold">sanroque@gmail.com</span>
            </div>
          </div>
        </div>

        {/* Password Section */}
        <div>
          <h2 className="text-xl font-bold">Password</h2>
          <p className="text-gray-500">A password that helps secure your account.</p>

          {isChangingPassword ? (
            <form className="mt-4" onSubmit={handleSubmit(onSubmit)}>
              <input
                type="email"
                placeholder="Enter your email"
                {...register('email')}
                className="w-full p-2 border rounded-md"
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

              {emailVerified && (
                <input
                  type="password"
                  placeholder="Enter new password"
                  {...register('newPassword')}
                  className="w-full p-2 border rounded-md mt-2"
                />
              )}
              {errors.newPassword && <p className="text-red-500 text-sm">{errors.newPassword.message}</p>}

              <button
                className="bg-green-500 text-white rounded-md px-4 py-2 mt-2 w-full"
                type="submit"
              >
                {emailVerified ? "Change Password" : "Send Verification Email"}
              </button>
            </form>
          ) : (
            <div className="flex justify-between items-center mt-2">
              <span className="font-bold">••••••••••</span>
              <button
                className="bg-green-500 text-white rounded-md px-4 py-2"
                onClick={() => setIsChangingPassword(true)}
              >
                Change Password
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer Section */}
      <div className="mt-8 text-sm text-gray-500 text-center">
        Only you can see the settings. You might also want to review your settings for Personal Info, Privacy, Security, and Notifications.
      </div>
    </div>
  );
};

export default AccountSettings;
