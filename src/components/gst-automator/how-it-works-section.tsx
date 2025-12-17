export function HowItWorksSection() {
    return (
      <section className="bg-card border rounded-lg p-6 md:p-8">
        <h2 className="text-2xl font-bold tracking-tight mb-4 font-headline">
          How It Works & Your Privacy
        </h2>
        <div className="space-y-4 text-muted-foreground">
          <p>
            <strong className="text-foreground">1. Your Files Stay on Your Computer:</strong>{" "}
            When you upload a PDF, it is processed entirely within your web
            browser. Your invoice files are never uploaded to any server,
            ensuring your financial data remains 100% private.
          </p>
          <p>
            <strong className="text-foreground">2. Local Text Extraction:</strong>{" "}
            Our tool reads the text from your PDF locally using a rule-based system.
            If the invoice is in a standard format, our system extracts the
            data instantly without needing AI, making the process fast and
            reliable.
          </p>
          <p>
            <strong className="text-foreground">3. AI as a Smart Fallback:</strong>{" "}
            Only when an invoice is in an unusual or complex format, the
            extracted text (and only the text) is sent to an advanced AI model
            to intelligently find and structure the data. The original file
            never leaves your browser.
          </p>
        </div>
      </section>
    );
  }
  