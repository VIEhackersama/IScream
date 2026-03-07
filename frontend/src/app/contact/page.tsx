export default function ContactPage() {
  return (
    <main className="flex-grow w-full">
      {/* Hero + content wrapper */}
      <div className="layout-container flex flex-col w-full max-w-[1280px] mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Hero Section */}
        <section className="mb-12 md:mb-20">
          <div className="@container">
            <div className="flex flex-col-reverse md:flex-row gap-8 items-center">
              <div className="flex flex-col gap-6 flex-1 text-center md:text-left">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-text-main dark:text-white">
                  Have a Sweet <span className="text-primary">Question?</span>
                </h1>
                <p className="text-base md:text-lg text-text-muted dark:text-gray-300 max-w-xl mx-auto md:mx-0 font-medium">
                  Whether you have a recipe idea, a question about IScream's
                  latest book, or just want to say hi, we're all ears! Our team
                  is ready to scoop up your thoughts.
                </p>
              </div>

              <div className="flex-1 w-full relative">
                <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-xl">
                  <img
                    alt="Ice Cream Scoops"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxSPECTsBCgrNJB23K4GjyEIeMHCRYqqcRdyPNshxYpHO9wpMg5wDP83oW5bgyWrrvxH4Pcho0XEbYs7QI9C4P-KHKGIkgwQ2oBXwpJQPbdc1B9RrJyOZDzHJFESzcQxEAASCJ_pnQdxegEPxUM0pOKtqvc2Za_6JRlKefomyj2LQkognIOAznl7sQfQq_q7lsJr7rz-NgHqkzxr1b__f-ySyTjyK4cSKttvp0szGjBUzKRAqNSVQT7dvksBlN7lJ2Q98Z1RHiat4"
                  />
                </div>

                {/* Decorative Element */}
                <div className="absolute -bottom-6 -right-6 -z-10 text-primary/10 dark:text-primary/20">
                  <span className="material-symbols-outlined text-[120px]">
                    icecream
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Grid: Form & Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          {/* Left Column: Contact Form */}
          <div className="lg:col-span-7 bg-surface-light dark:bg-surface-dark rounded-xl p-6 md:p-8 border border-border-light dark:border-border-dark shadow-sm h-fit">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Send us a Message</h2>
              <p className="text-text-muted dark:text-gray-400 text-sm">
                Fill out the form below and we'll get back to you faster than
                ice cream melts.
              </p>
            </div>

            <form className="flex flex-col gap-6">
              {/* Name & Email Row */}
              <div className="flex flex-col md:flex-row gap-6">
                <label className="flex flex-col flex-1 gap-2">
                  <span className="text-sm font-bold text-text-main dark:text-gray-200">
                    Name
                  </span>
                  <input
                    className="w-full h-12 px-4 rounded-xl bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:border-primary focus:ring-primary text-text-main dark:text-white placeholder:text-text-muted/60 transition-colors"
                    placeholder="Your Name"
                    type="text"
                  />
                </label>

                <label className="flex flex-col flex-1 gap-2">
                  <span className="text-sm font-bold text-text-main dark:text-gray-200">
                    Email
                  </span>
                  <input
                    className="w-full h-12 px-4 rounded-xl bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:border-primary focus:ring-primary text-text-main dark:text-white placeholder:text-text-muted/60 transition-colors"
                    placeholder="your@email.com"
                    type="email"
                  />
                </label>
              </div>

              {/* Topic Select */}
              <label className="flex flex-col gap-2">
                <span className="text-sm font-bold text-text-main dark:text-gray-200">
                  Topic
                </span>
                <div className="relative">
                  <select className="w-full h-12 px-4 rounded-xl bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:border-primary focus:ring-primary text-text-main dark:text-white appearance-none cursor-pointer transition-colors">
                    <option value="" disabled defaultValue="">
                      Select a topic...
                    </option>
                    <option value="general">General Scoop</option>
                    <option value="recipe">Submit a Recipe</option>
                    <option value="book">Book Inquiry</option>
                    <option value="franchise">Franchise Opportunities</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
                    expand_more
                  </span>
                </div>
              </label>

              {/* Message Textarea */}
              <label className="flex flex-col gap-2">
                <span className="text-sm font-bold text-text-main dark:text-gray-200">
                  Message
                </span>
                <textarea
                  className="w-full p-4 rounded-xl bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:border-primary focus:ring-primary text-text-main dark:text-white placeholder:text-text-muted/60 resize-none transition-colors"
                  placeholder="Tell us what's on your mind..."
                  rows={5}
                />
              </label>

              {/* Submit Button */}
              <button
                className="mt-2 w-full md:w-auto self-start bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-full transition-all transform active:scale-95 flex items-center justify-center gap-2"
                type="button"
              >
                <span>Send Message</span>
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </form>
          </div>

          {/* Right Column: Info & Map */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            {/* Contact Cards */}
            <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-8 border border-primary/10 dark:border-primary/5">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  storefront
                </span>
                Visit Our Parlor
              </h3>

              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4 group">
                  <div className="size-10 rounded-full bg-white dark:bg-surface-dark flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-xl">
                      location_on
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-text-main dark:text-white">
                      Headquarters
                    </p>
                    <p className="text-text-muted dark:text-gray-300 text-sm mt-1 leading-relaxed">
                      123 Scoop Street,
                      <br />
                      Creamery District, NY 10012
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="size-10 rounded-full bg-white dark:bg-surface-dark flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-xl">
                      call
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-text-main dark:text-white">
                      Phone
                    </p>
                    <p className="text-text-muted dark:text-gray-300 text-sm mt-1">
                      (555) SCOOPS-4U
                    </p>
                    <p className="text-text-muted dark:text-gray-400 text-xs mt-1">
                      Mon-Sun, 10am - 9pm
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="size-10 rounded-full bg-white dark:bg-surface-dark flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-xl">
                      mail
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-text-main dark:text-white">
                      Email
                    </p>
                    <a
                      className="text-text-muted dark:text-gray-300 text-sm mt-1 hover:text-primary transition-colors"
                      href="mailto:hello@mrasicecream.com"
                    >
                      hello@mrasicecream.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Section */}
            <div className="relative w-full h-64 md:h-auto md:flex-1 rounded-xl overflow-hidden shadow-lg border-2 border-white dark:border-border-dark group">
              <img
                alt="Map Location"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDM6c1xoQANWXMixAmPrPs5hnObmb7rOZflkq9t0P5ftnkrlYlzYz4zebXGRM_Py-994-lOCa_-QlKO9xIDnnOojMQHZh5qVHpRteZ36LLANIWRGK2Lcgedvzq8n-ciqlCZ2htmIjiTjVen9U5PChIpUgtu3-86Mvews2Gsq0DP5j4DVIfHkYrVl8h2ffAPx-VKlvfckiX-SFZj2SgcwZ4DR6KThnv5g2xfmPJ9X7of4pls4FuubXpvPpefDuYtvuLV2Ts0506pSOY"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                <button className="bg-white text-text-main text-sm font-bold py-2 px-4 rounded-full shadow-lg flex items-center gap-2 hover:bg-gray-50 transition-colors">
                  <span className="material-symbols-outlined text-primary text-lg">
                    directions
                  </span>
                  Get Directions
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
