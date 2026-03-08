import { Skeleton } from '@/components/ui/skeleton';

export function HeroSkeleton() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
      <div className="container mx-auto px-4 text-center space-y-6">
        <Skeleton className="h-8 w-48 mx-auto rounded-full" />
        <Skeleton className="h-16 w-[80%] mx-auto" />
        <Skeleton className="h-12 w-[60%] mx-auto" />
        <Skeleton className="h-6 w-[50%] mx-auto" />
        <div className="flex justify-center gap-4 pt-4">
          <Skeleton className="h-12 w-40 rounded-xl" />
          <Skeleton className="h-12 w-40 rounded-xl" />
        </div>
      </div>
    </section>
  );
}

export function CardSkeleton({ count = 3, aspect = 'aspect-[4/3]' }: { count?: number; aspect?: string }) {
  return (
    <div className={`grid grid-cols-1 ${count >= 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : count === 3 ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2'} gap-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl overflow-hidden bg-card border border-border/30">
          <Skeleton className={`w-full ${aspect}`} />
          <div className="p-5 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <div className="flex justify-between items-center pt-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-9 w-24 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SectionSkeleton({ title = true }: { title?: boolean }) {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        {title && (
          <div className="text-center mb-14 space-y-4">
            <Skeleton className="h-6 w-36 mx-auto rounded-full" />
            <Skeleton className="h-12 w-[60%] mx-auto" />
            <Skeleton className="h-5 w-[40%] mx-auto" />
          </div>
        )}
        <CardSkeleton />
      </div>
    </section>
  );
}

export function TestimonialSkeleton() {
  return (
    <section className="py-20 md:py-28 bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14 space-y-4">
          <Skeleton className="h-6 w-36 mx-auto rounded-full" />
          <Skeleton className="h-12 w-[50%] mx-auto" />
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl bg-card/60 p-10 space-y-6">
            <div className="flex gap-1.5">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="w-5 h-5 rounded" />)}
            </div>
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-8 w-1/2" />
            <div className="flex items-center gap-4 pt-6">
              <Skeleton className="w-14 h-14 rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
