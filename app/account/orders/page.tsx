'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, Truck, CheckCircle, Clock, XCircle, ChevronRight, PackageOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Order, OrderStatus } from '@/lib/types';
import { mockOrders, formatPrice } from '@/lib/mock-data';
import { LayoutClient } from '@/components/layout/LayoutClient';
import { Container } from '@/components/shared';

const statusConfig: Record<OrderStatus, { label: string; color: string; bgColor: string; icon: typeof Package }> = {
  pending: { label: 'Menunggu Pembayaran', color: 'text-amber-600', bgColor: 'bg-amber-50', icon: Clock },
  confirmed: { label: 'Pesanan Dikonfirmasi', color: 'text-blue-600', bgColor: 'bg-blue-50', icon: CheckCircle },
  processing: { label: 'Sedang Dikemas', color: 'text-purple-600', bgColor: 'bg-purple-50', icon: Package },
  shipped: { label: 'Dalam Pengiriman', color: 'text-cyan-600', bgColor: 'bg-cyan-50', icon: Truck },
  delivered: { label: 'Terkirim', color: 'text-green-600', bgColor: 'bg-green-50', icon: CheckCircle },
  cancelled: { label: 'Dibatalkan', color: 'text-red-600', bgColor: 'bg-red-50', icon: XCircle },
  refunded: { label: 'Direfund', color: 'text-gray-600', bgColor: 'bg-gray-50', icon: XCircle },
};

const statusDescriptions: Record<OrderStatus, string> = {
  pending: 'Segera selesaikan pembayaran Anda',
  confirmed: 'Pesanan telah dikonfirmasi',
  processing: 'Pesanan sedang dikemas',
  shipped: 'Pesanan dalam perjalanan',
  delivered: 'Pesanan telah diterima',
  cancelled: 'Pesanan dibatalkan',
  refunded: 'Pembayaran telah direfund',
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<OrderStatus | 'all'>('all');

  useEffect(() => {
    setTimeout(() => {
      setOrders(mockOrders);
      setIsLoading(false);
    }, 300);
  }, []);

  const filteredOrders = activeFilter === 'all'
    ? orders
    : orders.filter(order => order.status === activeFilter);

  const orderCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => ['confirmed', 'processing'].includes(o.status)).length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  if (isLoading) {
    return (
      <LayoutClient>
        <Container className="py-8 lg:py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-muted" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-10 w-24 bg-muted" />
              ))}
            </div>
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 w-full bg-muted" />
            ))}
          </div>
        </Container>
      </LayoutClient>
    );
  }

  return (
    <LayoutClient>
      <Container className="py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-2xl font-bold lg:text-3xl">Pesanan Saya</h1>
          <p className="mt-2 text-muted-foreground">Kelola dan lacak semua pesanan Anda</p>
        </div>

        {/* Status Filter Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'Semua', count: orderCounts.all },
            { key: 'pending', label: 'Belum Bayar', count: orderCounts.pending },
            { key: 'processing', label: 'Dikemas', count: orderCounts.processing },
            { key: 'shipped', label: 'Dikirim', count: orderCounts.shipped },
            { key: 'delivered', label: 'Selesai', count: orderCounts.delivered },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key as OrderStatus | 'all')}
              className={cn(
                'flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all',
                activeFilter === filter.key
                  ? 'border-foreground bg-foreground text-background'
                  : 'hover:bg-muted'
              )}
            >
              {filter.label}
              {filter.count > 0 && (
                <span className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full text-xs',
                  activeFilter === filter.key ? 'bg-background/20' : 'bg-muted'
                )}>
                  {filter.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border py-16 text-center">
            <PackageOpen className="h-16 w-16 text-muted-foreground/50" />
            <h2 className="mt-4 text-lg font-medium">
              {activeFilter === 'all' ? 'Belum ada pesanan' : `Tidak ada pesanan ${statusConfig[activeFilter as OrderStatus]?.label.toLowerCase() || ''}`}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {activeFilter === 'all'
                ? 'Mulai berbelanja untuk melihat pesanan Anda di sini.'
                : 'Coba ubah filter atau lihat semua pesanan.'}
            </p>
            {activeFilter === 'all' ? (
              <Link
                href="/shop"
                className="mt-6 inline-block bg-foreground px-6 py-3 text-background hover:bg-foreground/80"
              >
                Mulai Belanja
              </Link>
            ) : (
              <button
                onClick={() => setActiveFilter('all')}
                className="mt-6 border px-6 py-3 hover:bg-muted"
              >
                Lihat Semua Pesanan
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const config = statusConfig[order.status];
              const StatusIcon = config.icon;

              return (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.orderNumber}`}
                  className="group block border transition-all hover:shadow-md"
                >
                  {/* Order Header */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b bg-muted/30 p-4">
                    <div className="flex items-center gap-4">
                      <div className={cn('rounded-full p-2', config.bgColor)}>
                        <StatusIcon className={cn('h-4 w-4', config.color)} />
                      </div>
                      <div>
                        <p className="font-medium">{order.orderNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className={cn('inline-block rounded-sm px-3 py-1 text-xs font-medium', config.bgColor, config.color)}>
                          {config.label}
                        </span>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {statusDescriptions[order.status]}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="p-4">
                    <div className="flex flex-wrap gap-3">
                      {order.items.slice(0, 4).map((item) => (
                        <div key={item.id} className="relative h-16 w-16 overflow-hidden bg-muted">
                          <Image
                            src={item.image}
                            alt={item.productName}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                      {order.items.length > 4 && (
                        <div className="flex h-16 w-16 items-center justify-center bg-muted text-sm font-medium">
                          +{order.items.length - 4}
                        </div>
                      )}
                    </div>

                    {/* Order Summary */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t pt-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {order.items.length} item
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-muted-foreground">Total: </span>
                        <span className="font-semibold">{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Container>
    </LayoutClient>
  );
}
