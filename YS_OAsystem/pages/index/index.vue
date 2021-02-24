<template>
	<view>
		<view ref="popup" class="popup_view" v-show="showPopFlg">
			<button class="login_button" @click="login" open-type="getPhoneNumber" @getphonenumber="decryptPhoneNumber">
				<view class="view-icon">
					<uni-icons type="weixin" size="25" class="icon_wechat"></uni-icons>
					微信登录
				</view>
				<view class="view-info">
					获取您的手机号用于查询个人信息
				</view>
			</button>
		</view>
		<view id="target" class="popup_success" :style="{opacity: successOpacity}">
			{{infoMessage}}
		</view>
		<view class="container">
			<view class="intro_view">
				<swiper class="swiper" :indicator-dots="true" :autoplay="true" :interval="4000">
					<swiper-item class="view-swipper">
						<view class="view-swipperImage">
							<image :src=AUrl class="image-A"></image>
						</view>
					</swiper-item>
					<swiper-item class="view-swipper">
						<view class="view-swipperImage">
							<image :src=BUrl class="image-A"></image>
						</view>
					</swiper-item class="view-swipper">
				</swiper>
			</view>
			<view class="main_view">
				<view class="row_view">
					<view class="solo_view_left" @click="addressClick">
						<view class="icon_view">
							<uni-icons type="home-filled" size="25" color="#898989"></uni-icons>
						</view>
						<view class="text_view">
							<view class="text_view_up">家庭住址</view>
							<view class="text_view_down">修改与确认</view>
						</view>
					</view>
					<view class="solo_view_right" @click="equipmentClick">
						<view class="icon_view">
							<uni-icons type="phone" size="25" color="#898989"></uni-icons>
						</view>
						<view class="text_view">
							<view class="text_view_up">设备信息</view>
							<view class="text_view_down">领用与归还</view>
						</view>
					</view>
				</view>
				<view class="row_view">
					<view class="solo_view_left" @click="conferenceRoomClick">
						<view class="icon_view">
							<uni-icons type="contact" size="25" color="#898989"></uni-icons>
						</view>
						<view class="text_view">
							<view class="text_view_up">会议室申请</view>
							<view class="text_view_down">查看与申请</view>
						</view>
					</view>
					<view class="solo_view_right" @click="workAttendanceClick">
						<view class="icon_view">
							<uni-icons type="compose" size="25" color="#898989"></uni-icons>
						</view>
						<view class="text_view">
							<view class="text_view_up">考勤</view>
							<view class="text_view_down">考勤数据辅正</view>
						</view>
					</view>
				</view>
				<view class="row_view">
					<view class="solo_view_left" @click="passPortClick">
						<view class="icon_view">
							<uni-icons type="personadd" size="25" color="#898989"></uni-icons>
						</view>
						<view class="text_view">
							<view class="text_view_up">我的护照</view>
							<view class="text_view_down">护照信息登陆</view>
						</view>
					</view>
					<view></view>
				</view>
				<view class="row_view">
					<view class="solo_view_left"></view>
					<view></view>
				</view>
				<view class="more_view">
					<view class="solo_view_more">更多功能</view>
					<view class="solo_view_more_icon">
						<uni-icons type="arrowdown" size="15" color="#898989"></uni-icons>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import uniIcons from "@/components/uni-icons/uni-icons.vue"
	// api
	import { decryptPhoneNumberApi, makeTokenApi, saveWXinfoApi, checkMsgFlgApi} from './api.js'
	export default {
		components: {
			uniIcons
		},
		data() {
			return {
				// 遮罩显示flg
				showPopFlg:true,
				// 弹窗透明度
				successOpacity:0,
				// 弹窗内容
				infoMessage:"",
				// 用户姓名
				userName:"",
				// 走马灯图片
				BUrl: require("../../assets/img/8-1.jpeg"),
				AUrl: require("../../assets/img/logo.jpg")
			}
		},
		methods: {
			// 获取小程序开放id
			login(){
				const that = this;
				wx.login({
				  success (res) {
				    if (res.code) {
				      //发起网络请求
				      wx.request({
				        url: 'https://newoa.yshz.com.cn/api/wechat/getOpenId',
				        data: {
				          code: res.code
				        },
						success(idcode) {
							let phpSessid = idcode.header["Set-Cookie"]
							console.log(phpSessid)
							let endIndex = phpSessid.indexOf(";") + 1
							wx.setStorageSync("PHPSESSID", phpSessid.substring(0,endIndex))
						},
						fail(e){
							that.requestError(e)
							return
						}
				      })
				    } else {
				      that.requestError(e)
					  return
				    }
				  }
				})
			},
			// 解析手机号
			decryptPhoneNumber(e){
				const that = this;
				that.$api.post(decryptPhoneNumberApi, {
					iv: e.detail.iv,
					data:e.detail.encryptedData
				}).then(res => {
				    if(res === "手机号不存在"){
				    	that.requestError("非本公司人员无法登陆")
				    	return
				    }
				    if(res.purePhoneNumber === undefined){
				    	that.requestError("手机号获取失败，请重新尝试")
				    	return
				    }
				    console.log(res)
				    that.userName = res.userName
				    //制作thinkPHP所需_token_
					that.$api.get(makeTokenApi, {})
					.then(res2 => {
					    console.log(res2)
					    that.ysoaLogin(res2,res.purePhoneNumber)
					}).catch(err => {
					    console.log(err)
					})
				}).catch(err => {
				    console.log(err)
				})
			},
			//登录ysoa系统
			ysoaLogin(token,phoneNum){
				const that = this;
				wx.request({
					url: 'https://newoa.yshz.com.cn/index/user/login.html',
					method:'POST',
					data: {
						url: 'https://newoa.yshz.com.cn/index/user/index.html',
						__token__:token,
						account:phoneNum,
						password:'weChatLogin',
						wechatlogin:'wechat',
						keeplodin:1
					},
					header: {
						'cookie': wx.getStorageSync("PHPSESSID")
					},
					success(token) {
						console.log(token)
						let uid = token.header["Set-Cookie"].substring(0,7)
						let phpToken = token.header["Set-Cookie"].substring(15,58)
						wx.setStorageSync("LOGINTOKEN", uid + phpToken)
						// 隐藏遮罩
						that.showPopFlg = false;
						that.showInfo("欢迎您," + that.userName)
						// 显示tabbar
						uni.showTabBar()
						that.checkMsgFlg()
						
					},
					fail(e){
						that.requestError(e)
						return
					}
				})
			},
			
			//保存微信信息
			saveWXinfo(result){
				const that = this;
				that.$api.post(saveWXinfoApi, {
					'msgFlg': result
				}).then(res => {
				    console.log(res)
				}).catch(err => {
				    console.log(err)
				})
			},
			// 查询是否拥有msg权限
			checkMsgFlg(){
				const that = this;
				that.$api.get(checkMsgFlgApi, {})
				.then(res => {
				    console.log(res)
				    if(res.length === 0 || res[0].msg_flg === 0){
				    	wx.showModal({
				    		title: '提示',
				    		content: '即将订阅考勤确认信息',
				    		showCancel: false,
				    		success:function(){
				    			wx.requestSubscribeMessage({
				    			  tmplIds: ['BctmDgJfYxtn2j1kWuzr9vpU2bO_eFX2jpUVTU0hCU0'],
				    			  success (res) {
				    				that.saveWXinfo(1)
				    			  },
				    			  fail(res){
				    				that.saveWXinfo(0)
				    				console.log(res)
				    			  }
				    			})
				    		}
				    	})
				    }
				}).catch(err => {
				    console.log(err)
				})
			},
			// 跳转地址列表
			addressClick(){
				uni.navigateTo({
					url: '../address/address?refresh=true',
					success: res => {},
					fail: () => {},
					complete: () => {}
				});
			},
			// 跳转设备列表
			equipmentClick(){
				uni.navigateTo({
					url: '../equipment/equipment?refresh=true',
					success: res => {},
					fail: () => {},
					complete: () => {}
				});
			},
			// 跳转会议室申请
			conferenceRoomClick(){
				uni.navigateTo({
					url: '../conferenceRoom/conferenceRoom?refresh=true',
					success: res => {},
					fail: () => {},
					complete: () => {}
				});
			},
			// 跳转考勤数据辅正
			workAttendanceClick(){
				uni.navigateTo({
					url: '../workAttendance/workAttendance?refresh=true',
					success: res => {},
					fail: () => {},
					complete: () => {}
				});
			},
			passPortClick(){
				uni.navigateTo({
					url: '../passPort/passPort',
					success: res => {},
					fail: () => {},
					complete: () => {}
				});
			},
			// 显示info弹窗
			showInfo(message){
				this.infoMessage = message
				this.successOpacity = 1;
				setTimeout(()=>{   //设置延迟执行
					this.successOpacity = 0;
				},2500);
			},
			// 请求错误弹窗
			requestError(e){
				this.showInfo(e)
			}
		},
		onLoad() {
			// 隐藏tabbar
			uni.hideTabBar()
		}
	}
