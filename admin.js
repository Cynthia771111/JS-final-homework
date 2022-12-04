

//-----初始化-----
adminRender();

//-----後台訂單-----
const orderSection = document.querySelector(".orders");
let orderData = [];

//渲染後台訂單函式
function adminRender(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${key}/orders`,token)
    .then(function(response){
        orderData = response.data.orders;
        let str = "";
        //每筆訂單
        orderData.forEach(item => {
            //每筆訂單內的商品名稱和數量要先組成字串
            let productStr = "";
            item.products.forEach(product => {
                productStr +=`<p class="order-item">${product.title}x${product.quantity}</p>`
            })
            //顯示是否付款
            let status = "";
            if (item.paid == false){
                status = "未付款"
            } else if (item.paid == true){
                status = "已付款"
            }
            //換算訂單日期
            let timeStamp = new Date(item.createdAt*1000);
            let time = `${timeStamp.getFullYear()}/${timeStamp.getMonth()}/${timeStamp.getDate()}`;

            //每筆要匯入HTML的訂單字串
            str += `<tr>
            <td>${item.id}</td>
            <td>
            <p>${item.user.name}</p>
            <p>${item.user.tel}</p>
            </td>
            <td>${item.user.address}</td>
            <td>${item.user.email}</td>
            <td>
            ${productStr}
            </td>
            <td>${time}</td>
            <td class="orderStatus">
            <a href="#"  data-pay="record" data-id="${item.id}">${status}</a>
            </td>
            <td>
            <input type="button" class="delSingleOrder-Btn" data-id="${item.id}" value="刪除">
            </td>
        </tr>`
        })
        orderSection.innerHTML = str

        //渲染圓餅圖資料
        let rawData = {};
        orderData.forEach(item => {
            item.products.forEach(product => {
                if(rawData[product.title] == undefined){
                    rawData[product.title] = parseInt(product.quantity)
                } 
                else {
                    rawData[product.title] += parseInt(product.quantity)
                }
            })
        })
        let itemTitle = Object.keys(rawData);
        let chartData = [];
        itemTitle.forEach((item)=>{
            let perData = [];
            perData.push(item)
            perData.push(rawData[item])
            chartData.push(perData)
        })
        //各種商品依照銷售件數由大到小排列
        chartData.sort((a,b)=> {
            console.log(a[1],b[1]);
            return b[1] - a[1];
        });

        // C3.js
        let chart = c3.generate({
            bindto: '#chart', // HTML 元素綁定
            data: {
                type: "pie",
                columns: chartData,
                colors:{
                    "Antony 床邊桌":"#71A3BB",
                    "Charles 雙人床架":"#738D9E",
                    "Jordan 雙人床架／雙人加大": "#74828F",
                    "Charles 系列儲物組合": "#757780",
                    "Louvre 雙人床架／雙人加大": "#8B9380",
                    "Antony 雙人床架／雙人加大": "#A1AF7F",
                    "Antony 遮光窗簾": "#B0C86F",
                    "Louvre 單人床架": "#B2DB3F",
                }
            },
        });
    })
    .catch(error => {
        alert("系統錯誤");
        console.log(error.status);
    })
}

//更改訂單狀態、刪除單筆訂單
orderSection.addEventListener("click",e => {
    e.preventDefault();
    //修改訂單狀態
    if(e.target.getAttribute("data-pay") == "record"){
        let status = ""
        if(e.target.innerText == "未付款"){
            status = true
        } else if(e.target.innerText == "已付款"){
            status = false
        }
        let editOrder = {};
        editOrder.data = {}
        editOrder.data.id = e.target.getAttribute("data-id")
        editOrder.data.paid = status
        axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${key}/orders`,editOrder,token)
            .then(response => {
                alert("已修改付款狀態");
                adminRender();
                console.log(response.status);
            })
            .catch(error => {
                alert("無法修改狀態")
                console.log(error.status);
            })
    }
    //刪除單筆訂單
    if(e.target.getAttribute("class") == "delSingleOrder-Btn"){
        let url = `https://livejs-api.hexschool.io/api/livejs/v1/admin/${key}/orders/${e.target.getAttribute("data-id")}`
        axios.delete(url,token)
            .then(response => {
                alert("已刪除該筆訂單")
                console.log(response.status);
                adminRender();
            })
            .catch(error => {
                alert("無法刪除該訂單")
                console.log(error.status);
            })
    }    
})

//刪除全部訂單
const deleteAll = document.querySelector(".discardAllBtn");
// console.log(deleteAll);
deleteAll.addEventListener("click",e => {
    e.preventDefault();
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${key}/orders`,token)
        .then(response => {
            alert("已刪除全部訂單")
            console.log(response.status);
            adminRender();
        })
})