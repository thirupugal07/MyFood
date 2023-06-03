const btncart=document.querySelector('.cart-icon');
const cart=document.querySelector('.cart1');
const cls=document.querySelector('.cart-close');
btncart.addEventListener('click',()=>
{
    cart.classList.add('cart-active');
});
cls.addEventListener('click',()=>
{
    cart.classList.remove('cart-active');
});
document.addEventListener('DOMContentLoaded',loadFood);
function loadFood(){

    LoadContent();
}
function LoadContent(){
    let btnremove=document.querySelectorAll('.cart-remove');
    btnremove.forEach((btn)=>{
        btn.addEventListener('click',remveitems);
    });
}
function remveitems(){
    this.parentElement.remove();
}
