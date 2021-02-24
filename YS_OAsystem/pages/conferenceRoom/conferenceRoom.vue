<template>
	<view class="view-main">
		<view id="target" class="popup_success" :style="{opacity: successOpacity}">
			{{errorMessage}}
		</view>
		<view class="popup_view" v-show="showPopFlg">
			 <cmd-progress type="circle" :percent="loadPercent" stroke-color="rgb(180,27,18)"></cmd-progress>
		</view>
		<view class="view-dateList">
			<view class="view-for" v-for="(item,i) in dateArray" :key="i">
				<view class="view-item">
					<view class="view-week" :style="{ color: item[0][7] == '六'||item[0][7] == '日' ? 'rgb(180,27,18)' : '#898989' }">
						{{item[0][7]}}
					</view>
					<view class="view-date">
						<view class="view-back" @click="dateChange(i,item)"
						:style="{backgroundColor:colorArray[i][0],color:colorArray[i][1]}">
							{{i == 0 ? "今":item[0].substring(3,5)}}
						</view>
					</view>
					<view class="view-point">
						<view class="point" v-if="item[1].length > 2"></view>
					</view>
				</view>
			</view>
		</view>
		<view class="view-dateShow">
			{{chooseDate}}
		</view>
		<view class="view-add" @click="conferenceRoomAddJump()">
			<uni-icons type="plusempty" size="25" color="#FFF"></uni-icons>
		</view>
		<view class="view-conferenceInfo">
			<list>
			    <!-- 注意事项: 不能使用 index 作为 key 的唯一标识 -->
			    <cell v-for="(item, index) in conferenceArray[showIndex]" :key="item[0]">
					<view class="view-info"  v-if="item[0] !== 'add'">
						<view class="view-time">
							<uni-icons v-if="item[0] === 'red'" type="flag-filled" size="25" color="rgb(180,27,18)"></uni-icons>
							<view v-if="item[0] !== 'red'">{{item[0] !== "red"?item[0] + ':':""}}(UTC+09:00)东京</view>
						</view>
						<view class="view-detail">
							<view>{{item[1]}}</view>
						</view>
					</view>
				</cell>
			</list>
		</view>
	</view>
</template>

