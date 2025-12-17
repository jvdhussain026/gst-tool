import { Footer } from "@/components/gst-automator/footer";
import { Header } from "@/components/gst-automator/header";

export default function TermsOfServicePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto prose prose-neutral dark:prose-invert">
          <h1>Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By using the GST File Automator tool (the "Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            The Service is a free, web-based tool that extracts data from Goods and Services Tax (GST) invoice PDF files and converts it into an Excel format. The Service operates entirely on the client-side, meaning all processing occurs within your web browser on your own device.
          </p>
          
          <h2>3. Privacy and Data</h2>
          <p>
            Your privacy is critically important to us. As described in our <a href="/privacy-policy">Privacy Policy</a>, your files and data are never uploaded, stored, or transmitted to our servers. We have no access to your financial information.
          </p>

          <h2>4. User Responsibilities</h2>
          <p>
            You are solely responsible for the files you process and the accuracy of the data you work with. You agree not to use the Service for any unlawful purpose. You acknowledge that you are responsible for verifying the accuracy of the extracted data before use.
          </p>

          <h2>5. Disclaimer of Warranties</h2>
          <p>
            The Service is provided "as is" and "as available" without any warranties of any kind, express or implied. We do not warrant that the Service will be error-free, uninterrupted, or that the results of using the Service will be accurate or reliable. You use the Service at your own risk.
          </p>

          <h2>6. Limitation of Liability</h2>
          <p>
            In no event shall GST File Automator or its creators be liable for any direct, indirect, incidental, special, consequential, or exemplary damages, including but not limited to, damages for loss of profits, goodwill, use, data, or other intangible losses (even if we have been advised of the possibility of such damages), resulting from the use or the inability to use the Service.
          </p>

          <h2>7. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms of Service at any time. We will notify you of any changes by posting the new Terms of Service on this page. Your continued use of the Service after any such changes constitutes your acceptance of the new Terms of Service.
          </p>

          <h2>8. Governing Law</h2>
          <p>
            These Terms of Service shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
