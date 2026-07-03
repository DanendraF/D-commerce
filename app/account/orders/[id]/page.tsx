'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  ChevronLeft,
  MapPin,
  CreditCard,
  Phone,
  Mail,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Order, OrderStatus } from '@/lib/types';
import { mockOrders, formatPrice } from '@/lib/mock-data';
import { LayoutClient } from '@/components/layout/LayoutClient';
import { Container } from '@/components/shared';

const statusSteps = [
  { id: 'pending', label: 'Menunggu Pembayaran', icon: Clock },
  { id: 'confirmed', label: 'Pesanan Dikonfirmasi', icon: CheckCircle },
  { id: 'processing', label: 'Sedang Dikemas', icon: Package },
  { id: 'shipped', label: 'Dalam Pengiriman', icon: Truck },
  { id: 'delivered', label: 'Terkirim', icon: CheckCircle },
];

const statusConfig: Record<OrderStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'Menunggu Pembayaran', color: 'text-amber-600', bgColor: 'bg-amber-50' },
  confirmed: { label: 'Pesanan Dikonfirmasi', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  processing: { label: 'Sedang Dikemas', color: 'text-purple-600', bgColor: 'bg-purple-50' },
  shipped: { label: 'Dalam Pengiriman', color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
  delivered: { label: 'Terkirim', color: 'text-green-600', bgColor: 'bg-green-50' },
  cancelled: { label: 'Dibatalkan', color: 'text-red-600', bgColor: 'bg-red-50' },
  refunded: { label: 'Direfund', color: 'text-gray-600', bgColor: 'bg-gray-50' },
};

const trackingEvents = [
  { status: 'delivered', date: '20 Jan 2024, 10:00', title: 'Paket Diterima', description: 'Paket telah diterima oleh Sarah Dewi' },
  { status: 'shipped', date: '18 Jan 2024, 14:30', title: 'Dalam Pengiriman', description: 'Paket sedang dalam perjalanan ke alamat tujuan' },
  { status: 'processing', date: '17 Jan 2024, 09:00', title: 'Paket Dikemas', description: 'Paket telah dikemas dan siap dikirim' },
  { status: 'confirmed', date: '15 Jan 2024, 16:00', title: 'Pembayaran Dikonfirmasi', description: 'Pembayaran telah berhasil diverifikasi' },
  { status: 'pending', date: '15 Jan 2024, 08:00', title: 'Pesanan Dibuat', description: 'Pesanan telah berhasil dibuat, menunggu pembayaran' },
];

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Find order by id or order number
    setTimeout(() => {
      const found = mockOrders.find(o => o.id === orderId || o.orderNumber === orderId);
      setOrder(found || null);
      setIsLoading(false);
    }, 300);
  }, [orderId]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCurrentStepIndex = () => {
    if (!order) return 0;
    const stepOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const idx = stepOrder.indexOf(order.status);
    return idx >= 0 ? idx : 0;
  };

  if (isLoading) {
    return (
      <LayoutClient>
        <Container className="py-8 lg:py-16">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-muted" />
            <div className="h-64 w-full bg-muted" />
          </div>
        </Container>
      </LayoutClient>
    );
  }

  if (!order) {
    return (
      <LayoutClient>
        <Container className="flex min-h-[50vh] items-center justify-center py-16">
          <div className="text-center">
            <h1 className="font-serif text-2xl font-bold">Pesanan Tidak Ditemukan</h1>
            <p className="mt-2 text-muted-foreground">
              Pesanan yang Anda cari tidak ditemukan.
            </p>
            <Link
              href="/account/orders"
              className="mt-6 inline-block border px-6 py-2 hover:bg-muted"
            >
              Lihat Semua Pesanan
            </Link>
          </div>
        </Container>
      </LayoutClient>
    );
  }

  const config = statusConfig[order.status];
  const currentStepIndex = getCurrentStepIndex();

  return (
    <LayoutClient>
      <Container className="py-8 lg:py-12">
        {/* Back Link */}
        <Link
          href="/account/orders"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Kembali ke Daftar Pesanan
        </Link>

        {/* Header */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold lg:text-3xl">
              Pesanan {order.orderNumber}
            </h1>
            <p className="mt-1 text-muted-foreground">
              Dibuat pada {new Date(order.createdAt).toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          <div className={cn('rounded-sm px-4 py-2', config.bgColor)}>
            <span className={cn('font-semibold', config.color)}>
              {config.label}
            </span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Status Timeline */}
            <div className="border p-6">
              <h2 className="mb-6 font-semibold">Status Pesanan</h2>

              {/* Progress Steps */}
              <div className="mb-8 relative">
                <div className="flex justify-between">
                  {statusSteps.map((step, idx) => {
                    const Icon = step.icon;
                    const isCompleted = idx <= currentStepIndex;
                    const isCurrent = idx === currentStepIndex;

                    return (
                      <div key={step.id} className="flex flex-col items-center relative z-10">
                        <div
                          className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
                            isCompleted
                              ? 'border-green-500 bg-green-500 text-white'
                              : 'border-gray-200 bg-white text-gray-400'
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <span
                          className={cn(
                            'mt-2 text-xs text-center max-w-[80px]',
                            isCurrent ? 'font-semibold text-foreground' : 'text-muted-foreground'
                          )}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {/* Progress Line */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-0">
                  <div
                    className="h-full bg-green-500 transition-all duration-500"
                    style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
                  />
                </div>
              </div>

              {/* Tracking Events */}
              {order.status !== 'pending' && order.status !== 'cancelled' && (
                <div className="mt-8">
                  <h3 className="mb-4 text-sm font-semibold">Riwayat Pengiriman</h3>
                  <div className="space-y-4">
                    {trackingEvents
                      .filter(event => {
                        const eventIdx = statusSteps.findIndex(s => s.id === event.status);
                        return eventIdx <= currentStepIndex && eventIdx >= 0;
                      })
                      .map((event, idx) => (
                        <div key={idx} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={cn(
                              'h-3 w-3 rounded-full',
                              idx === 0 ? 'bg-green-500' : 'bg-gray-300'
                            )} />
                            {idx < trackingEvents.length - 1 && (
                              <div className="h-full w-px bg-gray-200" />
                            )}
                          </div>
                          <div className="pb-4">
                            <p className="text-xs text-muted-foreground">{event.date}</p>
                            <p className="font-medium">{event.title}</p>
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Tracking Number */}
              {order.trackingNumber && (
                <div className="mt-6 rounded-lg bg-muted/50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Nomor Resi</p>
                      <p className="font-mono font-semibold">{order.trackingNumber}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopy(order.trackingNumber!)}
                        className="flex items-center gap-1 text-sm font-medium hover:underline"
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copied ? 'Tersalin' : 'Salin'}
                      </button>
                      {order.trackingUrl && (
                        <a
                          href={order.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Lacak
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="border">
              <div className="border-b p-4">
                <h2 className="font-semibold">Item Pesanan ({order.items.length})</h2>
              </div>
              <div className="divide-y">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4">
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden bg-muted">
                      <Image
                        src={item.image}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.variantName} | SKU: {item.sku}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm">
                          {item.quantity} x {formatPrice(item.unitPrice)}
                        </span>
                        <span className="font-semibold">{formatPrice(item.totalPrice)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Info */}
            <div className="border p-6">
              <h2 className="mb-4 font-semibold">Informasi Pembayaran</h2>
              <div className="flex items-start gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{order.paymentMethod.name}</p>
                  <p className={cn(
                    'text-sm',
                    order.paymentStatus === 'paid' ? 'text-green-600' :
                    order.paymentStatus === 'pending' ? 'text-amber-600' : 'text-red-600'
                  )}>
                    {order.paymentStatus === 'paid' ? 'Pembayaran Berhasil' :
                     order.paymentStatus === 'pending' ? 'Menunggu Pembayaran' : 'Pembayaran Gagal'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="border p-6">
              <h2 className="mb-4 font-semibold">Ringkasan Pesanan</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ongkos Kirim</span>
                  <span>{order.shipping === 0 ? 'Gratis' : formatPrice(order.shipping)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Diskon</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-3 text-base font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="border p-6">
              <h2 className="mb-4 font-semibold">Alamat Pengiriman</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.shippingAddress.addressLine1}
                      {order.shippingAddress.addressLine2 && (
                        <>, {order.shippingAddress.addressLine2}</>
                      )}
                      <br />
                      {order.shippingAddress.city}, {order.shippingAddress.state}
                      <br />
                      {order.shippingAddress.postalCode}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                  <p className="text-sm">{order.shippingAddress.phone}</p>
                </div>
              </div>
            </div>

            {/* Need Help */}
            <div className="border bg-muted/30 p-6">
              <h2 className="mb-4 font-semibold">Butuh Bantuan?</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Ada pertanyaan tentang pesanan Anda? Hubungi customer service kami.
              </p>
              <div className="space-y-3">
                <a
                  href="mailto:support@dcommerce.id"
                  className="flex items-center gap-3 text-sm font-medium hover:underline"
                >
                  <Mail className="h-4 w-4" />
                  support@dcommerce.id
                </a>
                <p className="text-xs text-muted-foreground">
                  Jam operasional: Senin - Jumat, 09:00 - 18:00 WIB
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </LayoutClient>
  );
}