<script>
	import cmdProgress from "@/components/cmd-progress/cmd-progress.vue"
	// api
	import { makeCoferenceRoomDataApi} from './api.js'
	export default {
		components: {cmdProgress},
		data() {
			return {
				loginToken:"",
				loginCookie:"",
				dateArray:[],
				conferenceArray:[],
				colorArray:[['rgb(180,27,18)','#fff'],['',''],['',''],
							['',''],['',''],['',''],['','']],
				chooseDate:"",
				showIndex:0,
				showPopFlg:true,
				loadPercent:0,
				refreshFlg:false,
				applySuccess:false,
				// 弹窗透明度
				successOpacity:0,
				// 弹窗内容
				errorMessage:"",
			}
		},
		methods:{
			// 获取cookie和token
			getCookieAndToken(){
				const that = this
				wx.request({
					url: 'https://newoa.yshz.com.cn/api/wechat/getCybozu',
					success(cybozuResults) {
						console.log(cybozuResults)
						that.loginToken = that.tokenMake(cybozuResults)
						that.loginCookie = that.cookieMake(cybozuResults) + "CYBOZU_COM_DOMAIN=ys-group;"
						that.loadPercent = 20
						that.cybozuLogin()
					},
					fail(e){
						console.log(e)
						// that.requestError(e)
					}
				})
			},
			// 处理token
			tokenMake(cybozuResults){
				let tokenResult = ""
				let tokenResults = cybozuResults.data[0]
				let tokenIndex = tokenResults.indexOf("cybozu.data.REQUEST_TOKEN = '")
				tokenIndex = tokenIndex + 29
				tokenResult = tokenResults.substring(tokenIndex,tokenIndex + 36)
				console.log(tokenResult)
				return tokenResult
			},
			// 处理cookie
			cookieMake(cybozuResults){
				let cookieArray = cybozuResults.data[1]
				let cookie = ""
				for(let i=0;i<cookieArray.length;i++){
					let item = cookieArray[i]
					if(item.substring(0,10) === "Set-Cookie"){
						let endIndex = item.indexOf(";")
						let jsessionId = item.substring(11,endIndex + 1)
						cookie = cookie + jsessionId
					}
				}
				console.log(cookie)
				return cookie
			},
			// cybozu登录
			cybozuLogin(){
				const that = this
				wx.request({
					url: 'https://ys-group.cybozu.com/api/auth/login.json?_lc=ja',
					method:"POST",
					header:{
						cookie:that.loginCookie
					},
					data:{
						"username":"yshz",
						"password":"Yshz2020",
						"keepUsername":false,
						"redirect":"",
						"__REQUEST_TOKEN__":that.loginToken
					},
					success(cybozuResults) {
						let setCookie = cybozuResults.header["Set-Cookie"]
						console.log(setCookie)
						// 保存cookie至storage
						wx.setStorageSync("CYBOZUCOOKIE", that.swapJsessionId(setCookie))
						that.loadPercent = 40
						// 获取会议室网页数据
						that.getCoferenceRoomData()
					},
					fail(e){
						console.log(e)
						// that.requestError(e)
					}
				})
			},
			// 将login cookie替换成user cookie
			swapJsessionId(setCookie){
				let jsessionIndex = setCookie.indexOf("JSESSIONID")
				let endIndex = setCookie.indexOf(";",jsessionIndex) + 1
				let userCookie = setCookie.substring(jsessionIndex,endIndex)
				
				let oldJsessionIndex = this.loginCookie.indexOf("JSESSIONID")
				let oldEndIndex = setCookie.indexOf(";",oldJsessionIndex) + 3
				userCookie = userCookie + 
								this.loginCookie.substring(oldEndIndex) + 
								this.loginCookie.substring(0,oldJsessionIndex)
									
				console.log(userCookie)
				return userCookie
			},
			// 获取会议室网页数据
			getCoferenceRoomData(){
				const that = this
				//获取现在时间
				let aData = new Date();
				let dateValue = aData.getFullYear() + "-" + (aData.getMonth() + 1) + "-" + aData.getDate();
				wx.request({
					url: 'https://ys-group.cybozu.com/g/schedule/index.csp?&bdate=' + dateValue + '&gid=f7&p=',
					method:"GET",
					header:{
						'cookie': wx.getStorageSync("CYBOZUCOOKIE"),
						'Accept-Language': 'zh-CN,zh;q=0.9'
					},
					success(cybozuResults) {
						console.log(cybozuResults.data)
						// 截取会议室网页数据
						let cutOverData = that.cutCoferenceRoomData(cybozuResults.data)
						that.loadPercent = 70
						// 后台处理截取后数据，查询dom节点
						that.makeCoferenceRoomData(cutOverData)
					},
					fail(e){
						console.log(e)
						// that.requestError(e)
					}
				})
			},
			// 截取会议室网页数据
			cutCoferenceRoomData(coferenceRoomData){
				let startIndex = coferenceRoomData.indexOf('<tbody  id="event_list">')
				let endIndex = coferenceRoomData.indexOf('</tbody>',startIndex) + 8
				let cutconferenceRoomData = coferenceRoomData.substring(startIndex,endIndex)
				
				let reg=new RegExp('&nbsp;','g')
				cutconferenceRoomData = cutconferenceRoomData.replace(reg,"")
				console.log(cutconferenceRoomData)
				return cutconferenceRoomData
			},
			// 后台处理截取后数据，查询dom节点
			makeCoferenceRoomData(cutOverData){
				const that = this
				that.$api.post(makeCoferenceRoomDataApi, {
					data:cutOverData
				}).then(res => {
				    console.log(res.data)
				    that.loadPercent = 90
				    that.dateArray = res.data
				    that.conferenceArray = that.dataMake(res.data)
				    that.loadPercent = 100
				    that.chooseDate = res.data[that.showIndex][0]
				    setTimeout(()=>{
				    	that.showPopFlg = false
				    },500);
				}).catch(err => {
				    console.log(err)
				})
			},
			// 会议室数据做成
			dataMake(data) {
				let result = []
				for(let i=0;i<data.length;i++){
					let item = data[i][1]
					result[i] = [["add"]]
					if(item.length === 1){
						// 空
						continue
					}else if(item.length === 2){
						// 红日子
						result[i].push(["red",item[0]])
					}else if(item.length > 2 ){
						// 会议室安排
						for(let j=0;j<(item.length - 1)/2;j++){
							result[i].push([item[(j * 2) + 1],item[(j * 2) + 2]])
						}
					}
				}
				console.log(result)
				return result
			},
			dateChange(i,item){
				this.colorArray = [["",""],["",""],["",""],["",""],["",""],["",""],["",""]]
				this.colorArray[i] = ['rgb(180,27,18)','#fff']
				this.$forceUpdate()
				this.chooseDate = item[0]
				this.showIndex = i
				console.log(this.dateArray[this.showIndex])
			},
			conferenceRoomAddJump(){
				const that = this
				let dd = new Date()
				dd.setDate(dd.getDate() + that.showIndex)
				let y = dd.getFullYear();
				let m = (dd.getMonth() + 1) < 10 ? "0" + (dd.getMonth() + 1) : (dd.getMonth() + 1); //获取当前月份的日期，不足10补0  
				let d = dd.getDate() < 10 ? "0" + dd.getDate() : dd.getDate(); //获取当前几号，不足10补0  
				let date = y + "-" + m + "-" + d
				uni.navigateTo({
					url: '../conferenceRoomAdd/conferenceRoomAdd?date=' + date,
					success: res => {},
					fail: () => {},
					complete: () => {}
				});
			},
			// 显示info弹窗
			showInfo(info){
				this.errorMessage = info
				this.successOpacity = 1
				setTimeout(()=>{   //设置延迟执行
					this.successOpacity = 0
				},1500);
			}
		},
		onLoad(option) {
			this.refreshFlg = option.refresh
		},
		onShow(){
			if(this.refreshFlg){
				this.getCookieAndToken()
			}
			if(this.applySuccess){
				this.showInfo("预约成功")
				this.applySuccess = false
			}
			this.refreshFlg = false
		}
	}
