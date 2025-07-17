const Hero = () => {
  return (
    <div className="h-[75vh] w-full border-b border-ui-border-base relative bg-ui-bg-subtle">
      <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center gap-6">
        <section
          id="hero-mb-block-c7011541-1bf8-4b26-8959-b5c43d931f4d"
          className="section section-hero alignfull section-hero-image has-overlay full-viewheight full-viewheightmobile aos-init aos-animate"
          data-aos="fade"
        >
          <div className="hero-bgvideo-wrap">
            <video
              autoPlay={true}
              muted={true}
              loop={true}
              className="hero-bgvideo hero-background"
              src="https://sbggroup.com.do/wp-content/uploads/2023/10/SHIBUYA-30-SEG2.mp4"
              style={{ minHeight: "890px" }}
            />
          </div>
        </section>
      </div>
    </div>
  )
}

export default Hero
