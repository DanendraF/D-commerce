import { Metadata } from 'next';
import { api } from '@/lib/api';

type Props = {
  params: { slug: string };
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const product = await api.getProductBySlug(params.slug);
    
    if (!product) {
      return {
        title: 'Product Not Found',
      };
    }

    return {
      title: product.name,
      description: product.shortDescription || product.description,
      openGraph: {
        title: `${product.name} | D'commerce`,
        description: product.shortDescription || product.description,
        images: product.images.length > 0 ? [product.images[0].url] : [],
      },
    };
  } catch (error) {
    return {
      title: 'Product',
    };
  }
}

export default function ProductLayout({ children }: Props) {
  // We simply wrap the client page component
  // The layout itself is a Server Component, so generateMetadata works perfectly!
  return (
    <>
      {children}
    </>
  );
}
