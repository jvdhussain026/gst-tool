import { Badge } from "@/components/ui/badge";

export function HeroSection() {
  return (
    <section className="text-center lg:text-left">
      <Badge variant="outline" className="mb-4 text-accent border-accent">Privacy First & No Login Required</Badge>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline">
        Convert GST Invoice PDFs to Excel, Instantly.
      </h1>
      <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0">
        Free, accurate, and fast. Upload multiple GST invoices and get a clean, accountant-ready Excel file in seconds. Say goodbye to manual data entry.
      </p>
    </section>
  );
}
