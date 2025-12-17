import Link from "next/link";

export function Footer() {
    return (
      <footer className="bg-card border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground text-sm">
          <div className="flex justify-center items-center space-x-4 mb-2">
            <Link href="/privacy-policy" className="underline hover:text-foreground">
              Privacy Policy
            </Link>
            <span className="text-muted-foreground/50">|</span>
            <Link href="/terms-of-service" className="underline hover:text-foreground">
              Terms of Service
            </Link>
          </div>
          <p>
            Designed & built by <span className="font-semibold text-foreground">Javed Hussain</span>
          </p>
        </div>
      </footer>
    );
  }
