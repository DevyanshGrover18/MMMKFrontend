import bgImg from '../../src/assets/bg.png';

const ReturnPolicy = () => {
  return (
    <div style={{
        background: `url(${bgImg})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}>
      <main
      
      className=" px-5 bg-black bg-opacity-50 py-16 text-white md:px-20 md:py-24"
    >
      <div className="mx-auto max-w-4xl">
        <p className="text-sm uppercase tracking-[0.35em] text-white/50">
          Demo Page
        </p>
        <h1 className="mt-4 text-4xl font-semibold md:text-5xl">
          Return Policy
        </h1>
        <p className="mt-6 text-base leading-8 text-white/75 md:text-lg">
          This is a demo return policy page created for URL linking and layout
          testing. The text below is placeholder content and should be replaced
          before production use.
        </p>

        <section className="mt-10 space-y-5 text-base leading-8 text-white/80 md:text-lg">
          <p>
            Customers may request a return within a limited period after
            receiving their order, provided the item is unused and in its
            original condition.
          </p>
          <p>
            Return requests would normally need proof of purchase and may be
            reviewed before approval. Shipping charges and final-sale items may
            be excluded depending on the store policy.
          </p>
          <p>
            Refund timing, exchange options, and return eligibility should be
            confirmed with the final business rules once they are available.
          </p>
          <p>
            For this demo, the page simply exists so users can open a dedicated
            return policy URL from the footer or direct links.
          </p>
        </section>
      </div>
    </main>
    </div>
  );
};

export default ReturnPolicy;
