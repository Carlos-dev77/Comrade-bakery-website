


















// Javascript code for the carrousel

  let slides = document.querySelectorAll(".slide");
  let currentSlide = 0;

  function showSlide(index) {
    slides.forEach((slide) => slide.classList.remove("active"));
    slides[index].classList.add("active");
  }

  function nextSlide() {
    currentSlide++;
    if (currentSlide >= slides.length) {
      currentSlide = 0;
    }
    showSlide(currentSlide);
  }

  // Change slide every 4 seconds
  setInterval(nextSlide, 4000);

  // Hamburger menu toggle
  const hamburger = document.querySelector('.hamburger');
  const navbar = document.querySelector('.navbar');

  if (hamburger && navbar) {
    hamburger.addEventListener('click', () => {
      navbar.classList.toggle('open');
      const icon = hamburger.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
      }
    });
  }

























































