import InquiryForm from '@/components/forms/InquiryForm';

export const metadata = {
  title: 'Contact Us | Local Services Directory',
  description: 'Submit an inquiry or get in touch with us. We\'re here to help with any questions about our local services directory.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have a question or want to learn more about our services? Fill out the form below and we'll get back to you as soon as possible.
          </p>
        </div>

        <InquiryForm />

        <div className="mt-12 text-center text-gray-600">
          <p>
            For immediate assistance, you can also reach us at:{' '}
            <a
              href="mailto:support@localservices.com"
              className="text-blue-600 hover:text-blue-800"
            >
              support@localservices.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
