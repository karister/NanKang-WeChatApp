// app.js
App({
  globalData: {
    // openid
    openid: '',
    // 用户头像地址
    avatarUrl: '',
    // 用户微信昵称
    nickName: '',
    test: 'test'
  },


  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        traceUser: true,
      });
    }

    const that = this;
    // 获取用户openid
    wx.cloud.callFunction({
      name: 'getOpenid',
      success: function (res) {
        // console.log(res.result.openid);
        that.globalData.openid = res.result.openid;
      },
    })
    // this.globalData = {};
  }
});
