import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Calendar, Smile } from "lucide-react";
import { useTranslation } from "react-i18next";

export const WhyChooseUdrive = () => {
  const { t } = useTranslation();
  const cardData = [
    {
      icon: <Search className="h-6 w-6" />,
      title: t("why-choose-udrive.reason-1.title"),
      description: t("why-choose-udrive.reason-1.description"),
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: t("why-choose-udrive.reason-2.title"),
      description: t("why-choose-udrive.reason-2.description"),
    },
    {
      icon: <Smile className="h-6 w-6" />,
      title: t("why-choose-udrive.reason-3.title"),
      description: t("why-choose-udrive.reason-3.description"),
    },
  ];

  return (
    <div
      className="h-screen pt-24 p-4 relative w-full overflow-hidden"
      id="about"
    >
      <h2 className="text-3xl font-bold text-center mb-4">
        {t("why-choose-udrive.title")}
      </h2>
      <p className="text-center text-lg mb-8">
        {t("why-choose-udrive.subtitle")}
      </p>
      <div className="grid grid-cols-1 w-full md:max-w-2xl md:ml-48 md:mt-40 gap-6 pt-6">
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
                <p className="text-sm text-gray-600 mt-2 w-full md:max-w-md">
                  {card.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <img
        src="/why-choose-u-drive.png"
        alt="why-choose-u-drive"
        className="absolute -right-10 -bottom-10 -z-50 hidden md:block"
      />
    </div>
  );
};
