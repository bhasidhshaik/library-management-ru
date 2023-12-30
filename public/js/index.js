
const navContainer = document.querySelector('.mobile-nav-link-container');
const mnavX = document.querySelector('#mnavx');
const toggleMenu = () => navContainer.classList.toggle("open");

mnavX.addEventListener('click' , ()=>{
    navContainer.classList.toggle("open");
    console.log('hello owr');
});
