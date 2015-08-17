$(document).on('click','.scroll-to', function(event) {
    event.preventDefault();
    var target = "#" + this.getAttribute('data-scroll');
    $(".navbar-toggle").click();
    $('html, body').animate({
        scrollTop: $(target).offset().top
    }, 1000);
});