import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { LayoutClient } from '@/components/layout/LayoutClient';
import { Container, FadeIn } from '@/components/shared';

export const metadata: Metadata = {
  title: 'New Season Collections',
  description: 'Explore our seasonal collections - Spring, Summer, Autumn, and Winter.',
};

const seasons = [
  {
    slug: 'spring',
    name: 'Spring Collection',
    description: 'Fresh blooms and lighter layers',
    image: 'https://images.pexels.com/photos/2681252/pexels-photo-2681252.jpeg',
  },
  {
    slug: 'summer',
    name: 'Summer Collection',
    description: 'Light fabrics and vibrant styles',
    image: 'https://images.pexels.com/photos/6311390/pexels-photo-6311390.jpeg',
  },
  {
    slug: 'autumn',
    name: 'Autumn Collection',
    description: 'Earthy tones and layered looks',
    image: 'https://images.pexels.com/photos/4210866/pexels-photo-4210866.jpeg',
  },
  {
    slug: 'winter',
    name: 'Winter Collection',
    description: 'Luxurious layers and elegant outerwear',
    image: 'https://images.pexels.com/photos/1457986/pexels-photo-1457986.jpeg',
  },
];

export default function NewSeasonPage() {
  return (
    <LayoutClient>
      {/* Hero */}
      <section className="relative h-[50vh] sm:h-[60vh]">
        <div className="absolute inset-0">
          <Image
            src="https://images.pexels.com/photos/6311390/pexels-photo-6311390.jpeg"
            alt="New Season"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <Container className="relative flex h-full items-center justify-center text-center">
          <FadeIn>
            <h1 className="font-serif text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
              New Season
            </h1>
            <p className="mt-4 text-lg text-white/80">
              Discover our curated collections for every season
            </p>
          </FadeIn>
        </Container>
      </section>

      {/* Season Grid */}
      <section className="py-12 lg:py-16">
        <Container>
          <div className="grid gap-6 sm:grid-cols-2">
            {seasons.map((season, idx) => (
              <FadeIn key={season.slug} delay={idx * 100}>
                <Link
                  href={`/season/${season.slug}`}
                  className="group relative block aspect-[16/9] overflow-hidden"
                >
                  <Image
                    src={season.image}
                    alt={season.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h2 className="font-serif text-2xl font-semibold">{season.name}</h2>
                    <p className="mt-1 text-white/80">{season.description}</p>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>
    </LayoutClient>
  );
}
