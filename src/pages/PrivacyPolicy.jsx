const PrivacyPolicy = () => {
  return (
    <main className="bg-white px-5 py-16 text-black md:px-20 md:py-24">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm uppercase tracking-[0.35em] text-black/50">
          Demo Page
        </p>
        <h1 className="mt-4 text-4xl font-semibold md:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-6 text-base leading-8 text-black/75 md:text-lg">
          This is a demo privacy policy page for the MMMK storefront. It is
          meant only to show how legal content can be linked and displayed on
          its own URL.
        </p>

        <section className="mt-10 space-y-5 text-base leading-8 text-black/80 md:text-lg">
          <p>
            We may collect basic information that customers choose to share,
            such as name, email address, phone number, shipping details, and
            order information.
          </p>
          <p>
            This information may be used to process orders, respond to support
            requests, improve the shopping experience, and send relevant service
            updates.
          </p>
          <p>
            We do not intend for this demo text to represent a final legal
            policy. Before launch, this page should be replaced with approved
            language from your legal or compliance team.
          </p>
          <p>
            If you have any questions about this demo policy, please contact the
            support team through the contact page.
          </p>
        </section>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
