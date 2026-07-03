import { LayoutClient } from '@/components/layout/LayoutClient';
import { Container, FadeIn } from '@/components/shared';
import Link from 'next/link';

export function ComingSoon({ title }: { title: string }) {
  return (
    <LayoutClient>
      <section className="bg-cream-100 py-24 lg:py-32 flex-1 flex flex-col items-center justify-center text-center">
        <Container>
          <FadeIn>
            <h1 className="font-serif text-4xl font-bold sm:text-5xl lg:text-6xl mb-6">
              {title}
            </h1>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-lg mb-10">
              We're currently crafting this page to give you the best experience. 
              Please check back soon!
            </p>
            <Link
              href="/"
              className="inline-block bg-foreground text-background px-8 py-3 text-sm font-medium transition-colors hover:bg-foreground/90"
            >
              Back to Home
            </Link>
          </FadeIn>
        </Container>
      </section>
    </LayoutClient>
  );
}
