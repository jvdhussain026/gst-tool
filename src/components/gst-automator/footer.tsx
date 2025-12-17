export function Footer() {
    return (
      <footer className="bg-card border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground text-sm">
          <p className="font-semibold text-green-600">
            Your files are processed locally in your browser and are never uploaded to a server.
          </p>
          <p className="mt-2">
            This tool automates converting GST invoice PDFs to Excel. It's free, fast, and respects your privacy.
          </p>
          <p className="mt-2 font-semibold">
            Designed & built by AI
          </p>
        </div>
      </footer>
    );
  }
  