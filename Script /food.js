const btncart=document.querySelector('#cart');
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
     let addcart1=document.querySelectorAll('.add-cart');
    addcart1.forEach((btn2)=>{
        btn2.addEventListener('click',addcart);   
    });
}
function remveitems(){
    let titile=this.parentElement.querySelector('.cart-food-titile').innerHTML;
    fooditems=fooditems.filter(el=>el.titile!=titile);
    this.parentElement.remove();
    LoadContent();
}
function changeQtyitem(){
    if(isNaN(this.value)  || this.value<1 ){
        this.value=1;
    }
   
   
}
let fooditems=[];
function addcart(){
    
    let foods=this.parentElement;
    let titile=foods.querySelector('.food-titile').innerHTML;
    let price=foods.querySelector('.food-rate').innerHTML;
    let imgsrc=foods.querySelector('.food-img').src;
   
    let newprodeuct={titile,price,imgsrc};
 
    if(fooditems.find((el)=>el.titile==newprodeuct.titile))
    {
        alert('product already exitis');
       
      
        return ;       
    }
    else{
        fooditems.push(newprodeuct);
    }
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
