import { useGsapFadeIn } from '@/hooks/use-gsap';
import { Card, CardContent } from '@/components/ui/card';
import { Construction } from 'lucide-react';

export default function PlaceholderPage({ title }: { title: string }) {
  const ref = useGsapFadeIn(0);

  return (
    <div ref={ref} className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full border-border/50 shadow-sm">
        <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Construction className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              This page is under construction. Check back soon!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
