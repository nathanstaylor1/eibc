$(".class-toggler").click(function(){
	var className = $(this).attr("data-toggle-class");
	var target = $(this).attr("data-target");
	$(target).toggleClass(className);
})