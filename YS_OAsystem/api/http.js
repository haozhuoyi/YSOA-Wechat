const host = 'https://newoa.yshz.com.cn/api'
const uploadUrl = 'https://newoa.yshz.com.cn/index/ajax/upload'

const request = (url, options) => {
   return new Promise((resolve, reject) => {
       wx.request({
           url: host + url,
           method: options.method,
           data: options.method === 'GET' ? options.data : JSON.stringify(options.data),
           header: {
               'Content-Type': 'application/json; charset=UTF-8',
               'cookie': wx.getStorageSync("PHPSESSID") + wx.getStorageSync("LOGINTOKEN")
           },
           success(request) {
               if (request.statusCode === 200) {
                   resolve(request.data)
               } else {
				   showFalse(String(request.statusCode) + ':' + request.data)
                   reject(request.data)
               }
           },
           fail(error) {
			   showFalse(error.data)
               reject(error.data)
           }
       })
   })
}

const uploadRequest = (file) => {
   return new Promise((resolve, reject) => {
	   // 判断图片大小 2M
	   if(file.tempFiles[0].size > 2000000){
			showFalse('文件大小不得大于2M')
			reject()
	   }
	   
       uni.uploadFile({
           url: uploadUrl,
           method: 'POST',
		   //因为有一张图片， 输出下标[0]， 直接输出地址
           filePath: file.tempFilePaths[0],
		   name: 'file',
           header: {
               'cookie': wx.getStorageSync("PHPSESSID") + wx.getStorageSync("LOGINTOKEN")
           },
           success(request) {
               if (request.statusCode === 200) {
                   resolve(request.data)
               } else {
				   showFalse(String(request.statusCode) + ':' + request.data)
                   reject(request.data)
               }
           },
           fail(error) {
			   showFalse(error.data)
               reject(error.data)
           }
       })
   })
}

const showFalse = (falseInfo) => {
	wx.showModal({
	  title: '错误',
	  content: falseInfo,
	  showCancel: false,
	  success (res) {
	    if (res.confirm) {
	      console.log('用户点击确定')
	    }
	  }
	})
}

const get = (url, options = {}) => {
   return request(url, { method: 'GET', data: options })
}

const post = (url, options) => {
   return request(url, { method: 'POST', data: options })
}

const put = (url, options) => {
   return request(url, { method: 'PUT', data: options })
}

const upload = (file) => {
   return uploadRequest(file)
}

module.exports = {
   get,
   post,
   put,
   upload
}