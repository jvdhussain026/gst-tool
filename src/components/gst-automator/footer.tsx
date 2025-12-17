import Link from "next/link";

export function Footer() {
    return (
      <footer className="bg-card border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground text-sm">
          <div className="flex justify-center items-center space-x-4">
            <p className="font-semibold">
              Designed & built by AI
            </p>
            <span className="text-muted-foreground/50">|</span>
            <Link href="/privacy-policy" className="underline hover:text-foreground">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    );
  }
