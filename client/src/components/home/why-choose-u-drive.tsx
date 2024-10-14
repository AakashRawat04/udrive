import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Calendar, Smile } from 'lucide-react';

export const WhyChooseUdrive = () => {
  const cardData = [
    {
      icon: <Search className="h-6 w-6" />,
      title: "Browse and select",
      description: "Choose from our wide range of premium cars, select the pickup and return dates and locations that suit you best."
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Book and confirm",
      description: "Book your desired car with just a few clicks and receive an instant confirmation via email or SMS."
    },
    {
      icon: <Smile className="h-6 w-6" />,
      title: "Enjoy your ride",
      description: "Pick up your car at the designated location and enjoy your premium driving experience with our top-quality service."
    }
  ];

  return (
    <div className="container mx-auto px-4 h-screen pt-24 relative" id="about">
      <h2 className="text-3xl font-bold text-center mb-4">Why choose Udrive?</h2>
      <p className="text-center text-lg mb-8">
        Renting a luxury car has never been easier. Our streamlined process makes it simple for you to book and confirm your vehicle of choice online
      </p>
      <div className="grid grid-cols-1 w-full md:max-w-2xl md:ml-20 md:mt-20 gap-6 pt-6">
        {cardData.map((card, index) => (
          <Card key={index}>
            <CardContent className="flex items-start p-6">
              <div className="bg-primary/10 p-2 rounded-lg mr-4">
                {card.icon}
              </div>
              <div>
                <CardHeader className="p-0">
                  <CardTitle>{card.title}</CardTitle>
                </CardHeader>
                <p className="text-sm text-gray-600 mt-2 w-full md:max-w-md">{card.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <img src="/why-choose-u-drive.png" alt="why-choose-u-drive" className="absolute -right-40 -bottom-0 -z-50 hidden md:block" />
    </div>
  );
};
