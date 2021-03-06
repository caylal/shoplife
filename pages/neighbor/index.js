import util from '../../utils/util.js'
import { Apis } from '../../api/api.js'
import https from '../../service/https.js'
import { logFactory } from '../../utils/log/logFactory.js'

const log = logFactory.get("Neighbor")
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nbhdList: [],
    showMap: false,
    isFresh: false,
    pageIndex: 1,
    pageSize: 10
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: util.pageTitle.nbhd.index
    });   
    this.getNbhdShop();
  },
  getNbhdShop(){
    let _this = this  
    const data = {
      pi: _this.data.pageIndex,
      ps: _this.data.pageSize,
      nbhd: app.globalData.Nbhd[2].id,                //所在社区id
      lng: app.globalData.location.lng,     //所在经纬度位置
      lat: app.globalData.location.lat
    }  
    const store_list = wx.getStorageSync('shopList')
    if(store_list.length > 0 && !_this.data.isFresh){
      _this.setData({
        nbhdList: store_list,
        showMap: true
      })
    }else{
      wx.showLoading({
        title: '加载中...'
      });
      https.get(Apis.shop.queryNbhd, data).then( res => {
        log.log(util.getPageUrl() + " getNbhdShop: " ,res)
        if(!util.isEmpty(res)){
          res.map(item => {
            item.distance = util.transDistance(item.distance)
            item.openingtime = util.formatTime(item.openingtime,2)   
            item.closinghour = util.formatTime(item.closinghour,2)      
          })
          _this.setData({
            nbhdList:  _this.data.pageIndex != 1 ? _this.data.cart.concat(res) : res,
            showMap: true
          })
          wx.setStorage({
            key: 'shopList',
            data: _this.data.nbhdList,
          })
          wx.hideLoading()
        } else {
          wx.hideLoading()
          wx.showToast({
            title: '服务器错误',
          })
        }
      }).catch(err => {
        wx.hideLoading()
        wx.showToast({
          title: '服务器错误',
        })
      })
    }   
  },
  showMapView(){
    const data = JSON.stringify(this.data.nbhdList)
    wx.navigateTo({
      url: '../neighbor/map/index?item=' + data,
    })
  },
  showShopView(event){
    console.log(util.getPageUrl() + " itemId:" + event.currentTarget.dataset.id)
    let itemId = event.currentTarget.dataset.id    
    wx.navigateTo({
      url: '../category/index?itemId=' + itemId
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      isFresh: false,
      pageIndex: this.data.pageIndex + 1
    })
    this.onLoad()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.setData({
      isFresh: true,
      pageIndex: 1
    })
    this.onLoad()
  },
 
})