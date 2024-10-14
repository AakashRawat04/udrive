import { BrandLogo } from "./logo";
import { Button } from "./ui/button";

export const Footer = () => {
  return (
    <footer className="bg-black bg-opacity-90 text-white py-16" id="contactus">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <h3 className="text-xl font-bold mb-2">Have a question? We're here to help!</h3>
          <Button>
            <a href="mailto:info@udrive.com">
              Contact Us
            </a>
          </Button>
        </div>
        <div className="text-center md:text-right">
          <BrandLogo />
          <p className="text-sm mt-2">© 2021 Udrive. All rights reserved.</p>
        </div>
      </div>
  </footer>
  );
};
