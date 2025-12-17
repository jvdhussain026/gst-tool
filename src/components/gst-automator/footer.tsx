import Link from "next/link";

export function Footer() {
    return (
      <footer className="bg-card border-t mt-12">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground text-sm">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-base font-semibold text-foreground">How It Works & Your Privacy</h3>
            <div className="mt-4 space-y-2 text-left">
              <p>
                <strong className="text-foreground">1. Your Files Stay on Your Computer:</strong> When you upload a PDF, it is processed entirely within your web browser. Your invoice files are never uploaded to any server, ensuring your financial data remains private.
              </p>
              <p>
                <strong className="text-foreground">2. Local Text Extraction:</strong> Our tool reads the text from your PDF locally. If the invoice is in a standard format, our rule-based system extracts the data without needing AI.
              </p>
              <p>
                <strong className="text-foreground">3. AI as a Fallback:</strong> Only when an invoice is in an unusual format, the extracted text (and only the text) is sent to an AI model to find and correct the data. The original file never leaves your browser.
              </p>
            </div>
            <div className="mt-6 flex justify-center items-center space-x-4">
              <p className="font-semibold">
                Designed & built by AI
              </p>
              <span className="text-muted-foreground/50">|</span>
              <Link href="/privacy-policy" className="underline hover:text-foreground">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    );
  }