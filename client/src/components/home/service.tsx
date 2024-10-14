import { Star, DollarSign, CheckCircle } from 'lucide-react';

export const ServiceCards = () => {
  const cardData = [
    {
      icon: <Star className="h-8 w-8" />,
      title: "Quality Choice",
      description: "We offer a wide range of high-quality vehicles to choose from, including luxury cars, SUVs, vans, and more."
    },
    {
      icon: <DollarSign className="h-8 w-8" />,
      title: "Affordable Prices",
      description: "Our rental rates are highly competitive and affordable, allowing our customers to enjoy their trips without breaking the bank."
    },
    {
      icon: <CheckCircle className="h-8 w-8" />,
      title: "Convenient Online Booking",
      description: "With our easy-to-use online booking system, customers can quickly and conveniently reserve their rental car from anywhere, anytime."
    }
  ];

  const floatingSymbols = [
    { symbol: '🚗', color: 'text-red-500', top: '10%', left: '5%' },
    { symbol: '🔑', color: 'text-yellow-500', top: '30%', right: '10%' },
    { symbol: '💼', color: 'text-blue-500', bottom: '20%', left: '15%' },
    { symbol: '🛣️', color: 'text-green-500', bottom: '10%', right: '5%' },
  ];

  return (
    <div className="bg-black bg-opacity-90 p-8 pt-24 relative overflow-hidden flex flex-col items-center pb-36">
      {floatingSymbols.map((symbol, index) => (
        <div
          key={index}
          className={`absolute ${symbol.color} text-4xl animate-float`}
          style={{
            top: symbol.top,
            left: symbol.left,
            right: symbol.right,
            bottom: symbol.bottom,
            animation: `float 6s ease-in-out infinite ${index * 1.5}s`
          }}
        >
          {symbol.symbol}
        </div>
      ))}
      <h2 className="text-4xl font-bold text-white mb-4 relative z-10 text-center">Unbeatable Service & Convenience</h2>
      <p className="text-white mb-8 relative z-10 text-center max-w-2xl">To make renting easy and hassle-free, we provide a variety of services and advantages. We have you covered with a variety of vehicles and flexible rental terms.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 pt-24">
        {cardData.map((card, index) => (
          <div key={index} className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-gray-200 p-4 rounded-lg">
                {card.icon}
              </div>
            </div>
            <h3 className="text-white text-xl font-semibold mb-2">{card.title}</h3>
            <p className="text-white text-lg">{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