</script>

<style>
	.container {
		padding:10px 20px 20px 20px;
		font-size: 14px;
		line-height: 24px;
		z-index: 1;
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
		padding-left: 20px;
	}
	.login_button{
		position: fixed;
		bottom: 20px;
		width: calc(100% - 40px);
		background: #4CD964;
		height: 65px;
		line-height: 50px;
	}
	.icon_wechat{
		padding-right: 5px;
	}
	.intro_view{
		height: 150px;
		border-radius: 3%;
	}
	.main_view{
		height: 395px;
		border-radius: 3%;
		margin-top: 20px;
		box-shadow: 0 0 10px #b2b2b2;
		display: inherit;
	}
	.row_view{
		height: 90px;
		width: 100%;
		border-bottom: #dcdcdc 1.3px solid;
		display: flex;
	}
	.solo_view_left{
		height: 90px;
		width: 50%;
		border-right: #dcdcdc 1.3px solid;
	}
	.solo_view_right{
		height: 90px;
		width: 49%;
	}
	.more_view{
		text-align: right;
		line-height: 30px;
		display: flex;
	}
	.solo_view_more{
		width: 56%;
		color: #898989;
		font-size: 12px;
	}
	.icon_view{
		float: left;
		line-height: 88.7px;
		margin-left: 20px;
		margin-right: 8px;
	}
	.text_view{
		float: left;
	}
	.text_view_up{
		padding-top: 22px;
		height: 23px;
		font-size:15px;
		font-weight: bold;
	}
	.text_view_down{
		height: 45px;
		color: #898989;
		font-size:13px;
	}
	.controls-title {
		width: 100%;
		text-align: center;
		color: #898989;
		line-height: 100vh;
		position:fixed;
		font-size: 18px;
	}
	.popup_success{
		position: relative;
		text-align: center;
		width: 100vw;
		height: 30px;
		line-height: 30px;
		background-color: rgb(180,27,18);
		color: white;
		transition: opacity 1s linear;
		z-index: 10;
	}
	
	.view-swipperImage{
		width: 100%;
		height: 100%;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.image-A{
		width: 100%;
	}
	
	.body{
	    /*距离顶部范围应该在118-122范围内*/
	    padding-bottom: 118upx;
	}
	
	.view-info{
		color: white;
		font-size: 12px;
	}
	
	.view-icon{
		height: 27px;
	}
</style>
