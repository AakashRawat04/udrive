import { Star, DollarSign, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export const ServiceCards = () => {
  const { t } = useTranslation();
  const cardData = [
    {
      icon: <Star className="h-8 w-8" />,
      title: t("services.service-1.title"),
      description: t("services.service-1.description"),
    },
    {
      icon: <DollarSign className="h-8 w-8" />,
      title: t("services.service-2.title"),
      description: t("services.service-2.description"),
    },
    {
      icon: <CheckCircle className="h-8 w-8" />,
      title: t("services.service-3.title"),
      description: t("services.service-3.description"),
    },
  ];

  const floatingSymbols = [
    { symbol: "🚗", color: "text-red-500", top: "10%", left: "5%" },
    { symbol: "🔑", color: "text-yellow-500", top: "30%", right: "10%" },
    { symbol: "💼", color: "text-blue-500", bottom: "20%", left: "15%" },
    { symbol: "🛣️", color: "text-green-500", bottom: "10%", right: "5%" },
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
            animation: `float 6s ease-in-out infinite ${index * 1.5}s`,
          }}
        >
          {symbol.symbol}
        </div>
      ))}
      <h2 className="text-4xl font-bold text-white mb-4 relative z-10 text-center">
        {t("services.title")}
      </h2>
      <p className="text-white mb-8 relative z-10 text-center max-w-2xl">
        {t("services.subtitle")}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 pt-24">
        {cardData.map((card, index) => (
          <div key={index} className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-gray-200 p-4 rounded-lg">{card.icon}</div>
            </div>
            <h3 className="text-white text-xl font-semibold mb-2">
              {card.title}
            </h3>
            <p className="text-white text-lg">{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
