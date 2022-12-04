const itemSection = document.querySelector(".productWrap");
let allData = []; //所有商品原始資訊
axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${key}/products`)
    .then(response => {
        allData = response.data.products //所有商品原始資訊
        init();
    })
    .catch(error => {
        alert("忙線中，請稍候");
        console.log(error);
    })

//初始化函式
function init(){
    render();
    filter();
    showCart();
}

//渲染商品列表函式
function render(){
    let str = ""
    allData.forEach(function(item,index){
        //價格加上千分位
        let originPrice = toThousands(item.origin_price);
        let price = toThousands(item.price);
        //每件商品字串
        str += `<li class="productCard" data-type="${item.category}" data-id="${item.id}">
            <h5 class="productType">新品</h5>
            <img src="${item.images}" alt="photo">
            <a href="#" class="addCardBtn" data-index="${index}">加入購物車</a>
            <h4>${item.title}</h4>
            <del class="originPrice">NT$${originPrice}</del>
            <p class="nowPrice">NT$${price}</p>
        </li>`
    })
    itemSection.innerHTML = str
}

//篩選功能函式
function filter(){
    //製作商品篩選下拉式選單
    const filter = document.querySelector(".productSelect");
    let unSort = allData.map(function(item){
        return item.category
    })
    let sorted = unSort.filter(function(item,index){
        return unSort.indexOf(item) === index
    })
    let str = ``
    sorted.forEach(function(item){
        str += `<option value="${item}"selected>${item}</option>`
    })
    str += `<option value="全部"selected>全部</option>`
    filter.innerHTML = str

    //篩選功能
    filter.addEventListener("change",function(e){
        let type = e.target.value;
        //選擇全部，直接全部渲染一遍
        if(type == "全部"){
            render();
            return;
        }
        //選擇種類
        str = ""
        allData.forEach(function(item,index){
            if(item.category == type){
                str += `<li class="productCard" data-type="${item.category}" data-id="${item.id}">
                <h5 class="productType">新品</h5>
                <img src="${item.images}" alt="photo">
                <a class="addCardBtn" data-index="${index}">加入購物車</a>
                <h4>${item.title}</h4>
                <del class="originPrice">NT$${item.origin_price}</del>
                <p class="nowPrice">NT$${item.price}</p>
            </li>`
            }
        })
        itemSection.innerHTML = str
    })
}

//加入購物車
itemSection.addEventListener("click",function(e){
    e.preventDefault();
    if(e.target.nodeName != "A"){
        return;
    }
    let index = e.target.getAttribute("data-index");
    let addToCart = {};
    addToCart.data = {};
    addToCart.data.productId = allData[index].id;
    addToCart.data.quantity = 1;
    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${key}/carts`,addToCart)
        .then(response => {
            alert("已加入購物車")
            showCart();
            console.log(response.status);
        })
        .catch(error => {
            alert("忙線中，請稍後再試")
            console.log("response.status");
        })

})


//-----購物車section-----

const cartSection = document.querySelector(".shoppingCart-table");
let cartData = []; //購物車商品原始資訊

