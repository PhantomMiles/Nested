// When the user scrolls the page, execute myFunction
window.onscroll = function() { myFunction() };

// Get the header
var header = document.getElementById("myHeader");
var mobile-nav = document.getElementById("navbar-mobile");


// Get the offset position of the navbar
var sticky = header.offsetTop;

// Add the sticky class to the header when you reach its scroll position. Remove "sticky" when you leave the scroll position
function myFunction() {
    if (window.pageYOffset > sticky) {
        header.classList.add("sticky");
        mobil
        header.style.backgroundColor = "#00008B";
        // header.style.marginTop = "10px";
        header.style.transition = "ease-in 0.2s";

    } else {
        header.classList.remove("sticky");
        header.style.backgroundColor = "transparent";

    }
}