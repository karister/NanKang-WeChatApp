// pages/my/admin/function/imgManage/imgManage.js
import Toast from '../../../../../miniprogram_npm/@vant/weapp/toast/toast';

const db = wx.cloud.database();
const _ = db.command;
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    brandName: '',
    /*
    labelObject: {
      //标签名
      labelName: 
      //图片
      imgUrls:
      //是否空链接
      urlsEmpty: 
    }
    */
    labelObject: [],
    // 纯图片链接集合(二维数组)
    imgUrls: [],
    // 选中后的图片框颜色
    selectedColor: 'red',
    // 正常的图片框颜色
    normalColor: '#e4e4e4'
    

  },
  
  /**
   * 全部清空上传的图片
   * @param {labelindex: 标签的索引} event 
   */
  allClear(event) {
    var labelIndex = event.currentTarget.dataset.labelindex;
    var labelObject = this.data.labelObject;
    var imgUrls = this.data.imgUrls;
    // console.log(labelIndex);
    labelObject[labelIndex].images = [];
    labelObject[labelIndex].urlsEmpty = true;
    imgUrls[labelIndex] = [];
    this.setData({
      labelObject,
      imgUrls
    })
    // console.log(labelObject[labelIndex]);
  },

  /**
   * 删除选中的图片
   * @param {imageindex: 当前点击的图片索引;labelindex: 标签的索引} event   
   */
  deleteImage(event) {
    var labelIndex = event.currentTarget.dataset.labelindex;
    var labelObject = this.data.labelObject;
    var imgUrls = this.data.imgUrls;
    var imageIndex = labelObject[labelIndex].selectIndex;
    // 删除纯图片链接集合中对应索引的图片
    imgUrls[labelIndex].splice(imageIndex,1);
    // 删除图片对象集合中对应索引的图片
    labelObject[labelIndex].images.splice(imageIndex,1);
    // 增加集合元素
    labelObject[labelIndex].images.push({
      url: '',
      borderColor: this.data.normalColor
    })
    // 增加集合元素
    imgUrls[labelIndex].push('');
    // 禁用编辑按钮
    labelObject[labelIndex].disable = true;
    this.setData({
      labelObject,
      imgUrls
    })
  },
  /**
   * 更改单张图片
   * @param {labelindex: 标签的索引} event 
   */
  changeImage(event) {
    const that = this;
    var labelIndex = event.currentTarget.dataset.labelindex;
    var labelObject = this.data.labelObject;
    var imgUrls = this.data.imgUrls;
    wx.chooseMedia({
      count: 1,
      mediaType: ['image','video'],
      sourceType: ['album', 'camera'],
      maxDuration: 30,
      camera: 'back',
      success(res) {
        labelObject[labelIndex].images[labelObject[labelIndex].selectIndex].url = res.tempFiles[0].tempFilePath;
        imgUrls[labelIndex][labelObject[labelIndex]] = res.tempFiles[0].tempFilePath;
        // 更新普通边框颜色
        labelObject[labelIndex].images[labelObject[labelIndex].selectIndex].borderColor = that.data.normalColor;
        // 禁用编辑按钮
        labelObject[labelIndex].disable = true;
        that.setData({
          labelObject,
          imgUrls
        })
      },
      fail: console.error
    })
  },

  /**
   * 取消选中的图片
   * @param {labelindex: 标签的索引} event 
   */
  cancelSelect(event) {
    var labelIndex = event.currentTarget.dataset.labelindex;
    var labelObject = this.data.labelObject;
    labelObject[labelIndex].images[labelObject[labelIndex].selectIndex].borderColor = this.data.normalColor;
    // 禁用编辑按钮
    labelObject[labelIndex].disable = true;
    this.setData({
      labelObject
    })
  },

  /**
   * 长按图片进行编辑
   * @param {imageindex: 当前点击的图片索引;labelindex: 标签的索引} event   
   */
  editImage(event) {
    var imageIndex = event.currentTarget.dataset.imageindex;
    var labelIndex = event.currentTarget.dataset.labelindex;
    var labelObject = this.data.labelObject;
    // console.log(imageIndex + ':' + labelIndex)
    if(labelObject[labelIndex].disable) {
      labelObject[labelIndex].images[imageIndex].borderColor = this.data.selectedColor;
      // 启用编辑按钮
      labelObject[labelIndex].disable = false;
      // 更新标签中选中的图片索引
      labelObject[labelIndex].selectIndex = imageIndex;
      this.setData({
        labelObject
      })
    }
  },


  /**
   * 点击图片预览大图
   * @param {imageindex: 当前点击的图片索引;labelindex: 标签的索引} event   
   */
  viewImage: function (event) {
    var imageIndex = event.currentTarget.dataset.imageindex;
    var labelIndex = event.currentTarget.dataset.labelindex;
    var imgUrls = this.data.imgUrls;
    var labelObject = this.data.labelObject;
    // console.log(imageIndex + ':' + labelIndex)
    // 禁用编辑按钮
    labelObject[labelIndex].disable = true;
    // 改变选中图片边框颜色
    labelObject[labelIndex].images[labelObject[labelIndex].selectIndex].borderColor = this.data.normalColor;
    this.setData({labelObject});
    if(imgUrls[labelIndex][imageIndex] != '') {
      wx.previewImage({
        current: imgUrls[labelIndex][imageIndex], // 当前显示图片的http链接
        urls: imgUrls[labelIndex] // 需要预览的图片http链接列表
      })
    }
  },

  /**
   * 空状态的上传图片，即第一次上传
   * @param {event.currentTarget.dataset.index: 当前上传的标签索引} event  
   */
  firstUpload: function (event) {
    const that = this;
    var labelIndex = event.currentTarget.dataset.index;
    var labelObject = this.data.labelObject;
    wx.chooseMedia({
      count: 9,
      mediaType: ['image','video'],
      sourceType: ['album', 'camera'],
      maxDuration: 30,
      camera: 'back',
      success(res) {
        var imgUrls = that.data.imgUrls;
        for(let i = 0; i < 9; i++) {
          if(i < res.tempFiles.length) {// 上传的图片直接赋值url显示
            labelObject[labelIndex].images.push({
              url: res.tempFiles[i].tempFilePath,
              borderColor: that.data.normalColor
            });
            imgUrls[labelIndex].push(res.tempFiles[i].tempFilePath);
          } else {// 不足9张的部分显示空图片
            labelObject[labelIndex].images.push({
              url: '',
              borderColor: that.data.normalColor
            });
            imgUrls[labelIndex].push('');
          }
        }
        labelObject[labelIndex].urlsEmpty = false;
        that.setData({
          labelObject,
          imgUrls
        })
      },
      fail: console.error
    })
  },

  /**
   * 发布图片，把分类标签下上传的图片存储到云存储
   * @param {event.currentTarget.dataset.index: 当前发布的标签索引} event 
   */
  onPublish: function (event) {
    var data = this.data;
    var labelIndex = event.currentTarget.dataset.index;
    var labelObject = this.data.labelObject;
    labelObject[labelIndex].imgUrls.forEach( (item,index) => {
      wx.cloud.uploadFile({
        cloudPath: 'product_img/' + data.brandName + '/' + data.labelObject[labelIndex].labelName + '/' + index + '.' + (new Date()).getTime() + '.png', // 上传至云端的路径
        filePath: item, // 小程序临时文件路径
        success: res => {
          console.log(res.fileID);
        }
      })
    })
    Toast.success({
      message: '发布成功',
      duration: 1000
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    // 得到商家的标签分类
    db.collection('product').where({
      _openid: app.globalData.openid
    })
    .get({
      success: function (res) {
        var labelData = res.data[0].labels;
        var labelObject = that.data.labelObject;
        var imageObject = that.data.imageObject;
        var imgUrls = that.data.imgUrls;
        // console.log(labelData)
        for(let i = 0; i < labelData.length; i++) {
          imgUrls.push(labelData[i].imgUrls)
          that.setData({
            imgUrls
          })
          if(labelData[i].imgUrls.length == 0) {
            labelObject.push({
              labelName: labelData[i].labelName,
              images:[],
              disable: true,
              selectIndex: 0,
              urlsEmpty: true//显示空状态
            })
          } else {
            var imagesBuffer = [];
            labelData[i].imgUrls.forEach( url => {
              imagesBuffer.push({
                url: url,
                borderColor: that.data.normalColor
              })
            } )
            labelObject.push({
              labelName: labelData[i].labelName,
              images: imagesBuffer,
              disable: true,
              selectIndex: 0,
              urlsEmpty: false//不显示空状态
            })
          }
        }
        // console.log(labelObject)
        that.setData({
          labelObject,
          imageObject,
          brandName: res.data[0].brandName
        });
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