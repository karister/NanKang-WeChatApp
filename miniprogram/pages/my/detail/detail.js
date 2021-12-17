// pages/my/detail/detail.js
const app = getApp();
const db = wx.cloud.database();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // area_info: [
    //   {
    //     area: '中心市场',
    //     address: '赣州市南康区家具城工业大道亚琦城市壹号北80米[南康家具城中心市场]',
    //     latitude: 25.688255,
    //     longitude: 114.779696

    //   },
    //   {
    //     area: '博览中心',
    //     address: '赣州市南康区工业大道38-40号[南康家具城博览中心区]',
    //     latitude: 25.685532,
    //     longitude: 114.779386
    //   },
    //   {
    //     area: '家私城',
    //     address: '赣州市南康区迎宾大道与市场东路交汇处[居然之家盈海家博城]',
    //     latitude: 25.691644,
    //     longitude: 114.792854
    //   },
    //   {
    //     area: '光明家具城',
    //     address: '赣州市南康区迎宾东大道(仁济医院东北)[光明国际家具城]',
    //     latitude: 25.685177,
    //     longitude: 114.785399
    //   },{
    //     area: '其他区域',
    //     address: '',
    //     latitude: 0,
    //     longitude: 0
    //   }
    // ],
    display_info: {
      brandName: '',
      brandImgSrc: '',
      labelList: [],
      labelText: '',
      browseNum: 0,
      authState: '',
      authText: '',
      address: '',
      authImgUrl: [],
      phoneNumber:''
    },
    // display_index: 0,
    address_box_height: 60,
    area: '',
    latitude: '',
    longitude: ''
  },

  /**
   * 点击图片预览大图
   * @param {index: 当前点击的图片索引;name: 标签的名称} event   
   */
  viewImage: function (event) {
    var index = event.currentTarget.dataset.index;
    var name = event.currentTarget.dataset.name;
    var display_info = this.data.display_info;
    // console.log(index)
    display_info.labelList.forEach(element => {
      if(element.labelName == name) {
        if(element.imgUrls[index] != '') {
          // console.log(index + ':' + element.imgUrls[index])
          wx.previewImage({
            current: element.imgUrls[index], // 当前显示图片的http链接
            urls: element.imgUrls // 需要预览的图片http链接列表
          })
        }
      }
    });
  },

  /**
   * 调起系统拨打电话
   */
  callPhone: function () {
    var obj_store = this.data.display_info;
    wx.makePhoneCall({
      phoneNumber: obj_store.phoneNumber//仅为示例，并非真实的电话号码
    })
  },
  /**
   * 调起微信内置地图查看定位
   */
  onLocation: function () {
    var data = this.data;
    // console.log(data.latitude + ':' + data.longitude)
    wx.showLoading({
      title: '加载中',
    })
    wx.openLocation({
      latitude: data.latitude,
      longitude: data.longitude,
      scale: 18
    })
    wx.hideLoading()
  },
  
  /**
   * 更新浏览记录列表的记录写入数据库browse
   * @param {
   *    storeOpenid: 商家的openid
   *    brandName: 品牌名
   *    brandImgUrl: 品牌头像
   *    labelText: 标签文本
   *    browseNum: 浏览量
   * } storeInfoObj 
   */
  updatebrowse(storeInfoObj) {
    
    db.collection('browse').where({
      _openid: app.globalData.openid
    })
    .get({
      success: function (res) {
        // browse数据库中browse字段的json数据格式
        /**
         * browse: [ {}, {}, {} ]
         * browse: [
         *    {
         *      date: 12月1日
         *      storeInfo: [
         *          {
         *            storeOpenid: 
         *            brandName:
         *            brandImgUrl:
         *            labelText:
         *            browseNum:
         *            area:
         *          },
         *          {
         *            storeOpenid: 
         *            brandName:
         *            brandImgUrl:
         *            labelText:
         *            browseNum:
         *            area:
         *          }
         *      ]
         *    },
         *    {
         *      date: 12月2日
         *      storeInfo: [
         *          {
         *            storeOpenid: 
         *            brandName:
         *            brandImgUrl:
         *            labelText:
         *            browseNum:
         *            area:
         *          },
         *          {
         *            storeOpenid: 
         *            brandName:
         *            brandImgUrl:
         *            labelText:
         *            browseNum:
         *            area:
         *          }
         *      ]
         *    }
         * ]
         */
        // 获取browse数据库中browse字段赋值缓冲区
        var browseBuffer = res.data[0].browse;
        // 拼接当天日期字符串
        var now = new Date();
        var time = (now.getMonth() + 1).toString() + '月' + now.getDate().toString() + '日';
        // 查找是否有当天的浏览记录
        var haveFlag = false; // 是否找到标志
        for(let i = 0; i < browseBuffer.length; i++) {
          if(time == browseBuffer[i].date) {
            // 当天已产生浏览记录
            haveFlag = true;
            // 获取browse字段中storeInfo字段赋值缓冲区
            var storeInfoBuffer = browseBuffer[i].storeInfo;
            // 查找storeInfo列表中是否存在当前浏览的商家，即当天已浏览过该商家，则需要更新在最后面，而不是push新记录
            for(let j = 0; j < storeInfoBuffer.length; j++) {
              // 当天已浏览过
              if(storeInfoObj.brandName == storeInfoBuffer[j].brandName) {
                // 先从列表中删除该记录，后续再push新记录
                storeInfoBuffer.splice(j, 1);
                break;
              }
            }
            // 写入storeInfo字段缓冲区
            storeInfoBuffer.unshift(storeInfoObj);
            // 更新至browse字段缓冲区
            browseBuffer[i].storeInfo = storeInfoBuffer;
            break;
          }
        }
        // 当天没有产生浏览记录,需要新建当天记录
        if(!haveFlag) {
          // 组建当天的浏览记录json对象
          var dateObject = {
            date: time,
            storeInfo: [storeInfoObj]
          }
          // 更新至browse字段缓冲区
          browseBuffer.unshift(dateObject);
        }
        // 将browse字段缓冲区更新至browse数据库
        db.collection('browse').where({
          _openid: app.globalData.openid
        })
        .update({
          data: {
            browse: browseBuffer
          }
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    /**
     * 接收跳转过来携带的openid数据，注意此openid为对应商家在stores集合中的的openid，并非打开此页面的用户的openid
     */
    const storeOpenid = options.openid;
    const that = this;
    var display_info = that.data.display_info;
    // 读取stores集合中商家的所有需要被展示的信息
    db.collection('stores').where({
      _openid: storeOpenid
    })
    .get({
      success: function (res) {
        var res_data = res.data[0];
        console.log(res_data);
        display_info.brandName = res_data.brand;//品牌名
        display_info.brandImgSrc = res_data.brandImgSrc;//品牌头像地址
        var labels = res_data.label;//标签信息
        for(let i = 0; i < labels.length; i++) {
          display_info.labelText += labels[i];
          if(i != (labels.length-1)) {
            display_info.labelText += '|';
          }
        }
        display_info.browseNum = res_data.browseNum;//浏览量
        display_info.authState = (res_data.authState == 1) ?'authed' :'unauth';//认证状态
        display_info.authText = (res_data.authState == 1) ?'企业已认证' :'企业未认证';//认证展示文本
        display_info.address = res_data.address + '[' + res_data.area + ']';//店面地址
        display_info.phoneNumber = res_data.phone;//商家手机号
        display_info.authImgUrl = res_data.authImgUrl;// 认证图片
        that.setData({
          display_info,
          area: res_data.area,
          latitude: res_data.latitude,
          longitude: res_data.longitude
        })

        // 更新浏览记录列表的记录写入数据库browse   
        // 组建当前商家的浏览记录的json对象
        var storeInfoObj = {
          storeOpenid: storeOpenid,
          brandName: display_info.brandName,
          brandImgUrl: display_info.brandImgSrc,
          labelText: display_info.labelText,
          browseNum: display_info.browseNum,
          area: res_data.area
        }
        that.updatebrowse(storeInfoObj);
      }
    })
    // 读取product中的产品图片
    db.collection('product').where({
      _openid: storeOpenid
    })
    .get({
      success: function (res) {
        var res_data = res.data[0];
        var labels = res_data.labels;
        labels.forEach(element => {
          display_info.labelList.push({
            labelName: element.labelName,
            imgUrls: element.imgUrls
          })
        });
        that.setData({
          display_info
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})