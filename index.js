
const openMenuButton = document.querySelector('#open-menu-button');

const closeMenuButton = document.querySelector('#close-menu-button');

const menu = document.querySelector('#aside-menu');

openMenuButton.addEventListener('click', () => {
    menu.style.display = 'flex';
});


closeMenuButton.addEventListener('click', () => {
    menu.style.display = 'none';
});



window.onscroll = function (e) {   
    if(menu.style.display === 'flex') {
        menu.style.display = 'none';
    }    
}