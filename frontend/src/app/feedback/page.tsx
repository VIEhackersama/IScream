export const dynamic = "force-static";

export default function FeedbackPage() {
  return (
    <div className="w-full">
      {/* Main Content Layout */}
      <main className="flex-1 flex flex-col lg:flex-row w-full">
        {/* Left Hero Section */}
        <section className="lg:w-1/2 relative min-h-[300px] lg:min-h-[calc(100vh-65px)] flex items-center justify-center overflow-hidden bg-primary/10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent z-10" />

          {/* Abstract decorative blobs */}
          <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-300 rounded-full mix-blend-multiply blur-xl opacity-70 animate-blob" />
          <div className="absolute top-10 right-10 w-32 h-32 bg-primary rounded-full mix-blend-multiply blur-xl opacity-70 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-32 h-32 bg-pink-300 rounded-full mix-blend-multiply blur-xl opacity-70 animate-blob animation-delay-4000" />

          <img
            alt="Delicious strawberry ice cream cone melting slightly"
            className="absolute inset-0 w-full h-full object-cover z-0"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBOEVumhXoVGlR6x_X5aH3-lBOAknTqk9TIOSE6oE66HUObxyqCjII-jPc6nh7JfP6YZfryaFMWxQkLYqsYGbcVeKhM5YBxZA-Sb2XTIfXYEWL2LCzfqVDchpv_MqzXx-C51Zpt9Ru2Ikp6wjeXapRVib_lORGORUpqyJ2Q7ik366QfdZggJ83gZIS2a8Y5bLidoNu3C9RhfCINjmMKLbZQi7-xQlL3I4c7iM_M_m9eP061CA_j71e6pK4rQFFltEaublSD13vzaoY"
          />

          <div className="relative z-20 p-10 text-center lg:text-left bg-white/30 backdrop-blur-md rounded-3xl m-8 lg:m-0 lg:bg-transparent lg:backdrop-blur-none border border-white/50 lg:border-none shadow-xl lg:shadow-none">
            <h1 className="text-[#181112] lg:text-white text-4xl lg:text-6xl font-extrabold tracking-tight drop-shadow-sm lg:drop-shadow-md">
              What's the <br /> Scoop?
            </h1>
            <p className="mt-4 text-[#181112] lg:text-white font-medium text-lg lg:text-xl drop-shadow-sm">
              Help us create the next big flavor.
            </p>
          </div>
        </section>

        {/* Right Form Section */}
        <section className="lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 lg:p-20 bg-background-light dark:bg-background-dark">
          <div className="w-full max-w-[560px] flex flex-col gap-6">
            {/* Headings */}
            <div>
              <h1 className="text-text-main dark:text-white tracking-tight text-[32px] md:text-[40px] font-extrabold leading-tight">
                We Want the Scoop!
              </h1>
              <p className="text-text-muted dark:text-gray-400 text-base md:text-lg font-normal leading-normal pt-2">
                Have a flavor idea? Loved a recipe? Let us know below.
              </p>
            </div>

            {/* User Type Toggle */}
            <div className="py-2">
              <div className="flex h-12 w-full items-center justify-center rounded-full bg-[#e6dbdd] dark:bg-surface-dark p-1">
                <label className="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-full px-4 transition-all duration-200 has-[:checked]:bg-white dark:has-[:checked]:bg-primary has-[:checked]:shadow-md has-[:checked]:text-primary dark:has-[:checked]:text-white text-text-muted hover:text-text-main dark:hover:text-white text-sm font-bold leading-normal group">
                  <span className="truncate">I'm a Guest</span>
                  <input defaultChecked className="invisible w-0" name="user_type" type="radio" value="Guest" />
                </label>
                <label className="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-full px-4 transition-all duration-200 has-[:checked]:bg-white dark:has-[:checked]:bg-primary has-[:checked]:shadow-md has-[:checked]:text-primary dark:has-[:checked]:text-white text-text-muted hover:text-text-main dark:hover:text-white text-sm font-bold leading-normal group">
                  <span className="truncate">Registered User</span>
                  <input className="invisible w-0" name="user_type" type="radio" value="Registered User" />
                </label>
              </div>
            </div>

            {/* Form Fields */}
            <form className="flex flex-col gap-5">
              {/* Name Field */}
              <div className="flex flex-col gap-2">
                <label className="text-text-main dark:text-gray-200 text-sm font-bold ml-2">Your Name</label>
                <div className="flex w-full items-stretch rounded-full bg-white dark:bg-surface-dark border border-transparent focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all shadow-sm">
                  <div className="text-primary flex items-center justify-center pl-5">
                    <span className="material-symbols-outlined">person</span>
                  </div>
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-full text-text-main dark:text-white focus:outline-0 focus:ring-0 border-none bg-transparent h-14 placeholder:text-text-muted px-4 text-base font-normal leading-normal"
                    placeholder="Jane Doe"
                    type="text"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="flex flex-col gap-2">
                <label className="text-text-main dark:text-gray-200 text-sm font-bold ml-2">Email Address</label>
                <div className="flex w-full items-stretch rounded-full bg-white dark:bg-surface-dark border border-transparent focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all shadow-sm">
                  <div className="text-primary flex items-center justify-center pl-5">
                    <span className="material-symbols-outlined">mail</span>
                  </div>
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-full text-text-main dark:text-white focus:outline-0 focus:ring-0 border-none bg-transparent h-14 placeholder:text-text-muted px-4 text-base font-normal leading-normal"
                    placeholder="scoops@example.com"
                    type="email"
                  />
                </div>
              </div>

              {/* Message Field */}
              <div className="flex flex-col gap-2">
                <label className="text-text-main dark:text-gray-200 text-sm font-bold ml-2">What's on your mind?</label>
                <div className="flex w-full items-start rounded-[2rem] bg-white dark:bg-surface-dark border border-transparent focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all shadow-sm p-2">
                  <div className="text-primary flex items-start justify-center pl-4 pt-3">
                    <span className="material-symbols-outlined">chat_bubble</span>
                  </div>
                  <textarea
                    className="form-textarea flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-[1.5rem] text-text-main dark:text-white focus:outline-0 focus:ring-0 border-none bg-transparent min-h-[140px] placeholder:text-text-muted px-4 py-3 text-base font-normal leading-normal"
                    placeholder="Tell us about your dream flavor..."
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                className="mt-4 flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-4 bg-primary hover:bg-primary-light text-white text-lg font-bold leading-normal tracking-[0.015em] transition-all shadow-lg shadow-primary/30 transform active:scale-[0.98]"
                type="button"
              >
                <span className="truncate">Send Feedback</span>
                <span className="material-symbols-outlined ml-2 text-xl">send</span>
              </button>

              <div className="text-center mt-2">
                <p className="text-xs text-text-muted">
                  By clicking send, you agree to our{" "}
                  <a className="underline hover:text-primary" href="#">
                    Terms of Service
                  </a>
                  .
                </p>
              </div>
            </form>
          </div>
        </section>
      </main>

      {/* Mobile footer strip */}
      <footer className="lg:hidden border-t border-[#f4f0f1] dark:border-[#3a1d23] py-6 px-4 text-center bg-surface-light dark:bg-surface-dark">
        <div className="flex justify-center gap-6 mb-4">
          <a className="text-text-main dark:text-gray-200 text-sm font-medium" href="#">
            Recipes
          </a>
          <a className="text-text-main dark:text-gray-200 text-sm font-medium" href="#">
            Books
          </a>
          <a className="text-text-main dark:text-gray-200 text-sm font-medium" href="#">
            Community
          </a>
        </div>
        <p className="text-text-muted text-xs">© 2023 Mr. A Ice Cream. All rights reserved.</p>
      </footer>
    </div>
  );
}