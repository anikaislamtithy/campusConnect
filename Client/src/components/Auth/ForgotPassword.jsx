import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { authAPI } from "../../lib/api";
import { Mail, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

const schema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
});

const ForgotPassword = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      await authAPI.forgotPassword(data);
      setIsSubmitted(true);
      toast.success("Password reset email sent! Please check your inbox.");
    } catch (error) {
      const message = error.response?.data?.msg || "Failed to send reset email";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full space-y-8'>
          <div className='text-center'>
            <div className='mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center'>
              <Mail className='h-6 w-6 text-green-600' />
            </div>
            <h2 className='mt-6 text-3xl font-extrabold text-gray-900'>
              Check your email
            </h2>
            <p className='mt-2 text-sm text-gray-600'>
              We've sent a password reset link to your email address. Please check your inbox and follow the instructions to reset your password.
            </p>
            <div className='mt-6'>
              <Link
                to='/login'
                className='inline-flex items-center text-sm text-blue-600 hover:text-blue-500'
              >
                <ArrowLeft className='h-4 w-4 mr-1' />
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
            Forgot your password?
          </h2>
          <p className='mt-2 text-center text-sm text-gray-600'>
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <form className='mt-8 space-y-6' onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor='email' className='block text-sm font-medium text-gray-700'>
              Email address
            </label>
            <div className='mt-1 relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <Mail className='h-5 w-5 text-gray-400' />
              </div>
              <input
                {...register("email")}
                type='email'
                className='appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm'
                placeholder='Enter your email'
              />
            </div>
            {errors.email && (
              <p className='mt-1 text-sm text-red-600'>{errors.email.message}</p>
            )}
          </div>

          <div>
            <button
              type='submit'
              disabled={isSubmitting}
              className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isSubmitting ? "Sending..." : "Send reset link"}
            </button>
          </div>

          <div className='text-center'>
            <Link
              to='/login'
              className='inline-flex items-center text-sm text-blue-600 hover:text-blue-500'
            >
              <ArrowLeft className='h-4 w-4 mr-1' />
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
