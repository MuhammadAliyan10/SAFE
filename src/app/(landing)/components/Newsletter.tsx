import React, { useState } from "react";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      // toast({
      //   title: "Please enter your email address",
      //   variant: "destructive",
      // });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      // toast({
      //   title: "Welcome to SAFE!",
      //   description:
      //     "You'll receive updates about new features and financial tips.",
      // });
      setEmail("");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <section
      id="newsletter"
      className="bg-gradient-to-br from-blue-600 to-purple-700 py-16"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 animate-on-scroll">
        <div className="max-w-4xl mx-auto text-center text-white">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium mb-6">
            <span>Stay Updated</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Get Financial Tips & Updates
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Subscribe to receive weekly financial insights, feature updates, and
            exclusive tips to grow your business.
          </p>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col md:flex-row gap-4 items-center justify-center max-w-md mx-auto"
          >
            <div className="relative flex-grow w-full">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-6 py-4 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-white text-gray-700 placeholder-gray-400"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-4 px-8 rounded-full transition-all duration-300 whitespace-nowrap w-full md:w-auto"
            >
              {isSubmitting ? "Subscribing..." : "Subscribe"}
            </button>
          </form>

          <p className="text-sm text-blue-200 mt-4">
            No spam, unsubscribe at any time. We respect your privacy.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
