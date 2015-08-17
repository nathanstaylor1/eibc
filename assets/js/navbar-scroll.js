$(window).scroll(function() {    
    var scroll = $(window).scrollTop();
    var cutoff = window.innerHeight*3/4;
    if (scroll >= cutoff) {
        $(".navbar").addClass("scrolled");
    } else {
    	$(".navbar").removeClass("scrolled");
    }
});