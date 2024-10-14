import { SearchForm } from "@/components/home/search-car";
import { Button } from "@/components/ui/button";

import { ArrowRightIcon } from "@radix-ui/react-icons";

export const LandingPage = () => {
  return (
    <div className="bg-gradient-to-b from-[#FBB80E] to-[#F7981D] min-h-[calc(100vh-64px)] flex flex-col justify-center">
      <div className="h-[85vh] md:h-full px-6 flex flex-col justify-center">
        <h1 className="text-5xl lg:text-6xl font-bold text-white md:text-center pr-2 md:px-4 py-8">
          Book your car online in minutes and pick it up at a convenient
          location!
        </h1>
        <Button
          asChild
          className="w-1/2 md:hidden"
          variant="secondary"
          size="lg"
        >
          <a href="#booknow">
            Book Now <ArrowRightIcon className="size-5 ml-1" />
          </a>
        </Button>
      </div>
      <div id="booknow" className="bg-black/90 md:bg-transparent mt-16 pb-16 md:mt-0 p-4">
        <h2 className="text-3xl font-bold text-white text-center md:hidden my-10">
          Book your car now!
        </h2>
        <SearchForm />
      </div>
    </div>
  );
};
