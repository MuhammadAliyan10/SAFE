import React from "react";

const MadeByHumans = () => {
  return (
    <section id="made-by-humans" className="w-full bg-white py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 animate-on-scroll">
        <div className="w-full rounded-2xl sm:rounded-3xl overflow-hidden relative">
          <div
            className="bg-no-repeat bg-cover bg-center p-8 sm:p-12 min-h-[300px] sm:min-h-[400px] flex flex-col justify-between relative"
            style={{ backgroundImage: "url('/background-section3.png')" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-purple-900/80"></div>

            <div className="relative z-10 flex items-center text-white">
              <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mr-4">
                <span className="text-2xl">💼</span>
              </div>
              <span className="text-white text-xl font-medium">
                SAFE Financial Platform
              </span>
            </div>

            <div className="relative z-10 text-center">
              <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold text-white mb-4">
                Built for <span className="italic">Pakistani</span> Freelancers
              </h2>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Designed with local payment methods, FBR compliance, and Urdu
                support - because we understand your unique needs.
              </p>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/10 rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MadeByHumans;
