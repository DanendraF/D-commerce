'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { FadeIn } from '@/components/shared';

// Form validation schemas
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

// Premium slider images
const sliderImages = [
  {
    url: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg',
    alt: 'Premium Linen Collection',
    title: 'The Linen Collection',
    subtitle: 'Breathable, elegant, and effortlessly chic.'
  },
  {
    url: 'https://images.pexels.com/photos/4210866/pexels-photo-4210866.jpeg',
    alt: 'Autumn Outerwear',
    title: 'Autumn Essentials',
    subtitle: 'Layer up in style with our new arrivals.'
  },
  {
    url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2070',
    alt: 'Classic Accessories',
    title: 'Timeless Elegance',
    subtitle: 'Accessories that define your personal style.'
  }
];

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/account';
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Slider state
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Forms
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: '', lastName: '', email: '', password: '', confirmPassword: '' }
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;
      
      toast.success('Logged in successfully!');
      router.push(redirectUrl);
    } catch (error: any) {
      toast.error(error.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
          }
        }
      });

      if (error) throw error;

      toast.success('Account created successfully! You can now sign in.');
      setIsLogin(true); // Switch to login after success
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      {/* Left: Form Area */}
      <div className="relative flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16 xl:px-24 bg-[#F9F8F4]">
        
        {/* Decorative elements for premium feel */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-50">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-cream-200/20 blur-3xl" />
          <div className="absolute bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-navy-900/5 blur-3xl" />
        </div>

        <div className="mx-auto w-full max-w-md relative z-10">
          <FadeIn>
            <div className="mb-10 text-center">
              <h1 className="mb-2 font-serif text-3xl font-bold lg:text-4xl tracking-tight">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isLogin 
                  ? 'Enter your credentials to access your account.' 
                  : 'Join us for exclusive access to premium collections.'}
              </p>
            </div>

            {/* Premium Form Card */}
            <div className="bg-white/80 backdrop-blur-xl p-8 sm:p-10 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] border border-white/50 rounded-2xl">

            {/* Login Form */}
            {isLogin && (
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</label>
                  <input 
                    {...loginForm.register('email')}
                    type="email" 
                    placeholder="you@example.com"
                    className="flex h-10 w-full rounded-none border-0 border-b border-foreground/20 bg-transparent px-0 py-2 text-sm transition-colors placeholder:text-muted-foreground/50 focus-visible:border-foreground focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-xs text-error mt-1">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</label>
                    <Link href="/auth" className="text-xs text-muted-foreground hover:text-foreground hover:underline">
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative">
                    <input 
                      {...loginForm.register('password')}
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••"
                      className="flex h-10 w-full rounded-none border-0 border-b border-foreground/20 bg-transparent px-0 py-2 text-sm transition-colors placeholder:text-muted-foreground/50 focus-visible:border-foreground focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 pr-10"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-xs text-error mt-1">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="mt-10 flex h-12 w-full items-center justify-center bg-navy-900 text-white text-sm font-medium uppercase tracking-widest transition-all hover:bg-navy-800 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:transform-none disabled:hover:shadow-none"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign In'}
                </button>
              </form>
            )}

            {/* Register Form */}
            {!isLogin && (
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-5">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">First Name</label>
                    <input 
                      {...registerForm.register('firstName')}
                      className="flex h-10 w-full rounded-none border-0 border-b border-foreground/20 bg-transparent px-0 py-2 text-sm transition-colors focus-visible:border-foreground focus-visible:outline-none focus-visible:ring-0"
                    />
                    {registerForm.formState.errors.firstName && (
                      <p className="text-xs text-error mt-1">{registerForm.formState.errors.firstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Last Name</label>
                    <input 
                      {...registerForm.register('lastName')}
                      className="flex h-10 w-full rounded-none border-0 border-b border-foreground/20 bg-transparent px-0 py-2 text-sm transition-colors focus-visible:border-foreground focus-visible:outline-none focus-visible:ring-0"
                    />
                    {registerForm.formState.errors.lastName && (
                      <p className="text-xs text-error mt-1">{registerForm.formState.errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</label>
                  <input 
                    {...registerForm.register('email')}
                    type="email" 
                    className="flex h-10 w-full rounded-none border-0 border-b border-foreground/20 bg-transparent px-0 py-2 text-sm transition-colors focus-visible:border-foreground focus-visible:outline-none focus-visible:ring-0"
                  />
                  {registerForm.formState.errors.email && (
                    <p className="text-xs text-error mt-1">{registerForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</label>
                  <div className="relative">
                    <input 
                      {...registerForm.register('password')}
                      type={showPassword ? "text" : "password"} 
                      className="flex h-10 w-full rounded-none border-0 border-b border-foreground/20 bg-transparent px-0 py-2 text-sm transition-colors focus-visible:border-foreground focus-visible:outline-none focus-visible:ring-0 pr-10"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {registerForm.formState.errors.password && (
                    <p className="text-xs text-error mt-1">{registerForm.formState.errors.password.message}</p>
                  )}
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Confirm Password</label>
                  <input 
                    {...registerForm.register('confirmPassword')}
                    type="password" 
                    className="flex h-10 w-full rounded-none border-0 border-b border-foreground/20 bg-transparent px-0 py-2 text-sm transition-colors focus-visible:border-foreground focus-visible:outline-none focus-visible:ring-0"
                  />
                  {registerForm.formState.errors.confirmPassword && (
                    <p className="text-xs text-error mt-1">{registerForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="mt-10 flex h-12 w-full items-center justify-center bg-navy-900 text-white text-sm font-medium uppercase tracking-widest transition-all hover:bg-navy-800 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:transform-none disabled:hover:shadow-none"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Account'}
                </button>
              </form>
            )}

            <div className="mt-8 text-center text-sm text-muted-foreground pt-6 border-t border-muted/30">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => {
                  setIsLogin(!isLogin);
                  loginForm.reset();
                  registerForm.reset();
                }}
                className="font-medium text-navy-900 underline underline-offset-4 hover:text-maroon-600 transition-colors"
              >
                {isLogin ? 'Create one' : 'Sign In'}
              </button>
            </div>
            </div> {/* End Form Card */}
          </FadeIn>
        </div>
      </div>

      {/* Right: Visual Slider Area (Hidden on mobile) */}
      <div className="relative hidden w-1/2 overflow-hidden bg-cream-100 lg:block">
        {sliderImages.map((img, idx) => (
          <div
            key={idx}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000 ease-in-out",
              idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            )}
          >
            <Image
              src={img.url}
              alt={img.alt}
              fill
              className="object-cover"
              priority={idx === 0}
              sizes="50vw"
            />
            {/* Dark gradient overlay at bottom for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
            
            {/* Slide Text */}
            <div className="absolute bottom-12 left-12 right-12 text-white">
              <h2 className="font-serif text-4xl font-medium tracking-wide mb-2">
                {img.title}
              </h2>
              <p className="text-white/80 text-lg">
                {img.subtitle}
              </p>
            </div>
          </div>
        ))}

        {/* Dots Navigation */}
        <div className="absolute bottom-12 right-12 z-20 flex gap-2">
          {sliderImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                idx === currentSlide ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
              )}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
