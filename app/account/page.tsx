'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User as UserIcon, Package, MapPin, CreditCard, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LayoutClient } from '@/components/layout/LayoutClient';
import { Container } from '@/components/shared';
import { useUserStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { userApi } from '@/lib/api/user';
import { Address } from '@/lib/types';
import { useEffect } from 'react';
import { toast } from 'sonner';

const sidebarItems = [
  { id: 'profile', name: 'My Profile', icon: UserIcon },
  { id: 'orders', name: 'Order History', icon: Package },
  { id: 'addresses', name: 'My Addresses', icon: MapPin },
  { id: 'settings', name: 'Settings', icon: Settings },
];

export default function AccountPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');

  const { user: authUser, isLoading: isAuthLoading } = useUserStore();
  const [isMounted, setIsMounted] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  
  // Profile UI states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Address UI states
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isAuthLoading && !authUser) {
      router.push('/auth?redirect=/account');
    }
  }, [isMounted, isAuthLoading, authUser, router]);

  useEffect(() => {
    if (authUser?.id) {
      userApi.getAddresses(authUser.id).then(setAddresses);
      
      // Fetch orders
      if (activeTab === 'orders') {
        setIsLoadingOrders(true);
        supabase.from('orders')
          .select('*')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false })
          .then(({ data }) => {
            if (data) setOrders(data);
            setIsLoadingOrders(false);
          });
      }
    }
  }, [authUser?.id, activeTab]);

  if (!isMounted || isAuthLoading || !authUser) {
    return null; // Or a loading spinner
  }

  // Map Supabase user data
  const user = {
    firstName: authUser.user_metadata?.first_name || 'User',
    lastName: authUser.user_metadata?.last_name || '',
    email: authUser.email || '',
    phone: authUser.user_metadata?.phone || '',
    avatar: null,
  };

  const parsePhone = (fullPhone: string) => {
    if (!fullPhone || fullPhone === 'Not set') return { code: '+62', number: '' };
    if (fullPhone.startsWith('+62')) return { code: '+62', number: fullPhone.slice(3) };
    if (fullPhone.startsWith('+1')) return { code: '+1', number: fullPhone.slice(2) };
    if (fullPhone.startsWith('+44')) return { code: '+44', number: fullPhone.slice(3) };
    if (fullPhone.startsWith('+65')) return { code: '+65', number: fullPhone.slice(3) };
    return { code: '+62', number: fullPhone }; // fallback
  };

  const userPhone = parsePhone(user.phone);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleProfileSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const phoneCode = formData.get('phoneCode') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    const phone = `${phoneCode}${phoneNumber}`;

    setIsSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: { first_name: firstName, last_name: lastName, phone }
    });

    if (error) {
      toast.error(error.message || 'Failed to update profile');
    } else {
      toast.success('Profile updated successfully');
      setIsEditingProfile(false);
      window.location.reload(); // Refresh to update store
    }
    setIsSaving(false);
  };

  const handleAddressSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!authUser?.id) return;
    
    const formData = new FormData(e.currentTarget);
    const phoneCode = formData.get('phoneCode') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    
    const addressData: Partial<Address> = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      phone: `${phoneCode}${phoneNumber}`,
      addressLine1: formData.get('addressLine1') as string,
      addressLine2: formData.get('addressLine2') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      postalCode: formData.get('postalCode') as string,
      country: formData.get('country') as string || 'Indonesia',
      isDefault: formData.get('isDefault') === 'on',
      label: formData.get('label') as string || 'Home',
    };

    setIsSaving(true);
    if (editingAddressId) {
      const updated = await userApi.updateAddress(editingAddressId, addressData);
      if (updated) {
        setAddresses(addresses.map(a => a.id === editingAddressId ? updated : a));
        toast.success('Address updated');
        setEditingAddressId(null);
      } else {
        toast.error('Failed to update address');
      }
    } else {
      const created = await userApi.createAddress(authUser.id, addressData);
      if (created) {
        setAddresses([created, ...addresses]);
        toast.success('Address added');
        setIsAddingAddress(false);
      } else {
        toast.error('Failed to add address');
      }
    }
    setIsSaving(false);
  };

  const handleDeleteAddress = async (id: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      const success = await userApi.deleteAddress(id);
      if (success) {
        setAddresses(addresses.filter(a => a.id !== id));
        toast.success('Address deleted');
      } else {
        toast.error('Failed to delete address');
      }
    }
  };

  return (
    <LayoutClient>
      <Container className="py-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="border">
              <div className="border-b p-4">
                <p className="font-medium">{user.firstName} {user.lastName}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <nav className="p-2">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors',
                      activeTab === item.id
                        ? 'bg-foreground text-background'
                        : 'hover:bg-muted'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </button>
                ))}
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-error transition-colors hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h1 className="font-serif text-xl font-bold">My Profile</h1>
                <form onSubmit={handleProfileSave} className="border p-6 relative">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="font-medium text-lg">Personal Information</h2>
                    {!isEditingProfile && (
                      <button 
                        type="button"
                        onClick={() => setIsEditingProfile(true)}
                        className="text-sm font-medium underline underline-offset-4 hover:text-foreground/70 transition-colors"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-muted-foreground">First Name</label>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          name="firstName"
                          required
                          defaultValue={user.firstName}
                          className="w-full border-b border-foreground/30 bg-transparent px-0 py-2 text-sm focus:border-foreground focus:outline-none transition-colors"
                        />
                      ) : (
                        <p className="py-2 text-sm font-medium">{user.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Last Name</label>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          name="lastName"
                          required
                          defaultValue={user.lastName}
                          className="w-full border-b border-foreground/30 bg-transparent px-0 py-2 text-sm focus:border-foreground focus:outline-none transition-colors"
                        />
                      ) : (
                        <p className="py-2 text-sm font-medium">{user.lastName || '-'}</p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Email</label>
                      {isEditingProfile ? (
                        <input
                          type="email"
                          defaultValue={user.email}
                          className="w-full border-b border-muted bg-muted/30 px-0 py-2 text-sm text-muted-foreground cursor-not-allowed"
                          disabled
                        />
                      ) : (
                        <p className="py-2 text-sm font-medium">{user.email}</p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Phone</label>
                      {isEditingProfile ? (
                        <div className="flex gap-2">
                          <select 
                            name="phoneCode" 
                            defaultValue={userPhone.code}
                            className="w-24 border-b border-foreground/30 bg-transparent px-0 py-2 text-sm focus:border-foreground focus:outline-none transition-colors cursor-pointer"
                          >
                            <option value="+62">+62 (ID)</option>
                            <option value="+65">+65 (SG)</option>
                            <option value="+1">+1 (US)</option>
                            <option value="+44">+44 (UK)</option>
                          </select>
                          <input
                            type="tel"
                            name="phoneNumber"
                            required
                            defaultValue={userPhone.number}
                            className="flex-1 border-b border-foreground/30 bg-transparent px-0 py-2 text-sm focus:border-foreground focus:outline-none transition-colors"
                          />
                        </div>
                      ) : (
                        <p className="py-2 text-sm font-medium">{user.phone || 'Not set'}</p>
                      )}
                    </div>
                  </div>
                  
                  {isEditingProfile && (
                    <div className="mt-8 flex gap-3">
                      <button 
                        type="submit"
                        disabled={isSaving}
                        className="bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/80 disabled:opacity-50"
                      >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button 
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="border border-foreground/20 px-6 py-2.5 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
                        disabled={isSaving}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </form>

                {/* Change Password */}
                <div className="border p-6">
                  <div className="flex justify-between items-center">
                    <h2 className="font-medium text-lg">Security</h2>
                    {!showChangePassword && (
                      <button 
                        onClick={() => setShowChangePassword(true)}
                        className="text-sm font-medium underline underline-offset-4 hover:text-foreground/70 transition-colors"
                      >
                        Change Password
                      </button>
                    )}
                  </div>
                  
                  {showChangePassword && (
                    <div className="mt-6 pt-6 border-t border-muted/50">
                      <div className="grid gap-6 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Current Password</label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full border-b border-foreground/30 bg-transparent px-0 py-2 text-sm focus:border-foreground focus:outline-none transition-colors"
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-muted-foreground">New Password</label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full border-b border-foreground/30 bg-transparent px-0 py-2 text-sm focus:border-foreground focus:outline-none transition-colors"
                          />
                        </div>
                      </div>
                      <div className="mt-8 flex gap-3">
                        <button className="bg-navy-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-800">
                          Update Password
                        </button>
                        <button 
                          onClick={() => setShowChangePassword(false)}
                          className="border border-foreground/20 px-6 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-6">
                <h1 className="font-serif text-xl font-bold">Order History</h1>
                {isLoadingOrders ? (
                  <div className="border p-12 text-center text-muted-foreground">Loading orders...</div>
                ) : orders.length === 0 ? (
                  <div className="border p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
                    <Package className="h-12 w-12 text-muted-foreground/30 mb-4" />
                    <h3 className="font-serif text-lg font-medium mb-2">No Orders Yet</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      You haven't placed any orders yet. Start exploring our collection!
                    </p>
                    <button 
                      onClick={() => router.push('/')}
                      className="mt-6 bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/80"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border p-6 flex flex-col sm:flex-row justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{order.odoo_order_number}</h3>
                            <span className={cn(
                              "text-xs px-2 py-1 uppercase tracking-wider font-medium",
                              order.status === 'paid' ? 'bg-success/10 text-success' : 
                              order.status === 'failed' ? 'bg-error/10 text-error' : 
                              'bg-warning/10 text-warning'
                            )}>
                              {order.status}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">
                            Ordered on {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                          <p className="font-medium">Total: Rp {order.total_amount?.toLocaleString('id-ID')}</p>
                          <div className="mt-4 border-t pt-4">
                            <h4 className="text-sm font-medium mb-3">Order Items:</h4>
                            <div className="space-y-3">
                              {order.items?.map((item: any, idx: number) => (
                                <div key={idx} className="flex gap-3 text-sm">
                                  <div className="h-12 w-12 bg-muted relative overflow-hidden flex-shrink-0">
                                    {item.product?.images?.[0]?.url && (
                                      <img src={item.product.images[0].url} alt={item.product.name} className="object-cover w-full h-full" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium">{item.product?.name || 'Unknown Product'}</p>
                                    <p className="text-muted-foreground text-xs">
                                      Variant: {item.variant?.name || 'Default'} | Qty: {item.quantity}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col justify-center sm:items-end gap-2 border-t sm:border-t-0 pt-4 sm:pt-0 mt-4 sm:mt-0">
                          {order.status === 'pending' && order.midtrans_redirect_url && (
                            <button
                              onClick={() => {
                                if ((window as any).snap && order.midtrans_token) {
                                  (window as any).snap.pay(order.midtrans_token);
                                } else {
                                  window.location.href = order.midtrans_redirect_url;
                                }
                              }}
                              className="bg-foreground px-6 py-2 text-sm font-medium text-background hover:bg-foreground/80 w-full sm:w-auto mb-2"
                            >
                              Pay Now
                            </button>
                          )}
                          
                          {(order.status === 'pending' || order.status === 'paid') && (
                            <button
                              onClick={async () => {
                                if (confirm('Tandai pesanan ini sebagai Telah Diterima? (Ini akan menyelesaikan order & memotong stok)')) {
                                  try {
                                    const res = await fetch('/api/orders/complete', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ orderId: order.id, odooId: order.odoo_order_id })
                                    });
                                    if (res.ok) {
                                      setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'completed' } : o));
                                      alert('Pesanan berhasil diselesaikan!');
                                    } else {
                                      alert('Gagal menyelesaikan pesanan.');
                                    }
                                  } catch (e) {
                                    alert('Terjadi kesalahan sistem.');
                                  }
                                }
                              }}
                              className="border border-foreground px-6 py-2 text-sm font-medium text-foreground hover:bg-muted w-full sm:w-auto"
                            >
                              Pesanan Diterima
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="font-serif text-xl font-bold">My Addresses</h1>
                  {!isAddingAddress && !editingAddressId && (
                    <button 
                      onClick={() => setIsAddingAddress(true)}
                      className="bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/80"
                    >
                      Add New Address
                    </button>
                  )}
                </div>

                {(isAddingAddress || editingAddressId) && (
                  <form onSubmit={handleAddressSave} className="border p-6 bg-muted/10">
                    <h2 className="font-medium mb-6">{editingAddressId ? 'Edit Address' : 'Add New Address'}</h2>
                    
                    {(() => {
                      const editData = editingAddressId ? addresses.find(a => a.id === editingAddressId) : null;
                      return (
                        <>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <label className="mb-1.5 block text-sm font-medium">Label (e.g. Home, Office)</label>
                              <input type="text" name="label" required defaultValue={editData?.label || 'Home'} className="w-full border px-3 py-2 text-sm focus:border-foreground focus:outline-none" />
                            </div>
                            <div className="sm:col-span-2 grid gap-4 sm:grid-cols-2 mt-2">
                              <div>
                                <label className="mb-1.5 block text-sm font-medium">First Name</label>
                                <input type="text" name="firstName" required defaultValue={editData?.firstName || ''} className="w-full border px-3 py-2 text-sm focus:border-foreground focus:outline-none" />
                              </div>
                              <div>
                                <label className="mb-1.5 block text-sm font-medium">Last Name</label>
                                <input type="text" name="lastName" required defaultValue={editData?.lastName || ''} className="w-full border px-3 py-2 text-sm focus:border-foreground focus:outline-none" />
                              </div>
                            </div>
                            <div className="sm:col-span-2">
                              <label className="mb-1.5 block text-sm font-medium">Phone</label>
                              <div className="flex gap-2">
                                <select 
                                  name="phoneCode" 
                                  defaultValue={editData ? parsePhone(editData.phone).code : '+62'}
                                  className="w-28 border px-3 py-2 text-sm focus:border-foreground focus:outline-none cursor-pointer bg-transparent"
                                >
                                  <option value="+62">+62 (ID)</option>
                                  <option value="+65">+65 (SG)</option>
                                  <option value="+1">+1 (US)</option>
                                  <option value="+44">+44 (UK)</option>
                                </select>
                                <input 
                                  type="tel" 
                                  name="phoneNumber" 
                                  required 
                                  defaultValue={editData ? parsePhone(editData.phone).number : ''} 
                                  className="flex-1 border px-3 py-2 text-sm focus:border-foreground focus:outline-none" 
                                />
                              </div>
                            </div>
                            <div className="sm:col-span-2">
                              <label className="mb-1.5 block text-sm font-medium">Address Line 1</label>
                              <input type="text" name="addressLine1" required defaultValue={editData?.addressLine1 || ''} className="w-full border px-3 py-2 text-sm focus:border-foreground focus:outline-none" />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="mb-1.5 block text-sm font-medium">Address Line 2 (Optional)</label>
                              <input type="text" name="addressLine2" defaultValue={editData?.addressLine2 || ''} className="w-full border px-3 py-2 text-sm focus:border-foreground focus:outline-none" />
                            </div>
                            <div>
                              <label className="mb-1.5 block text-sm font-medium">City</label>
                              <input type="text" name="city" required defaultValue={editData?.city || ''} className="w-full border px-3 py-2 text-sm focus:border-foreground focus:outline-none" />
                            </div>
                            <div>
                              <label className="mb-1.5 block text-sm font-medium">State/Province</label>
                              <input type="text" name="state" required defaultValue={editData?.state || ''} className="w-full border px-3 py-2 text-sm focus:border-foreground focus:outline-none" />
                            </div>
                            <div>
                              <label className="mb-1.5 block text-sm font-medium">Postal Code</label>
                              <input type="text" name="postalCode" required defaultValue={editData?.postalCode || ''} className="w-full border px-3 py-2 text-sm focus:border-foreground focus:outline-none" />
                            </div>
                            <div>
                              <label className="mb-1.5 block text-sm font-medium">Country</label>
                              <input type="text" name="country" required defaultValue={editData?.country || 'Indonesia'} className="w-full border bg-muted px-3 py-2 text-sm cursor-not-allowed" readOnly />
                            </div>
                          </div>
                          
                          <label className="flex items-center gap-2 mt-6">
                            <input type="checkbox" name="isDefault" defaultChecked={editData?.isDefault} className="h-4 w-4 border-foreground" />
                            <span className="text-sm">Set as default address</span>
                          </label>

                          <div className="mt-8 flex gap-3">
                            <button type="submit" disabled={isSaving} className="bg-foreground px-6 py-2.5 text-sm font-medium text-background hover:bg-foreground/80 disabled:opacity-50">
                              {isSaving ? 'Saving...' : 'Save Address'}
                            </button>
                            <button 
                              type="button" 
                              onClick={() => { setIsAddingAddress(false); setEditingAddressId(null); }}
                              className="border border-foreground/20 px-6 py-2.5 text-sm font-medium hover:bg-muted disabled:opacity-50"
                              disabled={isSaving}
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      );
                    })()}
                  </form>
                )}

                {!isAddingAddress && !editingAddressId && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {addresses.length === 0 ? (
                      <p className="text-sm text-muted-foreground col-span-2 py-4">No addresses saved yet.</p>
                    ) : (
                      addresses.map((addr, idx) => (
                        <div key={idx} className="border p-4">
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">{addr.label}</span>
                              {addr.isDefault && (
                                <span className="bg-foreground text-background px-2 py-0.5 text-[10px] uppercase tracking-wider">Default</span>
                              )}
                            </div>
                          </div>
                          <p className="text-sm font-medium mt-3">{addr.firstName} {addr.lastName}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {addr.addressLine1} {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}<br />
                            {addr.city}, {addr.state} {addr.postalCode}<br />
                            {addr.country}<br />
                            {addr.phone}
                          </p>
                          <div className="mt-5 flex gap-3">
                            <button 
                              onClick={() => setEditingAddressId(addr.id!)}
                              className="text-xs font-medium underline underline-offset-4 hover:text-foreground/70"
                            >
                              Edit
                            </button>
                            {!addr.isDefault && (
                              <button 
                                onClick={() => handleDeleteAddress(addr.id!)}
                                className="text-xs font-medium text-error underline underline-offset-4 hover:text-error/70"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h1 className="font-serif text-xl font-bold">Settings</h1>
                <div className="border p-6">
                  <h2 className="mb-4 font-medium">Notifications</h2>
                  <div className="space-y-3">
                    {['Order updates', 'Promotional emails', 'Newsletter'].map((item) => (
                      <label key={item} className="flex items-center justify-between">
                        <span className="text-sm">{item}</span>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>
    </LayoutClient>
  );
}
