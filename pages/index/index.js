const weatherMap = {
  'sunny': '晴天',
  'cloudy': '多云',
  'overcast': '阴',
  'lightrain': '小雨',
  'heavyrain': '大雨',
  'snow': '雪'
}

const weatherColorMap = {
  'sunny': '#cbeefd',
  'cloudy': '#deeef6',
  'overcast': '#c6ced2',
  'lightrain': '#bdd5e1',
  'heavyrain': '#c5ccd0',
  'snow': '#aae1fc'
}

const QQMapWX = require('../../libs/qqmap-wx-jssdk.js')

Page({
  data: {
    nowTemp: '',
    nowWeather: '',
    nowWeatherBackground: "",
    hourlyWeather: [],
    todayDate:'',
    todayTemp:'',
    city:'广州市',
    locationTipsText:'点击获取当前位置'
  },
  onLoad() {
    this.qqmapsdk = new QQMapWX({
      key:'BRABZ-KRC3I-QMWGU-5KWOD-JOYKF-2LFJJ'
    })
    this.getNow()
  },
  onPullDownRefresh(){
    this.getNow(() => {
      wx.stopPullDownRefresh()
    })
  },
  getNow(callback){
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/now',
      data: {
        city: this.data.city
      },
      success: res => {
        let result = res.data.result
        //console.log(result)
        this.setNow(result)
        this.setHourlyWeather(result)
        this.setToday(result)
      },
      complete: () =>{
        callback && callback()
      }
    })
  },
  //设置now的调用函数
  setNow(result) {
    let temp = result.now.temp
    let weather = result.now.weather
    this.setData({
      nowTemp: temp + '°',
      nowWeather: weatherMap[weather],
      nowWeatherBackground: '/images/' + weather + '-bg.png'
    })
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: weatherColorMap[weather],
    })
  },
  //设置hourlyWeather的调用函数
  setHourlyWeather(result) {
    let forecast = result.forecast
    let hourlyWeather = []
    let nowHour = new Date().getHours()
    for (let i = 0; i < 8; i += 1) {
      hourlyWeather.push({
        time: (i * 3 + nowHour) % 24 + "时",
        iconPath: '/images/' + forecast[i].weather + '-icon.png',
        temp: forecast[i].temp + '°'
      })
    }
    hourlyWeather[0].time = '现在'
    this.setData({
      hourlyWeather: hourlyWeather
    })
  },
  setToday(result) {
    let date = new Date()//let todayDate = new Date()
    this.setData({
      todayDate: `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}今天`,
      todayTemp: `${result.today.minTemp}°~${result.today.maxTemp}°`
    })
  },
  onTapDayWeather(){
    wx.navigateTo({
      url: '/pages/list/list',
    })
  },
  //获取位置信息
  onTapLocation(){
    wx.getLocation({
      success: res => {
        //console.log(res.latitude,res.longitude)
        this.qqmapsdk.reverseGeocoder({
          location:{
            latitude: res.latitude,
            longitude:  res.longitude
          },
          success :res => {
            let city = res.result.address_component.city
            //console.log(city)
            this.setData({
              city:city,
              locationTipsText:''
            })
            this.getNow() //更新city后重新获取天气信息
          }
        })
      }
    })
  }
})