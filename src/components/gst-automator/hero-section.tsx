import { Badge } from "@/components/ui/badge";

export function HeroSection() {
  return (
    <section className="text-center">
      <Badge variant="outline" className="mb-4 text-accent border-accent">100% Free & Privacy-First</Badge>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline">
        Convert GST Invoice PDFs to Excel, Instantly.
      </h1>
      <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
        Tired of manual data entry? Upload multiple GST invoices from suppliers like Voltas, Blue Star, and others. Our tool accurately extracts the data and gives you a clean, accountant-ready Excel file in seconds. No login required.
      </p>
    </section>
  );
}