//渲染購物車函式
function showCart(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${key}/carts`)
    .then(response => {
        cartData = response.data.carts //購物車商品原始資訊
        let total = 0;
        //第一行表頭
        let str = `<tr>
        <th width="40%">品項</th>
        <th width="15%">單價</th>
        <th width="15%">數量</th>
        <th width="15%">金額</th>
        <th width="15%"></th></tr>`
        //每筆商品資料
        cartData.forEach(function(item,index){
            //價格加上千分位
            let price = toThousands(item.product.price);
            //計算金額
            let num = parseInt(item.quantity)
            let subtotal = item.product.price*num;
            total += subtotal
            //金額加上千分位
            let subprice = toThousands(subtotal);
            str +=`<tr>
            <td>
                <div class="cardItem-title">
                    <img src="${item.product.images}" alt="">
                    <p>${item.product.title}</p>
                </div>
            </td>
            <td>NT$${price}</td>
            <td class="num">
                <span class="material-symbols-outlined icon" data-type="minus" data-index="${index}">remove</span>
                ${num}
                <span class="material-symbols-outlined icon" data-type="add" data-index="${index}">add</span></td>
            <td>NT$${subprice}</td>
            <td class="discardBtn">
                <a class="material-icons" data-index="${index}" data-type="delete">
                    clear
                </a>
            </td>
            </tr>`
        })
        //最後一行的總金額和刪除按鈕
        //總金額加上千分位
        let totalPrice = toThousands(total);
        str += `<tr>
        <td>
            <a href="#" class="discardAllBtn">刪除所有品項</a>
        </td>
        <td></td>
        <td></td>
        <td>
            <p>總金額</p>
        </td>
        <td>NT$${totalPrice}</td>
        </tr>`
        cartSection.innerHTML = str
    })
    .catch(error => {
        alert("忙線中，請稍後再試");
        console.log(error.status);
    })
}

//編輯購物車
cartSection.addEventListener("click",function(e){
    //刪除所有商品
    if(e.target.getAttribute("class") == "discardAllBtn"){
        e.preventDefault();
        let deleteAllCart = {};
        deleteAllCart.data = {};
        axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${key}/carts`)
            .then(function(response){
                alert("已清空購物車")
                showCart();
            })
    }
    //刪除特定商品
    if(e.target.getAttribute("data-type") == "delete"){
        let index = e.target.getAttribute("data-index");
        let id = cartData[index].id;
        let url = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${key}/carts/${id}`;
        axios.delete(url);
        alert("該商品已刪除");
        showCart();
    }
    //編輯商品數量
    if(e.target.getAttribute("data-type") == "add" || e.target.getAttribute("data-type") == "minus" ){
        let type = e.target.getAttribute("data-type");
        let index = e.target.getAttribute("data-index");
        let id = cartData[index].id;
        let num = cartData[index].quantity;
        let editNum = {};
        editNum.data = {}
        editNum.data.id = id
        //增加數量
        if(type == "add"){
            num++
            editNum.data.quantity = num;
            axios.patch(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${key}/carts`,editNum)
            alert("已增加數量");
            showCart();
        } 
        //減少數量
        else if(type == "minus"){
            if(num == 1){
                let url = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${key}/carts/${id}`;
                axios.delete(url);
                alert("該商品已刪除");
                showCart();
                return;
            }
            num--
            editNum.data.quantity = num;
            axios.patch(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${key}/carts`,editNum)
            alert("已減少數量");
            showCart();
        }
    }
})


//-----訂單section-----

const customerName = document.querySelector("#customerName");
const customerPhone = document.querySelector("#customerPhone");
const customerEmail = document.querySelector("#customerEmail");
const customerAddress = document.querySelector("#customerAddress");
const tradeWay = document.querySelector("#tradeWay");
const orderInfoBtn = document.querySelector(".orderInfo-btn");

//送出訂單
orderInfoBtn.addEventListener("click",function(e){
    e.preventDefault();
    if(customerName.value == "" || customerPhone.value == "" ||customerEmail.value == "" ||customerAddress.value == ""){
        alert("請完成所有必填欄位");
        return;
    }
    let order = {};
    order.data = {}
    order.data.user = {}
    order.data.user.name = customerName.value
    order.data.user.tel = customerPhone.value
    order.data.user.email = customerEmail.value
    order.data.user.address = customerAddress.value
    order.data.user.payment = tradeWay.value
    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${key}/orders`,order)
        
        .then(response => {
            alert("訂單已送出");
            console.log(response.status);
            customerName.value = ""
            customerPhone.value = ""
            customerEmail.value = ""
            customerAddress.value = ""
            init();
            
        })
        .catch(error => {
            alert("訂單錯誤，請稍後再試");
            console.log(error.status);
        })
})


//-----其他函式-----
//換算金額成千分位
function toThousands(num) {
    var num = (num || 0).toString(), result = '';
    while (num.length > 3) {
        result = ',' + num.slice(-3) + result;
        num = num.slice(0, num.length - 3);
    }
    if (num) { result = num + result; }
    return result;
}