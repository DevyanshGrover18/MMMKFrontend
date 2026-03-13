import React from 'react';
import Banner from './global/Banner';
import bgImg from '../assets/bg.png';
import NewsLetter from './global/NewsLetter';

const AboutUs = () => {
  return (
    <div className="w-full relative z-[10]">
      <Banner bg={bgImg}>
        <div className="text-white text-center md:h-[0vh] h-[20vh] flex flex-col items-center justify-center md:mt-16 md:mb-0 "></div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-full max-w-4xl p-6 bg-opacity-75 rounded-lg md:p-16">
            <h1 className="text-5xl font-bold text-center mb-6 text-white">
              About Us
            </h1>
            <p className="text-xl leading-relaxed text-white text-justify">
              MMM Her universe is that of a self-taught creator whose artistic
              sensitivity awakened at a very early age. As early as 1997, the
              moment when her creative language began to express itself
              instinctively, she started transforming emotions, memories, and
              experiences into unique pieces. Each creation tells a story her
              own, but also that of those who seek to express their identity
              with elegance and character. For a long time, she did not realize
              she was building a signature; she was simply following a deep
              instinct: transforming lived experience into beauty.
            </p>

            <p className="text-xl leading-relaxed text-white text-justify mt-10">
              In 1999, in Martinique, she created her first bikini sketch. Two
              years later, in 2001, a foundational gesture sealed this emerging
              vocation: her mother entrusted the drawing to an entrepreneur from
              French Guiana, active between Suriname and Brazil, to produce the
              very first prototype. This decisive and visionary support acted as
              a profound trigger creation ceased to be a purely intimate impulse
              and became a tangible reality. Shortly afterward, her father
              captured these early beginnings during a photoshoot on the beach
              of Saint-François, in Guadeloupe. Thus was born a universe guided
              by color, material, and intuition.
            </p>

            <p className="text-xl leading-relaxed text-white text-justify mt-10">
              Over the years, her creative language has been shaped through
              exploration, observation, and experimentation. Between Paris and
              Martinique, she sketched her first jewelry creations, refining an
              already distinctive eye for detail and aesthetic. Jewelry,
              sandals, dresses, everyday objects… each creation arises from an
              inner necessity: to give form to what words cannot yet express.
              Even in the quietest periods, creation becomes a refuge. The Covid
              era imposed a brutal pause, a forced silence, but also an
              essential moment of introspection. She then returned to her
              archives, redrew, reorganized, and questioned. Her art redefined
              itself, gaining clarity and rigor.
            </p>

            <p className="text-xl leading-relaxed text-white text-justify mt-10">
              It is at the end of this process of realignment and maturation
              that a new creative territory opened. On October 17, 2021, in the
              United Arab Emirates, she gave birth to her first perfume concepts
              not as a rupture, but as the natural culmination of an inner
              journey that had become more precise, more sensory, more intimate.
              Each piece today is the result of a precise inner path, a
              sensitive dialogue between materials and colors, and an assumed
              artisanal rigor. Nothing is left to chance: every line, every
              seam, every texture carries the memory of what shaped it, what
              inspires it, and what it seeks to transmit.
            </p>

            <p className="text-xl leading-relaxed text-white text-justify mt-10">
              From 2018 onward, West Africa began calling to her. But it is
              truly from this pivotal period that the Mother Earth fully took
              her place. Returning there almost every two months, drawing
              nourishment, breathing, observing, reconnects her to something
              greater than herself: strength, truth, the sacred. Africa did not
              inspire her creations it aligned them. It purified them. It
              returned them to their source. From then on, nothing was done at
              random.
            </p>

            <h1 className="text-5xl font-bold text-center mb-6 text-white mt-10">
              This is who she is
            </h1>
            <p className="text-xl leading-relaxed text-white text-justify">
              An intuitive and determined creator, shaped by experiences,
              silences, and rebirths. Each creation follows neither trends nor
              calculation; it is the reflection of a path, of a rare and untamed
              energy. What is revealed here is only an opening into her
              universe. Behind each piece stands a woman who is determined,
              intuitive, and indomitable an energy that is felt even before it
              is worn. Here, it is not simply about acquiring a creation; it is
              about adopting a story, a memory, a fragment of soul.
            </p>

            <p className="text-xl leading-relaxed text-white text-justify mt-10 italic">
              Stay attentive, for this house does not reveal only fashion… but a
              destiny, a force, a living art.
            </p>
            <h1 className="text-5xl font-bold text-center mb-6 text-white mt-10">
              Our Journey
            </h1>
          </div>
        </div>
        {/* Timeline Section */}
        <div className="flex justify-center">
          <div className="relative flex flex-col items-center">
            {/* Vertical line */}
            <div className="absolute top-0 h-full w-px bg-white/40"></div>

            {/* Item 1 */}
            <div className="flex items-center w-full mb-16 mt-16">
              <div className="w-1/2 text-right pr-10 text-white text-lg">
                <p className="font-semibold">1919</p>
                <p className="opacity-80 mt-2">
                  From the ancient Black Land (3rd Dynasty), an old kingdom, the
                  rise of a great soul.
                </p>
              </div>

              <div className="relative z-10 w-4 h-4 bg-white rounded-full"></div>
              <div className="w-1/2"></div>
            </div>

            {/* Item 2 */}
            <div className="flex items-center w-full mb-16">
              <div className="w-1/2"></div>
              <div className="relative z-10 w-4 h-4 bg-white rounded-full"></div>

              <div className="w-1/2 pl-10 text-white text-lg">
                <p className="font-semibold">1986</p>
                <p className="opacity-80 mt-2">
                  Creation begins, a vision of the Queen.
                </p>
              </div>
            </div>

            {/* Item 3 */}
            <div className="flex items-center w-full mb-16">
              <div className="w-1/2 text-right pr-10 text-white text-lg">
                <p className="font-semibold">1997</p>
                <p className="opacity-80 mt-2">
                  Awakening of the soul, a dream.
                </p>
              </div>

              <div className="relative z-10 w-4 h-4 bg-white rounded-full"></div>
              <div className="w-1/2"></div>
            </div>
          </div>
        </div>
      </Banner>
      <NewsLetter />
    </div>
  );
};

export default AboutUs;
