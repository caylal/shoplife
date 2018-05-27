const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/**封装微信的request */
function request(url,data={},method = "Get"){
  return new Promise((resolve,reject) =>{
    wx.request({
      url: url,
      data: data,
      method: method,
      header: {
        'Content-Type': 'application/json'
      },
      success: res =>{
        console.log("success");
        if (res.statusCode == 200){
          if(res.data)
          resolve(res)
        }
        else{
          reject(res.errMsg)
        }
      },
      fail: res => {
        console.log("failed");
        reject(res);
      }
    })
  })
}

/**检查微信会话是否过期 */
function checkSession(){
  return new Promise((resolve,reject) => {
    wx.checkSession({
      success:() => {
        resolve(true);
      },
      fail: () => {
        reject(false);
      }
    })
  })
}

/**调用微信登录 */
function login(){
  return Promise((resolve, reject) => {
    wx.login({
      success: res =>{
        if(res.code){
          console.log(res);
          resolve(res);
        }
        else{
          reject(res);
        }
      },
      fail: err => {
        reject(err);
       }
    })
  })
}

/**获取用户信息 */
function getUserInfo() {
  return new Promise((resolve, reject) => {
    wx.getUserInfo({
      withCredentials: true,
      success: res => {
        resolve(res);
       },
       fail: err =>{
         reject(err);
       }
    })
  })
}

const pageTitle = {
  home: "近邻生活",
  cart: "购物车",
  goods: {
    list: '商品列表',
    detail: '商品详情',
    catalog: '商品分类'
  },
  member: "个人中心",
  search: "搜索",
  order: "订单中心",
  orderM: {
    detail: '订单详情',
    checkout: '检查订单',
    payment: '订单付款',
    s1: '待付款',
    s2: '待发货',
    s3: '待收货',
    s4: '待评价'
  },  
 
  address: "我的地址",
  addressM: {
    add: '添加地址',
    edit: '更新地址'
  },
  userinfo: "用户信息",
  wechatLogin: "微信登录",
  wechatPay: "微信支付",
};
module.exports = {
  formatTime: formatTime,
  pageTitle: pageTitle,
  request,
  checkSession,
  login,
  getUserInfo
}
