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
     let qtnyitems=document.querySelectorAll('.cart-qty');
    qtnyitems.forEach((btn1)=>{
        btn1.addEventListener('change',changeQtyitem);
    });
}
function remveitems(){
    this.parentElement.remove();
}
function changeQtyitem(){
    if(isNaN(this.value)  || this.value<1 ){
        this.value=1;
    }
   
   
}
function addcart(){
    
    let foods=this.parentElement;
    let titile=foods.querySelector('.food-titile').innerHTML;
    let price=foods.querySelector('.food-rate').innerHTML;
    let imgsrc=foods.querySelector('.food-img').src;
   
    let newproductele=addcartproduct(titile,price,imgsrc);
    let element=document.createElement('div');
    element.innerHTML=newproductele;
    let cartstore=document.querySelector('.cart-content');
    cartstore.append(element);
    LoadContent();
}

function addcartproduct(titile,price,imgsrc){
    
    return`<div class="cart-box">
    <img src="${imgsrc}"class="cart-img">
   <div class="detail-box">
    <div class="cart-food-titile">${titile}</div>
    <div class="price-box">
     <div class="cart-price">${price}</div>   
      <div class="cart-amt">${price}</div>
    </div>
      <input type="number" value="1" class="cart-qty">
    </div>
    
    <ion-icon name="trash" class="cart-remove"></ion-icon>
</div>`;
}