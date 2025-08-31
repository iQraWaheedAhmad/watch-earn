'use client';
import Image from 'next/image';
import { Typewriter } from 'react-simple-typewriter';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const typewriterWords = [
  'Earn rewards by watching videos!',
  'Start now and turn your free time into cash!',
  'Get paid to watch videos!',
  'Your time is valuable!',
];

const sliderImages = [
  "/P4.jpg",
  "/img.jpg",
  "/p4.jpg",
  "/img3.jpg",
];

export default function Hero() {
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 1000,
    pauseOnHover: true,
    arrows: false,
  };

  return (
    <section className="bg-gray-900 min-h-screen flex flex-col lg:flex-row items-center justify-center pt-20 lg:pt-24 px-6 lg:px-12">
      {/* Left Content */}
      <div className="flex-1 flex flex-col items-center lg:items-start space-y-6 text-center lg:text-left max-w-lg">
        <h1 className="text-4xl sm:text-5xl font-bold text-white">
          Watch And Earn
          <br />
          <span className="text-yellow-500">
            <Typewriter
              words={typewriterWords}
              loop={true}
              cursor
              cursorStyle="|"
              typeSpeed={70}
              deleteSpeed={50}
              delaySpeed={1000}
            />
          </span>
        </h1>
        <p className="font-semibold text-lg text-white">
          &quot;Watch Videos and Start Earning with Minimal Investment!&quot;
        </p>
        <div className="text-lg text-white max-w-md space-y-4">
          <ul className="list-disc list-inside space-y-1 marker:text-yellow-400">
            <li>💸 For 10 referrals, $100 profit.</li>
            <li>💸 For 20 referrals, $200 profit.</li>
            <li>💸 For 30 referrals, $300 profit.</li>
            <li>💸 For 40 referrals, $400 profit.</li>
            <li>💸 For 50 referrals, $500 profit.</li>
          </ul>
          <p>
            It’s simple, fun, and perfect for beginners. Don&apos;t miss out on this chance to grow your income!
            <br />
            <strong>Get started today and see the difference.</strong> Your journey to earning begins now! 🚀
          </p>
        </div>
      </div>

      {/* Right Side - Moving Image Slider */}
      <div className="flex-1 flex justify-center lg:justify-end mt-10 lg:mt-0 w-full max-w-lg">
        <Slider {...sliderSettings} className="w-full">
          {sliderImages.map((img, index) => (
            <div key={index} className="flex justify-center">
              <div className="w-full h-[400px] flex items-center justify-center">
                <Image
                  src={img}
                  alt={`Slide ${index + 1}`}
                  width={400} // Matches text section
                  height={300} // Consistent height
                  className="rounded-full object-cover shadow-lg"
                />
              </div>
            </div>
          ))}
        </Slider>
      
      </div>
    </section>
  );
}
