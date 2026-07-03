'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Check, ChevronRight } from 'lucide-react';
import { useCartStore, useUserStore } from '@/lib/store';
import { api } from '@/lib/api';
import { userApi } from '@/lib/api/user';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/mock-data';
import { Address, ShippingMethod, CheckoutStep } from '@/lib/types';
import { LayoutClient } from '@/components/layout/LayoutClient';
import { Container } from '@/components/shared';
import { cn } from '@/lib/utils';

const steps: { id: CheckoutStep; name: string }[] = [
  { id: 'address', name: 'Address' },
  { id: 'shipping', name: 'Shipping' },
  { id: 'payment', name: 'Payment' },
  { id: 'review', name: 'Review' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    getSubtotal,
    shippingAddress,
    billingAddress,
    useSameAddress,
    shippingMethod,
    setShippingAddress,
    setBillingAddress,
    setUseSameAddress,
    setShippingMethod,
    discount,
    clearCart,
  } = useCartStore();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>('address');
  const [availableShippingMethods, setAvailableShippingMethods] = useState<ShippingMethod[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { user, isLoading: isUserLoading } = useUserStore();

  // Form state
  const [shippingForm, setShippingForm] = useState<Partial<Address>>(shippingAddress || {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Indonesia',
  });
  const [billingForm, setBillingForm] = useState<Partial<Address>>(billingAddress || {});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Address selection state
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | 'new'>('new');
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Fetch saved addresses
  useEffect(() => {
    if (user?.id) {
      userApi.getAddresses(user.id).then((addresses) => {
        setSavedAddresses(addresses);
        if (addresses.length > 0 && !shippingAddress?.id) {
          setSelectedAddressId(addresses[0].id!);
        } else if (shippingAddress?.id) {
          setSelectedAddressId(shippingAddress.id);
        }
      });
    }
  }, [user?.id, shippingAddress?.id]);

  useEffect(() => {
    setIsMounted(true);
    api.getShippingMethods().then(setAvailableShippingMethods);
  }, []);

  useEffect(() => {
    if (isMounted) {
      if (items.length === 0) {
        router.push('/cart');
      } else if (!isUserLoading && !user) {
        router.push('/auth?redirect=/checkout');
      }
    }
  }, [isMounted, items.length, router, user, isUserLoading]);

  if (!isMounted || isUserLoading || !user) return null;

  const subtotal = getSubtotal();
  const total = subtotal - discount + (shippingMethod?.price || 0);

  const validateAddress = (address: Partial<Address>): boolean => {
    const newErrors: Record<string, string> = {};
    if (!address.firstName?.trim()) newErrors.firstName = 'Required';
    if (!address.lastName?.trim()) newErrors.lastName = 'Required';
    if (!address.email?.trim()) newErrors.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email)) newErrors.email = 'Invalid email';
    if (!address.phone?.trim()) newErrors.phone = 'Required';
    if (!address.addressLine1?.trim()) newErrors.addressLine1 = 'Required';
    if (!address.city?.trim()) newErrors.city = 'Required';
    if (!address.state?.trim()) newErrors.state = 'Required';
    if (!address.postalCode?.trim()) newErrors.postalCode = 'Required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = async () => {
    switch (currentStep) {
      case 'address':
        if (selectedAddressId === 'new') {
          if (validateAddress(shippingForm)) {
            setIsSavingAddress(true);
            const newAddr = await userApi.createAddress(user!.id, shippingForm);
            setIsSavingAddress(false);
            
            const finalAddr = newAddr || (shippingForm as Address);
            setShippingAddress(finalAddr);
            if (useSameAddress) setBillingAddress(finalAddr);
            setCurrentStep('shipping');
          }
        } else {
          const selected = savedAddresses.find((a) => a.id === selectedAddressId);
          if (selected) {
            setShippingAddress(selected);
            if (useSameAddress) setBillingAddress(selected);
            setCurrentStep('shipping');
          }
        }
        break;
      case 'shipping':
        if (shippingMethod) setCurrentStep('payment');
        break;
      case 'payment':
        setCurrentStep('review');
        break;
      case 'review':
        handlePlaceOrder();
        break;
    }
  };

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    try {
      // Get auth token to pass to the API
      const { data: { session } } = await supabase.auth.getSession();

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({
          items,
          user,
          address: shippingAddress
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to checkout');
      }
      
      if ((window as any).snap) {
        (window as any).snap.pay(data.token, {
          onSuccess: function (result: any) {
            clearCart();
            router.push('/checkout/success');
          },
          onPending: function (result: any) {
            clearCart();
            router.push('/account?tab=orders'); // Or a pending page
          },
          onError: function (result: any) {
            console.error('Payment Error:', result);
            alert('Payment failed. Please try again.');
            setIsLoading(false);
          },
          onClose: function () {
            setIsLoading(false);
          }
        });
      } else {
        window.location.href = data.redirect_url;
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert(error.message);
      setIsLoading(false);
    }
  };

  const getStepIndex = (step: CheckoutStep) => steps.findIndex(s => s.id === step);

  return (
    <LayoutClient>
      <Container className="py-8 lg:py-16">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => getStepIndex(step.id) <= getStepIndex(currentStep) && setCurrentStep(step.id)}
                  disabled={getStepIndex(step.id) > getStepIndex(currentStep)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 text-sm transition-colors',
                    getStepIndex(step.id) <= getStepIndex(currentStep)
                      ? 'text-foreground'
                      : 'text-muted-foreground cursor-not-allowed'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-6 w-6 items-center justify-center border text-xs',
                      getStepIndex(step.id) < getStepIndex(currentStep)
                        ? 'border-foreground bg-foreground text-background'
                        : getStepIndex(step.id) === getStepIndex(currentStep)
                        ? 'border-foreground'
                        : 'border-muted-foreground'
                    )}
                  >
                    {getStepIndex(step.id) < getStepIndex(currentStep) ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      idx + 1
                    )}
                  </span>
                  <span className="hidden sm:inline">{step.name}</span>
                </button>
                {idx < steps.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Address Step */}
            {currentStep === 'address' && (
              <div className="space-y-6">
                <h2 className="font-serif text-xl font-semibold">Shipping Address</h2>
                
                {savedAddresses.length > 0 && (
                  <div className="space-y-3 mb-6">
                    <label className="text-sm font-medium">Select a saved address</label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {savedAddresses.map((addr) => (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id!)}
                          className={cn(
                            'cursor-pointer border p-4 transition-colors',
                            selectedAddressId === addr.id ? 'border-foreground bg-muted/20' : 'hover:border-foreground/50'
                          )}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-sm">{addr.firstName} {addr.lastName}</span>
                            {addr.isDefault && <span className="text-[10px] uppercase tracking-wider bg-foreground text-background px-2 py-0.5">Default</span>}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {addr.addressLine1}, {addr.city}, {addr.state} {addr.postalCode}
                          </p>
                        </div>
                      ))}
                      
                      <div
                        onClick={() => setSelectedAddressId('new')}
                        className={cn(
                          'flex cursor-pointer items-center justify-center border p-4 text-sm font-medium transition-colors',
                          selectedAddressId === 'new' ? 'border-foreground bg-muted/20' : 'text-muted-foreground hover:border-foreground/50'
                        )}
                      >
                        + Add New Address
                      </div>
                    </div>
                  </div>
                )}

                {selectedAddressId === 'new' && (
                  <div className="grid gap-4 sm:grid-cols-2 mt-6">
                    <div>
                      <label className="mb-1 block text-sm">First Name *</label>
                      <input
                        type="text"
                        value={shippingForm.firstName || ''}
                        onChange={(e) => setShippingForm({ ...shippingForm, firstName: e.target.value })}
                        className={cn(
                          'w-full border px-3 py-2 text-sm focus:border-foreground focus:outline-none',
                          errors.firstName && 'border-error'
                        )}
                      />
                      {errors.firstName && <p className="mt-1 text-xs text-error">{errors.firstName}</p>}
                    </div>
                    <div>
                      <label className="mb-1 block text-sm">Last Name *</label>
                      <input
                        type="text"
                        value={shippingForm.lastName || ''}
                        onChange={(e) => setShippingForm({ ...shippingForm, lastName: e.target.value })}
                        className={cn(
                          'w-full border px-3 py-2 text-sm focus:border-foreground focus:outline-none',
                          errors.lastName && 'border-error'
                        )}
                      />
                      {errors.lastName && <p className="mt-1 text-xs text-error">{errors.lastName}</p>}
                    </div>
                    <div>
                      <label className="mb-1 block text-sm">Email *</label>
                      <input
                        type="email"
                        value={shippingForm.email || ''}
                        onChange={(e) => setShippingForm({ ...shippingForm, email: e.target.value })}
                        className={cn(
                          'w-full border px-3 py-2 text-sm focus:border-foreground focus:outline-none',
                          errors.email && 'border-error'
                        )}
                      />
                      {errors.email && <p className="mt-1 text-xs text-error">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="mb-1 block text-sm">Phone *</label>
                      <input
                        type="tel"
                        value={shippingForm.phone || ''}
                        onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                        className={cn(
                          'w-full border px-3 py-2 text-sm focus:border-foreground focus:outline-none',
                          errors.phone && 'border-error'
                        )}
                      />
                      {errors.phone && <p className="mt-1 text-xs text-error">{errors.phone}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-sm">Address Line 1 *</label>
                      <input
                        type="text"
                        value={shippingForm.addressLine1 || ''}
                        onChange={(e) => setShippingForm({ ...shippingForm, addressLine1: e.target.value })}
                        className={cn(
                          'w-full border px-3 py-2 text-sm focus:border-foreground focus:outline-none',
                          errors.addressLine1 && 'border-error'
                        )}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-sm">Address Line 2</label>
                      <input
                        type="text"
                        value={shippingForm.addressLine2 || ''}
                        onChange={(e) => setShippingForm({ ...shippingForm, addressLine2: e.target.value })}
                        className="w-full border px-3 py-2 text-sm focus:border-foreground focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm">City *</label>
                      <input
                        type="text"
                        value={shippingForm.city || ''}
                        onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                        className={cn(
                          'w-full border px-3 py-2 text-sm focus:border-foreground focus:outline-none',
                          errors.city && 'border-error'
                        )}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm">State/Province *</label>
                      <input
                        type="text"
                        value={shippingForm.state || ''}
                        onChange={(e) => setShippingForm({ ...shippingForm, state: e.target.value })}
                        className={cn(
                          'w-full border px-3 py-2 text-sm focus:border-foreground focus:outline-none',
                          errors.state && 'border-error'
                        )}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm">Postal Code *</label>
                      <input
                        type="text"
                        value={shippingForm.postalCode || ''}
                        onChange={(e) => setShippingForm({ ...shippingForm, postalCode: e.target.value })}
                        className={cn(
                          'w-full border px-3 py-2 text-sm focus:border-foreground focus:outline-none',
                          errors.postalCode && 'border-error'
                        )}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm">Country</label>
                      <input
                        type="text"
                        value={shippingForm.country || 'Indonesia'}
                        onChange={(e) => setShippingForm({ ...shippingForm, country: e.target.value })}
                        className="w-full cursor-not-allowed border bg-muted px-3 py-2 text-sm"
                        disabled
                      />
                    </div>
                  </div>
                )}

                <label className="flex items-center gap-2 mt-4">
                  <input
                    type="checkbox"
                    checked={useSameAddress}
                    onChange={(e) => setUseSameAddress(e.target.checked)}
                    className="h-4 w-4 border-foreground"
                  />
                  <span className="text-sm">Use this address for billing</span>
                </label>
              </div>
            )}

            {/* Shipping Step */}
            {currentStep === 'shipping' && (
              <div className="space-y-6">
                <h2 className="font-serif text-xl font-semibold">Shipping Method</h2>
                <div className="space-y-3">
                  {availableShippingMethods.map((method) => (
                    <label
                      key={method.id}
                      className={cn(
                        'flex cursor-pointer items-center justify-between border p-4',
                        shippingMethod?.id === method.id ? 'border-foreground' : ''
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <input
                          type="radio"
                          name="shipping"
                          checked={shippingMethod?.id === method.id}
                          onChange={() => setShippingMethod(method)}
                          className="h-4 w-4"
                        />
                        <div>
                          <p className="font-medium">{method.name}</p>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                        </div>
                      </div>
                      <span className="font-medium">
                        {method.price === 0 ? 'FREE' : formatPrice(method.price)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Step */}
            {currentStep === 'payment' && (
              <div className="space-y-6">
                <h2 className="font-serif text-xl font-semibold">Payment Method</h2>
                <p className="text-muted-foreground">
                  Payment options will be displayed on the final checkout page.
                </p>
                <div className="space-y-3">
                  {['Bank Transfer', 'Credit Card', 'E-Wallet'].map((method) => (
                    <div key={method} className="border p-4">
                      <p className="font-medium">{method}</p>
                      <p className="text-sm text-muted-foreground">
                        Available for order completion
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Review Step */}
            {currentStep === 'review' && (
              <div className="space-y-6">
                <h2 className="font-serif text-xl font-semibold">Review Your Order</h2>

                {/* Address Summary */}
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="border p-4">
                    <h3 className="mb-2 text-sm font-semibold">Shipping Address</h3>
                    <p className="text-sm text-muted-foreground">
                      {shippingAddress?.firstName} {shippingAddress?.lastName}<br />
                      {shippingAddress?.addressLine1}<br />
                      {shippingAddress?.city}, {shippingAddress?.state} {shippingAddress?.postalCode}<br />
                      {shippingAddress?.phone}
                    </p>
                  </div>
                  <div className="border p-4">
                    <h3 className="mb-2 text-sm font-semibold">Shipping Method</h3>
                    <p className="text-sm text-muted-foreground">
                      {shippingMethod?.name} - {shippingMethod?.price === 0 ? 'FREE' : formatPrice(shippingMethod?.price || 0)}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="border">
                  <div className="border-b p-4">
                    <h3 className="text-sm font-semibold">Order Items</h3>
                  </div>
                  <div className="divide-y">
                    {items.map((item) => {
                      const img = item.product.images[0];
                      return (
                        <div key={item.id} className="flex gap-4 p-4">
                          <div className="relative h-16 w-16 overflow-hidden bg-muted">
                            {img && (
                              <Image src={img.url} alt={img.alt} fill className="object-cover" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{item.product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Size: {item.variant.options.size}
                            </p>
                            <p className="text-sm">
                              {item.quantity} x {formatPrice(item.variant.price)}
                            </p>
                          </div>
                          <p className="font-medium">{formatPrice(item.variant.price * item.quantity)}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between">
              <button
                onClick={() => {
                  const prevIdx = getStepIndex(currentStep) - 1;
                  if (prevIdx >= 0) setCurrentStep(steps[prevIdx].id);
                }}
                disabled={currentStep === 'address'}
                className={cn(
                  'border px-6 py-3 text-sm font-medium transition-colors hover:bg-muted',
                  currentStep === 'address' && 'invisible'
                )}
              >
                Back
              </button>
              <button
                onClick={nextStep}
                disabled={isLoading || isSavingAddress}
                className="bg-foreground px-8 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/80 disabled:opacity-50 min-w-[140px] flex justify-center items-center"
              >
                {isSavingAddress
                  ? 'Saving...'
                  : currentStep === 'review'
                  ? isLoading
                    ? 'Placing Order...'
                    : 'Place Order'
                  : 'Continue'}
              </button>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 border p-6">
              <h2 className="text-lg font-semibold">Order Summary</h2>

              <div className="mt-6 space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.product.name} x{item.quantity}
                    </span>
                    <span>{formatPrice(item.variant.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3 border-t pt-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-success">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {shippingMethod
                      ? shippingMethod.price === 0
                        ? 'FREE'
                        : formatPrice(shippingMethod.price)
                      : 'TBD'}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-3 font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </LayoutClient>
  );
}
