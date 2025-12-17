import { Footer } from "@/components/gst-automator/footer";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="py-4 border-b">
        <div className="container mx-auto px-4">
          <Link href="/" className="text-2xl font-bold">GST File Automator</Link>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto prose prose-neutral dark:prose-invert">
          <h1>Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <h2>Introduction</h2>
          <p>
            Welcome to GST File Automator. We are committed to protecting your privacy. This Privacy Policy explains how we handle your information when you use our tool. Our core principle is privacy-by-design, which means we are fundamentally built to protect your data.
          </p>
          
          <h2>The Information We Don't Collect</h2>
          <p>
            This is the most important section of our Privacy Policy. We do NOT collect, store, or have access to:
          </p>
          <ul>
            <li>Your PDF files.</li>
            <li>Any financial data contained within your invoices.</li>
            <li>Any personally identifiable information (PII) extracted from your invoices.</li>
          </ul>
          <p>
            All processing of your PDF files happens entirely on your own computer, within your web browser. Your files are never uploaded to our servers or any third-party server.
          </p>
          
          <h2>How the Tool Works</h2>
          <ol>
            <li><strong>File Processing:</strong> When you select a PDF file, it is read by your browser.</li>
            <li><strong>Local Text Extraction:</strong> JavaScript running in your browser extracts the text content from the PDF. The file itself is not transmitted.</li>
            <li><strong>AI Fallback (Anonymous Text):</strong> In cases where our standard, rule-based extractor fails, only the extracted, raw text is sent to a generative AI model for analysis. This text is processed anonymously and is not stored or logged in connection with any personal identifiers. The AI's purpose is solely to structure the data from the text you provide.</li>
          </ol>
          
          <h2>Data Security</h2>
          <p>
            Since your files and the sensitive data within them are never sent to us, the security of your data remains in your control. The process is as secure as keeping the files on your own computer because that's where they stay.
          </p>
          
          <h2>Cookies</h2>
          <p>
            We do not use cookies for tracking or advertising purposes. The application uses local storage only to maintain the state of your current session (e.g., the list of processed files), which is cleared when you close the tab.
          </p>
          
          <h2>Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
          </p>
          
          <h2>Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, you can contact us. However, please note that since we do not store any user data, we are unable to process requests for data access, correction, or deletion.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}