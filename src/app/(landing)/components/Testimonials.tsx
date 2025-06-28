import React, { useRef } from "react";

interface TestimonialProps {
  content: string;
  author: string;
  role: string;
  gradient: string;
  backgroundImage?: string;
}

const testimonials: TestimonialProps[] = [
  {
    content:
      "SAFE transformed how I manage my freelance business. The AI insights helped me increase my monthly revenue by 40% and I never miss a payment deadline anymore.",
    author: "Ahmed Hassan",
    role: "Freelance Web Developer, Karachi",
    gradient: "from-blue-700 via-indigo-800 to-purple-900",
    backgroundImage: "/background-section1.png",
  },
  {
    content:
      "The automated invoicing and client management features saved me 10 hours per week. I can focus on my design work instead of chasing payments.",
    author: "Fatima Khan",
    role: "Graphic Designer & Brand Consultant",
    gradient: "from-indigo-900 via-purple-800 to-orange-500",
    backgroundImage: "/background-section2.png",
  },
  {
    content:
      "Managing multiple currencies was a nightmare before SAFE. Now I can work with international clients seamlessly and track everything in one place.",
    author: "Muhammad Ali",
    role: "Digital Marketing Consultant",
    gradient: "from-purple-800 via-pink-700 to-red-500",
    backgroundImage: "/background-section3.png",
  },
  {
    content:
      "The expense tracking with OCR is a game-changer. I just snap photos of receipts and SAFE handles the rest. Tax season is no longer stressful.",
    author: "Saira Malik",
    role: "Content Writer & Social Media Manager",
    gradient: "from-orange-600 via-red-500 to-purple-600",
    backgroundImage: "/background-section1.png",
  },
];

const TestimonialCard = ({
  content,
  author,
  role,
  backgroundImage = "/background-section1.png",
}: TestimonialProps) => {
  return (
    <div
      className="bg-cover bg-center rounded-xl p-8 h-full flex flex-col justify-between text-white transform transition-transform duration-300 hover:-translate-y-2 relative overflow-hidden shadow-xl"
      style={{ backgroundImage: `url('${backgroundImage}')` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-purple-900/80"></div>

      <div className="relative z-10">
        <div className="text-4xl text-blue-300 mb-4">"</div>
        <p className="text-lg mb-8 font-medium leading-relaxed">{content}</p>
        <div>
          <h4 className="font-semibold text-xl">{author}</h4>
          <p className="text-blue-200">{role}</p>
        </div>
      </div>
    </div>
  );
};

const Testimonials = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  return (
    <section
      className="py-16 bg-white relative"
      id="testimonials"
      ref={sectionRef}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 opacity-0 animate-on-scroll">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4">
            <span>Success Stories</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            What Our Users Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of freelancers and small businesses who have
            transformed their financial management with SAFE.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              content={testimonial.content}
              author={testimonial.author}
              role={testimonial.role}
              gradient={testimonial.gradient}
              backgroundImage={testimonial.backgroundImage}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
