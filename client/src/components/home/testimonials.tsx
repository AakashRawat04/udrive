import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "John Doe",
    role: "CEO, TechCorp",
    content: "This product has truly revolutionized our workflow at TechCorp. From the moment we implemented it, we saw an immediate boost in productivity and collaboration across all departments. The intuitive interface made it easy for even our less tech-savvy team members to adapt quickly. What impressed me most was the scalability - as our company grew, the product seamlessly accommodated our expanding needs. The customer support team has been exceptional, always ready to assist with any questions or customization requests. The analytics features have provided invaluable insights, helping us make data-driven decisions that have positively impacted our bottom line. I can confidently say that this investment has paid for itself many times over. For any business looking to streamline operations and foster better teamwork, I highly recommend this product without hesitation.",
  },
  {
    id: 2,
    name: "Jane Smith",
    role: "Marketing Director, CreativeHub",
    content: "As the Marketing Director at CreativeHub, I've worked with numerous collaboration tools, but this solution stands head and shoulders above the rest. It has become an integral part of our creative process, enabling our team to brainstorm, share ideas, and execute campaigns with unprecedented efficiency. The real-time collaboration features have been a game-changer, allowing us to work seamlessly across different time zones and locations. What sets this product apart is its perfect balance of functionality and simplicity. It offers advanced features without overwhelming users, making it accessible to team members with varying levels of technical expertise. The customizable workflows have allowed us to tailor the platform to our specific needs, resulting in a significant reduction in project turnaround times. Moreover, the robust security measures give us peace of mind when handling sensitive client information. Since adopting this tool, we've seen a marked improvement in client satisfaction and project outcomes. It's not just a product; it's a catalyst for creativity and productivity.",
  },
  {
    id: 3,
    name: "Mike Johnson",
    role: "Freelance Designer",
    content: "As a freelance designer, finding the right tools to manage my projects and client relationships is crucial. This product has been nothing short of a revelation for my business. It has streamlined every aspect of my workflow, from initial client briefs to final deliverables. The project management features are comprehensive yet intuitive, allowing me to track progress, set milestones, and manage deadlines with ease. I particularly appreciate the client portal, which has dramatically improved communication and reduced misunderstandings. The ability to integrate with other design tools I use daily has created a seamless ecosystem that has boosted my productivity significantly. Perhaps most importantly, it has freed up time I used to spend on administrative tasks, allowing me to focus more on what I love - designing. The mobile app ensures I stay connected and responsive even when I'm away from my desk. This tool has not only improved my work quality but also helped me take on more projects and grow my business. I can't imagine working without it now - it's become as essential to my practice as my design software. For any freelancer or small business owner, this product is an absolute must-have.",
  },
];

export const TestimonialSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="bg-gray-100 py-20">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-bold">What Our Customers Say</h2>
          <div className="flex">
            <Button variant="outline" size="icon" onClick={prevTestimonial} className="mr-2">
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextTestimonial}>
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        </div>
        <div className="text-left">
          <p className="text-xl mb-4">"{testimonials[currentIndex].content}"</p>
          <div className="flex flex-col">
            <span className="font-semibold">{testimonials[currentIndex].name}</span>
            <span className="text-sm text-gray-500">{testimonials[currentIndex].role}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