</script>

<style>
	.view-main{
		width: 100%;
		height: 100vh;
		background-color: #f1f1f1;
	}
	
	.view-dateList{
		width: 100%;
		height: 80px;
		background-color: white;
	}
	
	.view-item{
		float: left;
		width: 14.28%;
	}
	
	.view-week{
		width: 100%;
		height: 35px;
		text-align: center;
		line-height: 35px;
	}
	
	.view-date{
		width: 100%;
		height: 30px;
		text-align: center;
		line-height: 30px;
	}
	
	.view-back{
		width: 30px;
		height: 30px;
		margin: auto;
		border-radius: 50%;
	}
	
	.view-point{
		width: 100%;
		height: 10px;
		line-height: 10px;
	}
	
	.point{
		width: 4px;
		height: 4px;
		background-color: #646566;
		border-radius: 50%;
		margin: 3px auto;
	}
	
	.view-dateShow{
		width:100%;
		height: 25px;
		background: white;
		box-shadow:0 5px 10px -5px #7A7E83;
		margin-top: 5px;
		text-align: center;
		line-height: 25px;
	}

	.view-conferenceInfo{
		padding: 0 5px;
	}
	
	.view-add{
		width: calc(100% - 10px);
		height: 40px;
		background-color: rgb(180,27,18);
		text-align: center;
		line-height: 40px;
		margin-top: 5px;
		border-radius: 2%;
		margin-bottom: 5px;
		margin-left: 5px;
	}
	
	.view-info{
		width: 100%;
		height: 120px;
		background-color: white;
		border-radius: 2%;
		margin-bottom: 5px;
	}
	
	.view-detail{
		float: left;
		width: calc(100% - 101px);
		height: 100%;
		align-items: center;
		display: flex;
		justify-content: center;
	}
	
	.view-time{
		float: left;
		justify-content: center;
		width: 100px;
		height: 100%;
		border-right: 1px solid rgb(180,27,18);
		text-align: center;
		align-items: center;
		display: flex;
	}
	
	.popup_view{
		z-index: 2;
		position: fixed;
		top: 0;
		left: 0;
		bottom: 0;
		right: 0;
		width: 100%;
		height: 100%;
		background: rgba(0,0,0,0.4);
		line-height: 100vh;
		text-align: center;
	}
	
	.progress{
		width: 200px;
		margin: auto;
	}
	
	.popup_success{
		text-align: center;
		width: 100vw;
		height: 30px;
		line-height: 30px;
		background-color: rgb(180,27,18);
		color: white;
		transition: opacity 1s linear;
		position: absolute
	}
	
</style>
