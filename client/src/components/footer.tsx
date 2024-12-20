import { BRAND_EMAIL } from "@/constants/brand";
import { BrandLogo } from "./logo";
import { Button } from "./ui/button";
import { useTranslation } from "react-i18next";

export const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-black bg-opacity-90 text-white py-16" id="contactus">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <h3 className="text-xl font-bold mb-2">
            {t("have-a-question")}
          </h3>
          <Button>
            <a
              href={`mailto:${BRAND_EMAIL}?subject=Support Request&body=Hi uDrive, I have a question about...`}
            >
              {t("contact-us")}
            </a>
          </Button>
        </div>
        <div className="text-center md:text-right">
          <BrandLogo />
          <p className="text-sm mt-2">
            © {new Date().getFullYear()} uDrive. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
