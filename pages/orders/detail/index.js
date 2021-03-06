import util from '../../../utils/util.js';
import { Apis } from '../../../api/api.js';
import https from '../../../service/https.js'
import { logFactory } from '../../../utils/log/logFactory.js'

const log = logFactory.get("Orders")
const app = getApp()
Page({  
  data: {
    orderDetail: {}
  },

  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: util.pageTitle.orderM.detail
    });
    wx.showLoading({
      title: '加载中',
    })
    this.getOrderDetail(options.id)
  },
  getOrderDetail(id){
    let orderlist =  wx.getStorageSync('myOrderList')
    let list = []
    if(orderlist.length > 0){
      list = orderlist.filter(item => item.id == id)
    }
    if(list.length <= 0){
      https.get(Apis.order.queryOfMy, {
        pi: 1,
        ps: 10,
        uid: app.globalData.userInfo.id
      }).then(res => {
        if(!util.isEmpty(res)){
          list = res.filter(item => item.id == id)
          list[0].shopes.map(val => {
            val.openingtime = util.formatTime(val.openingtime, 2)
            val.closinghour = util.formatTime(val.closinghour, 2)
            val.distance = util.transDistance(val.distance)           
          })
          this.setData({
            orderDetail: list[0]
          })
        }
        wx.hideLoading();
      })
    }else{
      list[0].shopes.map(item => {
        item.openingtime = util.formatTime(item.openingtime, 2)
        item.closinghour = util.formatTime(item.closinghour, 2)
        if (item.distance < 1000) {
          item.distance = item.distance.toFixed(1) + 'm'
        } else {
          item.distance = (Math.round(item.distance / 100) / 10).toFixed(1) + 'km'
        }
      })
      this.setData({
        orderDetail: list[0]
      })
      wx.hideLoading();
    }   
  
  },
  goodsDetail(e){
    let index = e.currentTarget.dataset.index
    const list = this.data.orderDetail
    const items = list.shopes[index].items
    wx.navigateTo({
      url: '../shopdetail/index?item=' + JSON.stringify(items)
    })
  },
  orderOpt(e){
    let type = e.currentTarget.dataset.type
    let order = this.data.orderDetail
    let info = { id: order.id, total: order.actualprice}
    if(type == "cancel"){ //取消订单

    }else{
      wx.navigateTo({
        url: '../../payment/payment?item=' + JSON.stringify(info)
      })
    }
  }
})