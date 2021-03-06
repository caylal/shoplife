import util from '../../utils/util.js';
import { Apis } from '../../api/api.js'
import https from '../../service/https.js'
import { editCart, filterGood, getMyCart } from '../../service/service.js'
import { logFactory } from '../../utils/log/logFactory.js'

const log = logFactory.get("Category")
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navList: [],  // 左侧分类栏
    goodsList: [], // 右侧商品
    checkedGoodsAmount: 0,
    curId: '',
    childId: '',
    srollHeight: 300,
    shop: {},
    showNbhd:false,
    btL: true,
    btR: true,
    pageIndex:1,
    pageSize: 10,
    piL: 1,
    piR: 1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: util.pageTitle.goods.list
    });
    wx.showLoading({
      title: '加载中...'
    });
    // getMyCart(app.globalData.userInfo.id).then(res => {
    //   log.log("myCartBack: ", res)
      
    // })    
    this.countMoney()
    if (!util.isEmpty(options.itemId)) {
      this.showShopInfo(options.itemId)
    } else {
      this.getNavList({ url: Apis.cate.queryCate, data: { pi: this.data.pageIndex, ps: this.data.pageSize, ob: 'createdt', rs: 1 } })
    } 
  },
  // 右侧分类tab点击
  switchRightTab(e){
    let id = e.currentTarget.dataset.id;
    this.setData({
      curId: id
    })
    wx.showLoading({
      title: '加载中...'
    });
    let info = {}
    if (this.data.showNbhd) {
      info = { shop: this.data.shop.id, cate: id }
    }
    else {
      info = { cate: id }
    }
    this.getShopByCate(info)
  },
  // 二级分类tab点击
  switchChildTab(e){
    let id = e.currentTarget.dataset.id;
    this.setData({
      childId: id
    })
    let info = {}
    if (this.data.showNbhd) {
      info = { shop: this.data.shop.id, cate: id }
    }
    else {
      info = { cate: id }
    }
    this.getShopByCate(info)
  },
  // 获取所有或门店的类别
  getNavList(req){
    let _this = this
    let { url, data } = req
    return new Promise((resolve,reject) => {
      https.get(url, data).then(res =>{
        log.log(util.getPageUrl() + " category: " ,res)
        _this.setData({
          navList: res,
          curId: res[0].id
        })
        resolve(res[0].id)
      })
    }).then(id => {
      let info = {}
      if (_this.data.showNbhd) {
        info = {shop: _this.data.shop.id, cate: id }
      }
      else {
        info = { cate: id } 
      }     
      _this.getShopByCate(info)
    })
  },  
  // 显示已选择门店商品
  showShopInfo(id){
    let _this = this
    const shop = wx.getStorageSync('shopList')
    const item = shop.filter(item => { return item.id === id })
    log.log(util.getPageUrl() + " item: ", item)       
    _this.setData({
      shop: item[0],
      showNbhd:true
    })
    log.log(util.getPageUrl() + " shop: ",this.data.shop)
    let data = { url: Apis.shop.queryCate, data: { shop: id}} // 门店id
    _this.getNavList(data)
  },
  // 获取分类的商品
  getShopByCate(data){
    let _this = this
    let url = Apis.goods.queryByCate;
    if (_this.data.showNbhd){
      url = Apis.shop.queryGoodsByCate
    }
    Object.assign(data, { pi: _this.data.pageIndex, ps: _this.data.pageSize})     
   
    https.get(url, data).then(res => {
      log.log(util.getPageUrl() + " goodsList: ",res)
      const result = res
      if(!util.isEmpty(res)){
        result.map(item => {
          let quantity;
          if (_this.data.showNbhd) {
            item.url = `/pages/goods/detail/detail?url=${Apis.shop.goods}&&id=${item.id}`
          }
          else {
            item.url = `/pages/goods/detail/detail?url=${Apis.goods.restful.query}&&id=${item.id}`
          }
          item.goodsid = item.id
          quantity = filterGood(item)
          if (quantity) {
            item.quantity = quantity
          }
          return item
        })   
      }       
      _this.setData({
        goodsList: result || []
      })
      wx.hideLoading()
    })
  },
  lowerLeft(e){ //左边栏底部触发事件
    let _this = this
    let { piL, showNbhd, btL}  = _this.data 
    if (!showNbhd) {
      if(!!btL){
        _this.setData({
          piL: piL + 1
        })
        wx.showLoading({
          title: '加载中',
        })
        https.get(Apis.cate.queryCate, {
          pi: _this.data.piL,
          ps: _this.data.pageSize,
          ob: 'createdt',
          rs: 1
        }).then(res => {
          let list = _this.data.navList
          _this.setData({
            navList: list.concat(res),
            btL: res.length <= _this.data.pageSize ? false : true
          })
          wx.hideLoading()
        })
      }     
    } 
  },
  lowerRight(){ //右边栏底部触发事件
    let _this = this
    let { piR, showNbhd, btR }  = _this.data  
    if(!!btR){
      _this.setData({
        piR: piR + 1
      })
      let info = {}
      let url = Apis.goods.queryByCate;
      if (showNbhd) {
        url = Apis.shop.queryGoodsByCate
        info = { shop: _this.data.shop.id, cate: _this.data.curId, pi: _this.data.piR, ps: _this.data.pageSize }
      } else {
        info = { cate: _this.data.curId, pi: _this.data.piR, ps: _this.data.pageSize }
      }
      wx.showLoading({
        title: '加载中',
      })
      https.get(url, info).then(res => {
        log.log(util.getPageUrl() + " concatGoodList: ", res)
        const result = res
        if (!util.isEmpty(res)) {
          result.map(item => {
            let quantity;
            if (showNbhd) {
              item.url = `/pages/goods/detail/detail?url=${Apis.shop.goods}&&id=${item.id}`
            }
            else {
              item.url = `/pages/goods/detail/detail?url=${Apis.goods.restful.query}&&id=${item.id}`
            }
            item.goodsid = item.id
            quantity = filterGood(item)
            if (quantity) {
              item.quantity = quantity
            }
            return item
          })
          let list = _this.data.goodsList
          _this.setData({
            goodsList: list.concat(result),
            btR: result.length <= _this.data.pageSize ? false : true
          })
        }
        wx.hideLoading()
      })
    } 
   
  },
  // 添加购物车
  changeCart(e){
    const { id, btn, index } = e.currentTarget.dataset
    let _this = this
    let goodsid,
        shopgoodsid; 
      
    if (!_this.data.showNbhd){
        goodsid = id       
    }else{
      shopgoodsid = id     
    }
    editCart({ uid: app.globalData.userInfo.id, goodsid: goodsid, shopgoodsid: shopgoodsid, btn: btn }).then(res => {
      if (res != null) {       
        const list = res
        if (list != null) {
          const goodslist = _this.data.goodsList
          goodslist[index].quantity = list.quantity
          _this.setData({
            goodsList: goodslist
          })
          _this.countMoney()
        }
      }
    })  
    
  },
  countMoney(){
    let _this = this 
    wx.getStorage({
      key: 'myCart',
      success: function(res) {
        if (!util.isEmpty(res)) {
          log.log(util.getPageUrl() + " lastList: ", res)
          let total = res.data.reduce((pre, cur) => {
            return pre + (cur.goodsretailprice * cur.quantity)
          }, 0)
          console.log(total)
          _this.setData({
            checkedGoodsAmount: total
          })
        } else {
          log.log(util.getPageUrl() + "无购物车数据：", res)
        }    
      },
    })
   
  },
  onShow(){
    let _this = this
    wx.getSystemInfo({
      success: function (res) {
        let height = res.windowHeight - 45; //footerpannelheight为底部组件的高度
        _this.setData({
          srollHeight: height
        });
      }
    })    
  },
  goCart(){
    wx.switchTab({
      url: '../cart/index',
    })
  }
 
})
