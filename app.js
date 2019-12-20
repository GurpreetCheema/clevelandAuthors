

// DOM is a way to represent the webpage in the structured hierarchical way so that it will become easier for programmers and users to glide through the document. With DOM, we can easily access and manipulate tags, IDs, classes, Attributes or Elements using commands or methods provided by Document object.
// variables by using classes
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");


//starting as empty cart
let cart = [];


// getting the products locally from products.json
class Products {//
   //Asynchronous functions operate in a separate order than the rest of the code via the event loop, returning an implicit Promise as its result.
  async getProducts() {
    try {
      // The await operator is used to wait for a Promise. It can only be used inside an async function.
      let result = await fetch("products.json"); // fetching data from products.json locally, it goes and get the data and we get result later point
      //return me the data using JSON method
      let data = await result.json();//instead of returning result return data(items), we will wait and only when it's settled then we return
      let products = data.items;//object = array
      // The Map object holds key-value pairs and remembers the original insertion order of the keys. 
      products = products.map(item => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      // console.log(products);
      return products;
    } catch (error) {
      console.log(error);
    //  console.log(getProducts);
    }
  }
}

// ui - getting all the items being returned from the product class, display them or manupulate them. or getting from local storage
class UI {
  displayProducts(products) {
    let result = "";
    products.forEach(product => {
      // TEMPLATE LITERALS - better than those ugly double and single quotes
      result += `
   <!-- single product -->
        <article class="product">
          <div class="img-container">
            <img
              src=${product.image}
              alt="product"
              class="product-img"
            />
            <button class="bag-btn" data-id=${product.id}>
              <i class="fas fa-shopping-cart"></i>
              add to Cart
            </button>
          </div>
          <h3>${product.title}</h3>
          <h4>$${product.price}</h4>
        </article>
        <!-- end of single product -->
   `;
    });
    //we are showing products in the product-center class which is variable productsDOM
    productsDOM.innerHTML = result;
  }
  // loading buttons after the products are loaded, it changes those add to bag default to in cart
  getBagButtons() {
    // A NodeList and an HTML collection is very much the same thing. 
    const buttons = [...document.querySelectorAll(".bag-btn")]; //... spread operator turns into an array not nodeLst
    //looping over all the buttons to get the id in data_id in displayProducts method
    //products are in local storage and they have the id
    buttons.forEach(button => {
      //we are getting id of the products
      let id = button.dataset.id;
// console.log(id);
//use find method and find me the item and if item.id matches the id of item in cart
      let inCart = cart.find(item => item.id === id);
      //if item alrready in the cart button is disabled
      if (inCart) {
        button.innerText = "In Cart";
        button.disabled = true;
      } else {
        button.addEventListener("click", event => {
          // disable button as it's already in the cart we can;t do anyhting
          event.target.innerText = "In Cart";
          event.target.disabled = true;
          // add to cart
          //with amount 1 we are controlling how many items we have in the cart
          let cartItem = { ...Storage.getProduct(id), amount: 1 };
          // things are adding in cart which was empty on top
          cart = [...cart, cartItem];
          // we are saving cart array in local storage
          Storage.saveCart(cart);
          // add to DOM
          this.setCartValues(cart); //
          this.addCartItem(cartItem);
          this.showCart();
        });
      }
    });
  }
  // this method is all about doing the math for items and quantity
  setCartValues(cart) {
    let tempTotal = 0; 
    let itemsTotal = 0;
    cart.map(item => { //
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount; //
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));//float and hae only 2 decimals
    cartItems.innerText = itemsTotal;
    console.log(cartTotal, cartItems);
  }
//this method is adding up and down arrow next to amount
  addCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    //grab everything which was in the cart-item class in tpl, adding it dynamically
    //  Template Literals = a string, instead of using single or double quotes, we use back-ticks
    div.innerHTML = `<!-- cart item --> 
            <!-- item image -->
            <img src=${item.image} alt="product" />
            <!-- item info -->
            <div>
              <h4>${item.title}</h4>
              <h5>$${item.price}</h5>
              <span class="remove-item" data-id=${item.id}>remove</span>
            </div>
            <!-- item functionality -->
            <div>
                <i class="fas fa-chevron-up" data-id=${item.id}></i>
              <p class="item-amount">
                ${item.amount}
              </p>
                <i class="fas fa-chevron-down" data-id=${item.id}></i>
            </div>
          <!-- cart item -->
    `;
    // The appendChild() method can also be used to move an element from current position to a new position. Using appendChild() you can add new values to a list and can even add a new paragraph under another paragraph
    cartContent.appendChild(div);
  } 
  //showing cart overlay on the side
  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }
  setupAPP() { 
    // update cart from local storage whether we have items or not, if we have items we add
    cart = Storage.getCart();
    // and thei values changes
    this.setCartValues(cart);
    this.populateCart(cart);
    //we are shwoing or hiding the cart on a click
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
  }

  //looking for argument for array,loop throguh cart in local storage, item in cart will be added to cartDOM
  populateCart(cart) {
    cart.forEach(item => this.addCartItem(item));
  }
  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }
// The bubbling principle is simple.
// When an event happens on an element, it first runs the handlers on it, then on its parent, then all the way up on other ancestors.
  cartLogic() {
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });
    cartContent.addEventListener("click", event => {
      if (event.target.classList.contains("remove-item")) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;  //target the id to remove from remove button
        //filter the cart to remove the item. where the item was removed is no longer there
        cart = cart.filter(item => item.id !== id);
        console.log(cart);
//get the last value in the cart
        this.setCartValues(cart);
        Storage.saveCart(cart);
        cartContent.removeChild(removeItem.parentElement.parentElement);
        const buttons = [...document.querySelectorAll(".bag-btn")];
        buttons.forEach(button => {
          if (parseInt(button.dataset.id) === id) {
            button.disabled = false;
            button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
          }
        });
      } else if (event.target.classList.contains("fa-chevron-up")) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (event.target.classList.contains("fa-chevron-down")) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cart = cart.filter(item => item.id !== id);
          // console.log(cart);

          this.setCartValues(cart);
          Storage.saveCart(cart);
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          const buttons = [...document.querySelectorAll(".bag-btn")];
          buttons.forEach(button => {
            if (parseInt(button.dataset.id) === id) {
              button.disabled = false;
              button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
            }
          });
        }
      }
    });
  }
  clearCart() {
    // console.log(this);
//get all the items id in the cart
    cart = [];
    this.setCartValues(cart);
    Storage.saveCart(cart);
    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttons.forEach(button => {
      button.disabled = false;
      button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
    });
    //if DOM element have nay kind of children we want to remove it. if anything is above 0
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }
}
//class dealing with local storage 
class Storage {
  static saveProducts(products) {
    //JSON.stringify converts a JavaScript object or value to a JSON string
    //local storage have their own methods
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) { /// id we getting from the button
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find(product => product.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    //does item in local storage exists
    //if we have some value in the local storage then return that array
    return localStorage.getItem("cart")
    //getting item from local storage cart
      ? JSON.parse(localStorage.getItem("cart"))
      //if item does not exists give me an empty array
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  //create instance of
  const ui = new UI();
  const products = new Products();
  ui.setupAPP();

  // get all products
  products
    .getProducts()
    .then(products => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    });
});