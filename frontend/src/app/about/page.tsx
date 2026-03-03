// app/about/page.tsx
export default function AboutPage() {
  return (
    <div className="flex flex-col items-center w-full">
      {/* Hero Section */}
      <div className="w-full max-w-[1280px] px-4 md:px-10 py-12 md:py-20">
        {/* NOTE: Container query classes (@container / @[...]) require the container-queries plugin. */}
        <div className="@container">
          <div className="flex flex-col gap-10 px-4 py-6 @[480px]:gap-12 @[864px]:flex-row items-center">
            <div className="w-full @[864px]:w-1/2 flex flex-col gap-6">
              <div className="flex flex-col gap-4 text-left">
                <span className="text-primary font-bold tracking-wider uppercase text-sm">
                  Our Story
                </span>
                <h1 className="text-4xl md:text-6xl font-black leading-[1.1] tracking-tight dark:text-white">
                  Scooping Happiness Since 1985
                </h1>
                <p className="text-lg md:text-xl font-normal leading-relaxed text-gray-600 dark:text-gray-300">
                  Meet Mr. A, the man behind the flavor, and discover the story of
                  how a single cart and a big dream became a sweet empire loved by
                  thousands.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button className="flex items-center justify-center rounded-full h-12 px-8 bg-primary text-white text-base font-bold hover:bg-red-600 transition-colors shadow-lg shadow-primary/30">
                  Read History
                </button>
                <button className="flex items-center justify-center rounded-full h-12 px-8 bg-white dark:bg-white/10 text-text-main dark:text-white border border-gray-200 dark:border-white/20 text-base font-bold hover:bg-gray-50 dark:hover:bg-white/20 transition-colors">
                  Watch Video
                </button>
              </div>
            </div>

            <div className="w-full @[864px]:w-1/2 relative">
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/10 rounded-full blur-3xl" />
              <div
                className="w-full aspect-square md:aspect-[4/3] bg-center bg-no-repeat bg-cover rounded-xl shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500 ease-out"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB1LHDEgY0UHJ3WB7i4zAS4n0LYCWM8h6aYA0fIPs6haR_jcQopVJwYqyf7trDRQejzDvffZbCHsjeudFEv-rub3xymgQ3Rio8toJ7sN5rGu-V0v66H3hUHUqdvTDbLLc-JZH136816WJWj6cl97CFEVED-xjuQ6ZfQ9ExrD3Wq-Vtz5FdmqIhQ7_dnaM8aMvrJUraLSMhP_gfiS2j0MuwbJSX721aNn7p6qez6Ojfk36XYFYU6fv4rSyxe1c7RqaZ6wNZsrq6GGXQ")',
                }}
                aria-label="Portrait of an elderly man smiling while holding a large ice cream cone"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Narrative Section */}
      <div className="w-full bg-white dark:bg-[#2a1419] py-20 rounded-t-[3rem]">
        <div className="max-w-[960px] mx-auto px-6 md:px-10 text-center">
          <span className="material-symbols-outlined text-primary text-5xl mb-6">
            format_quote
          </span>
          <h3 className="text-2xl md:text-3xl font-medium leading-relaxed text-text-main dark:text-white italic">
            "I believe that a good scoop of ice cream can turn a bad day around.
            It's not just milk and sugar; it's a memory in the making. We don't
            just sell dessert, we sell moments of joy."
          </h3>

          <div className="mt-8 flex items-center justify-center gap-3">
            <div
              className="h-12 w-12 rounded-full bg-gray-200 bg-cover bg-center"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCobioVydCugk9scZ2kkPQN1nALSAxrvCphMh893p6nKoBPhc6hbaG38HIfyS2voZfc4itNXuC2Wftwsi0CkjOdlXRX5bbyzA7G_Mfql_IXbZNI0C3SV_N64Is1Kcqtu7xtsKFL6y602CcXubIutqobPhrXJR-OAhAFzUtT9F8MK3EFAdY6JJbkswlrc89eC2oMHDaxZuIP7ffro6zCTx1MZ0NgLH8VC9QYLqTlJOiJ8ozb2q5Uh35rYdXUuADCrw6JUOSO9h0U93o")',
              }}
              aria-label="Small circular portrait of Mr. A"
            />
            <div className="text-left">
              <p className="font-bold text-text-main dark:text-white">
                Arthur "Mr. A" Anderson
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Founder</p>
            </div>
          </div>
        </div>
      </div>

      {/* History Section */}
      <div className="w-full max-w-[960px] px-4 md:px-10 py-16">
        <div className="flex flex-col items-center mb-12">
          <span className="bg-primary/20 text-primary px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            Timeline
          </span>
          <h2 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight text-center dark:text-white">
            Our Sweet History
          </h2>
        </div>

        <div className="grid grid-cols-[40px_1fr] md:grid-cols-[60px_1fr] gap-x-4 md:gap-x-8 px-4 relative">
          <div className="absolute left-[24px] md:left-[34px] top-4 bottom-4 w-[2px] bg-[#e6dbdd] dark:bg-[#4a2e33]" />

          {/* 1985 */}
          <div className="flex flex-col items-center gap-1 pt-3 relative z-10">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary flex items-center justify-center text-white shadow-lg">
              <span className="material-symbols-outlined">shopping_cart</span>
            </div>
          </div>
          <div className="flex flex-1 flex-col py-3 pb-10">
            <span className="text-primary font-bold text-lg">1985</span>
            <h3 className="text-xl font-bold dark:text-white">The First Cart</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Mr. A bought a vintage pushcart and started selling his homemade
              vanilla bean ice cream at the local park. It sold out in 2 hours.
            </p>
          </div>

          {/* 1990 */}
          <div className="flex flex-col items-center gap-1 pt-3 relative z-10">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white dark:bg-[#381E23] border-2 border-primary flex items-center justify-center text-primary shadow-lg">
              <span className="material-symbols-outlined">storefront</span>
            </div>
          </div>
          <div className="flex flex-1 flex-col py-3 pb-10">
            <span className="text-primary font-bold text-lg">1990</span>
            <h3 className="text-xl font-bold dark:text-white">
              First Shop Opens
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Demand grew too big for the cart. The first brick-and-mortar shop
              opened on Main Street, introducing 12 signature flavors.
            </p>
          </div>

          {/* 2005 */}
          <div className="flex flex-col items-center gap-1 pt-3 relative z-10">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white dark:bg-[#381E23] border-2 border-primary flex items-center justify-center text-primary shadow-lg">
              <span className="material-symbols-outlined">menu_book</span>
            </div>
          </div>
          <div className="flex flex-1 flex-col py-3 pb-10">
            <span className="text-primary font-bold text-lg">2005</span>
            <h3 className="text-xl font-bold dark:text-white">
              Recipe Book Published
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              "Scoops of Joy" hit the shelves, sharing IScream's secret techniques
              with home cooks around the world.
            </p>
          </div>

          {/* 2023 */}
          <div className="flex flex-col items-center gap-1 pt-3 relative z-10">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white dark:bg-[#381E23] border-2 border-primary flex items-center justify-center text-primary shadow-lg">
              <span className="material-symbols-outlined">emoji_events</span>
            </div>
          </div>
          <div className="flex flex-1 flex-col py-3">
            <span className="text-primary font-bold text-lg">2023</span>
            <h3 className="text-xl font-bold dark:text-white">
              National Golden Spoon Award
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Recognized for "Outstanding Contribution to Dessert Culture" and
              commitment to sustainable dairy farming.
            </p>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="w-full bg-[#fff0f3] dark:bg-[#2f1519] py-20 my-10 rounded-[3rem]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight dark:text-white mb-2">
                Our Core Values
              </h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-lg">
                We take our ice cream seriously, but not ourselves. Here is what
                matters most to us.
              </p>
            </div>

            <button className="text-primary font-bold flex items-center gap-1 hover:gap-2 transition-all">
              View Community Impact{" "}
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-[#3a1d22] p-8 rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-300 group">
              <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">eco</span>
              </div>
              <h3 className="text-xl font-bold mb-3 dark:text-white">
                Farm Fresh
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                We source all our milk from local farms within 50 miles. If it's
                not fresh, it's not in our freezer.
              </p>
            </div>

            <div className="bg-white dark:bg-[#3a1d22] p-8 rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-300 group">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">
                  diversity_3
                </span>
              </div>
              <h3 className="text-xl font-bold mb-3 dark:text-white">
                Community First
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                We are more than a shop; we are a gathering place. We support
                local schools and host weekly events.
              </p>
            </div>

            <div className="bg-white dark:bg-[#3a1d22] p-8 rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-300 group">
              <div className="w-14 h-14 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">
                  sentiment_very_satisfied
                </span>
              </div>
              <h3 className="text-xl font-bold mb-3 dark:text-white">Pure Joy</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                No artificial preservatives or grumpy faces allowed. We believe
                happiness is the most important ingredient.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="w-full max-w-[1280px] px-4 md:px-10 py-16">
        <h2 className="text-3xl font-bold mb-8 dark:text-white">
          Life at the Parlor
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-96 md:h-[500px]">
          <div className="col-span-2 row-span-2 rounded-xl overflow-hidden relative group">
            <div
              className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBZ82ERDWG-oTuUDZHnxpTVbCz7aJmBi5b9uSC_Db6IAkS3726SpqYe8B6PvrIoiNu0kceWaGFWikIaiDuagk3SphnOjtgA0aiGbxiRQwaHna7TDIgo3ekDrvCjrf-pw1J7d9kfHBV8WWTRxqp4DGXzSj98PBCnk_ssx_3dyIcOWCISl-0A-i6hjWsHrsmEeVx2W2c_yVUkMkQeFw7rxC_wd4-FTZI-QMjiU1b4TX3vdstlM-BcsVdJcRrssIHgF7ekQZj5dStzZnM")',
              }}
              aria-label="Close up of three scoops of colorful ice cream in a waffle cone"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
          </div>

          <div className="col-span-1 row-span-1 rounded-xl overflow-hidden relative group">
            <div
              className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDjPoNNMteBMAju4CulJVI3AoBynyOzy7Sux8XjKnhtWrBuPkPUc4W8cWVq-7yXgU1qxWS9-oXKOAYZ692uxOkwzssdyRT5LDY-ZW3UQuZ9Tqg8ZAVFcg28k85Z5bQiLHWmjY_C8pRuNoaF3Iv20cCCaFXs4m1gqZnjuXv4KvAaXCuyoATJuKy_dFlpbCCCrqKVgWgrBKcE4KIP-HszegNZGwOQZVJ_N_jcEYOn4NNDJzfVlhrQrx6uOsp1uRCri7t-VaQ-oAKAB7U")',
              }}
              aria-label="Interior view of the ice cream shop"
            />
          </div>

          <div className="col-span-1 row-span-1 rounded-xl overflow-hidden relative group">
            <div
              className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCQEAHi1u1VdHJxZW6SktyCgv6GH-6nffrcVTVo9IHt8BTcpLMoZXU0Umlu49vOB78mrH3HymjvTkSs9alIAQ8QHG0bcH41MI15kXaZtEqzXnWSi3MyEV0Bpfb2YeF3QW1wAxvuQSD6HwNQBO7QcvG5H6nTgCjdO8m9Kj5-7zT7HSpRW7xV0j3Q559ebWH1bKMQk1BHNw7R_iDhwUlg3hI48zZcA0By-Mh0pLo8ZctZXO2YoNSixGWscEV69M33w34l-1qDITkNQWg")',
              }}
              aria-label="A child laughing while eating ice cream"
            />
          </div>

          <div className="col-span-2 row-span-1 rounded-xl overflow-hidden relative group">
            <div
              className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCGJTlsFOHoQyBFA3OBp607cxwICXSn-t-GJIKvG4Nv-eFefIsAsxby8cmv_o0x8GY_SCTD6FtlZxr32XdK968tOH0148dk7So5uFO5umyAElWSYcoi6j7uvBB7-YtB9wJ2XTjHdo-zaPCCiHgerAvsrz1MQKQofeNIgvNsnwSKxYYoO2BnF8LjyHaGt2-lumFZ1LU8cjYq9gXMGYzdCEgJzzK4FrPPl6OnHyNsXClEeTU7ujam1fGTkat7HYCZiVoLZvMcQHiITIQ")',
              }}
              aria-label="A vintage style sign that says Open for Business"
            />
          </div>
        </div>
      </div>

      {/* Pre-Footer CTA */}
      <div className="w-full px-4 md:px-10 pb-16">
        <div className="bg-primary rounded-xl p-10 md:p-16 text-center text-white relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center gap-6">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">
              Ready to taste the magic?
            </h2>
            <p className="text-white/90 text-lg max-w-xl">
              Come visit us on Main Street or check out our recipe books to make
              your own scoops at home.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <button className="bg-white text-primary px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors shadow-lg">
                Get Directions
              </button>
              <button className="bg-primary border-2 border-white text-white px-8 py-3 rounded-full font-bold hover:bg-white/10 transition-colors">
                Browse Recipes
              </button>
            </div>
          </div>

          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full" />
          <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-white/10 rounded-full" />
        </div>
      </div>
    </div>
  );
}