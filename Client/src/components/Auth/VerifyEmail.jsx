import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAuth } from "../../hooks/useAuth";
import { Mail, Key, CheckCircle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const schema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  verificationToken: yup
    .string()
    .required("Verification token is required"),
});

const VerifyEmail = () => {
  const { verifyEmail, resendVerificationEmail } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [autoVerifying, setAutoVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null); // 'success', 'error', null
  const [resending, setResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: searchParams.get("email") || "",
      verificationToken: searchParams.get("token") || "",
    },
  });

  // Auto-verify if both email and token are in URL params
  useEffect(() => {
    const email = searchParams.get("email");
    const token = searchParams.get("token");

    if (email && token && !autoVerifying && !verificationStatus) {
      setAutoVerifying(true);
      handleAutoVerification(email, token);
    }
  }, [searchParams, autoVerifying, verificationStatus]);

  const handleAutoVerification = async (email, token) => {
    try {
      const result = await verifyEmail({ email, verificationToken: token });
      if (result.success) {
        setVerificationStatus('success');
        toast.success("Email verified successfully!");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setVerificationStatus('error');
      }
    } catch (error) {
      setVerificationStatus('error');
      toast.error("Verification failed. Please try again.");
    } finally {
      setAutoVerifying(false);
    }
  };

  const onSubmit = async (data) => {
    const result = await verifyEmail(data);
    if (result.success) {
      setVerificationStatus('success');
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } else {
      setVerificationStatus('error');
    }
  };

  const handleResendEmail = async () => {
    const email = searchParams.get("email") || document.querySelector('input[type="email"]')?.value;
    if (!email) {
      toast.error("Please enter your email address first");
      return;
    }

    setResending(true);
    const result = await resendVerificationEmail(email);
    setResending(false);

    if (result.success) {
      // Reset verification status to allow retry
      setVerificationStatus(null);
    }
  };

  // Show auto-verification loading state
  if (autoVerifying) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full space-y-8 text-center'>
          <div>
            <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto'></div>
            <h2 className='mt-6 text-center text-2xl font-bold text-gray-900'>
              Verifying your email...
            </h2>
            <p className='mt-2 text-center text-sm text-gray-600'>
              Please wait while we verify your email address.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show success state
  if (verificationStatus === 'success') {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full space-y-8 text-center'>
          <div>
            <CheckCircle className='h-16 w-16 text-green-500 mx-auto' />
            <h2 className='mt-6 text-center text-2xl font-bold text-gray-900'>
              Email Verified Successfully!
            </h2>
            <p className='mt-2 text-center text-sm text-gray-600'>
              Your email has been verified. Redirecting to login...
            </p>
            <div className='mt-6'>
              <Link
                to='/login'
                className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700'
              >
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (verificationStatus === 'error') {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full space-y-8 text-center'>
          <div>
            <AlertCircle className='h-16 w-16 text-red-500 mx-auto' />
            <h2 className='mt-6 text-center text-2xl font-bold text-gray-900'>
              Verification Failed
            </h2>
            <p className='mt-2 text-center text-sm text-gray-600'>
              The verification link may be invalid or expired. Please try manual verification below.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <div className='text-center'>
            <Mail className='h-12 w-12 text-blue-600 mx-auto' />
          </div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
            Verify your email
          </h2>
          <p className='mt-2 text-center text-sm text-gray-600'>
            Enter your email and the verification token sent to your inbox
          </p>
        </div>

        <form className='mt-8 space-y-6' onSubmit={handleSubmit(onSubmit)}>
          <div className='space-y-4'>
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-700'
              >
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
                <p className='mt-1 text-sm text-red-600'>
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor='verificationToken'
                className='block text-sm font-medium text-gray-700'
              >
                Verification Token
              </label>
              <div className='mt-1 relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Key className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  {...register("verificationToken")}
                  type='text'
                  className='appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm'
                  placeholder='Enter verification token'
                />
              </div>
              {errors.verificationToken && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.verificationToken.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type='submit'
              disabled={isSubmitting}
              className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isSubmitting ? "Verifying..." : "Verify Email"}
            </button>
          </div>

          <div className='text-center space-y-2'>
            <Link
              to='/login'
              className='block text-sm text-blue-600 hover:text-blue-500'
            >
              Back to login
            </Link>
            <Link
              to='/register'
              className='block text-sm text-gray-600 hover:text-gray-500'
            >
              Need to register again?
            </Link>
          </div>
        </form>

        <div className='mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md'>
          <div className='flex'>
            <div className='flex-shrink-0'>
              <Mail className='h-5 w-5 text-blue-400' />
            </div>
            <div className='ml-3 flex-1'>
              <h3 className='text-sm font-medium text-blue-800'>
                Didn't receive the email?
              </h3>
              <div className='mt-2 text-sm text-blue-700'>
                <p>Check your spam folder or click below to resend the verification email.</p>
              </div>
              <div className='mt-3'>
                <button
                  type='button'
                  onClick={handleResendEmail}
                  disabled={resending}
                  className='inline-flex items-center px-3 py-1 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {resending ? "Sending..." : "Resend Email"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;