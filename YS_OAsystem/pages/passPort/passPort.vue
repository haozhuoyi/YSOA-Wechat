<template>
	<view class="view-main">
		<view id="target" class="popup_success" :style="{opacity: successOpacity}">
			{{infoMessage}}
		</view>
		<view class="popup_view" v-show="showPopFlg">
			 <cmd-progress type="circle" :percent="loadPercent" stroke-color="rgb(180,27,18)"></cmd-progress>
		</view>
		<view class="div-cell">
		  <view class="view-mainLeft">
			  <view class="view-first">
				  <view class="address-title">姓名:</view>
				  <view class="address-content">{{passportInfo.name_cn}}</view>
			  </view>
			  <view class="view-address">
				  <view class="address-title">性别:</view>
				  <view class="address-content">{{passportInfo.sex}}</view>
			  </view>
			  <view class="view-address">
				  <view class="address-title">国籍:</view>
				  <view class="address-content">{{passportInfo.country}}</view>
			  </view>
			  <view class="view-address">
				  <view class="address-title">出生日期:</view>
				  <view class="address-content">{{passportInfo.birth_date}}</view>
			  </view>
			  <view class="view-address">
				  <view class="address-title">出生地点:</view>
				  <view class="address-content">{{passportInfo.birth_place}}</view>
			  </view>
			  <view class="view-address">
				  <view class="address-title">签发日期:</view>
				  <view class="address-content">{{passportInfo.issue_date}}</view>
			  </view>
			  
		  </view>
		  <view class="view-mainRight">
			  <view class="view-first">
				  <view class="address-title">签发地点:</view>
				  <view class="address-content">{{passportInfo.issue_place}}</view>
			  </view>
			  <view class="view-address">
				  <view class="address-title">签发机关:</view>
				  <view class="address-content">{{passportInfo.authority}}</view>
			  </view>
			  <view class="view-address">
				  <view class="address-title">护照类型:</view>
				  <view class="address-content">{{passportInfo.type}}</view>
			  </view>
			  <view class="view-address">
				  <view class="address-title">护照号码:</view>
				  <view class="address-content">{{passportInfo.passport_no}}</view>
			  </view>
			  <view class="view-address">
				  <view class="address-title">有效期至:</view>
				  <view class="address-content">{{passportInfo.expiry_date}}</view>
			  </view>
		  </view>
		  <view class="view-bottom">
			  <view class="view-address">
				  <view class="address-title">身份ID:</view>
				  <view class="address-content">{{passportInfo.person_id}}</view>
			  </view>
			  <view class="view-address">
				  <view class="address-title">末尾二行:</view>
				  <view class="address-content">{{passportInfo.line0}}</view>
			  </view>
			  <view class="view-address">
				  <view class="address-title">末尾一行:</view>
				  <view class="address-content">{{passportInfo.line1}}</view>
			  </view>
		  </view>
		</view>
		<view>
		  <view class="view-add">
			  <view class="view-addLeft" @click="passportPhoto(1)">
				  <uni-icons type="camera" size="25" color="#FFF"></uni-icons>
				  <view class="view-cameraInfo">拍摄护照个人信息页</view>
			  </view>
			  <view class="view-addRight" @click="passportPhoto(2)">
				  <uni-icons type="camera" size="25" color="#FFF"></uni-icons>
				  <view class="view-cameraInfo">签证页</view>
			  </view>
		  </view>
		</view>
		<view class="view-visa">
			<view class="view-visaTitle">
				<view class="view-line1"></view>
				<view class="view-visaText">签证</view>
				<view class="view-line1"></view>
			</view>
			<view class="view-visaList">
				
			</view>
		</view>
	</view>
</template>

<script>
	import cmdProgress from "@/components/cmd-progress/cmd-progress.vue"
	
	// api
	import { passportSpotApi, findPassportInfoApi} from './api.js'
	export default {
		components: {cmdProgress},
		data() {
			return {
				// 弹窗透明度
				successOpacity:0,
				// 弹窗信息
				infoMessage:"",
				// 护照信息
				passportInfo:{},
				visaInfo:{},
				// 进度条flg
				showPopFlg:false,
				// 进度条进度
				loadPercent:0,
			}
		},
		methods:{
			// 护照拍照
			passportPhoto(type){
				if(type === 2){
					wx.showModal({
						title: '提示',
						content: '签证功能未开放',
						showCancel: false,
						success:function(){}
					})
					return
				}
				const that = this
				uni.chooseImage({
					count: 1,
					sizeType:['compressed'],
					success(res) {
						console.log(res)
						that.showPopFlg = true
						that.loadPercent = 10
						
						// 上传图片
						that.$api.upload(res)
						.then(res => {
							console.log(res)
							// 显示上传信息
							const url = JSON.parse(res).data.url
							that.loadPercent = 40
							// 确认
							if(type === 1){
								that.passportSpot(url)
							}else if(type === 2){
								// that.visaSpot(url)
							}
							console.log(url)
						}).catch(err => {
							that.showPopFlg = false
							// that.showInfo(err)
						    console.log(err)
						})
					}
				})
			},
			// 护照照片识别
			passportSpot(url){
				const that = this
				that.loadPercent = 70
				
				that.$api.post(passportSpotApi, {
					'url':url
				}).then(res => {
				    that.loadPercent = 100
				    setTimeout(()=>{
				    	that.showPopFlg = false
				    	that.showInfo("识别成功")
				    },500);
				    console.log(res)
				    that.passportInfo = res
				}).catch(err => {
				    console.log(err)
				})
			},
			// 签证照片识别
			visaSpot(url){
				const that = this
				wx.request({
					url: 'https://newoa.yshz.com.cn/api/wechat/visaSpot',
					method:'POST',
					data:{
						'url':url
					},
					header: {
						'cookie': wx.getStorageSync("PHPSESSID") + wx.getStorageSync("LOGINTOKEN")
					},
					success(addressResults) {
						// 刷新
						console.log(addressResults)
						that.showInfo("识别成功")
						that.passportInfo = addressResults.data
					},
					fail(e){
						that.showInfo(e)
					}
				})
			},
			// 弹窗
			showInfo(info){
				this.infoMessage = info
				this.successOpacity = 1;
				setTimeout(()=>{   //设置延迟执行
					this.successOpacity = 0;
					this.applySuccess = false
				},1500);
			}
		},
		onLoad() {
			// 获取护照数据
			const that = this
			that.$api.get(findPassportInfoApi, {})
			.then(res => {
				console.log(res)
				that.passportInfo = res[0]
			}).catch(err => {
			    console.log(err)
			})
		},
	}
</script>

<style>
	.view-main{
		background: #f1f1f1;
		padding-top: 10px;
		padding-bottom: 1px;
		overflow-x: hidden;
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
	
	.div-cell{
		height: 410px;
		width: calc(100vw - 40px);
		border-radius: 2%;
		background-color: white;
		margin: 0 0 10px 10px;
		padding: 5px 10px 10px 10px;
	}
	
	.view-mainLeft{
		float: left;
		width: 50%;
		height: 265px;
	}
	
	.view-mainRight{
		float: left;
		width: 50%;
		height: 265px;
	}
	
	.view-address{
		height: 20px;
		margin-top: 22px;
	}
	
	.view-first{
		height: 20px;
		margin-top: 15px;
	}
	
	.address-title{
		float: left;
		width: 60px;
		font-size: 12px;
		color: #898989;
	}
	
	.address-content{
		float: left;
		width: calc(100% - 65px);
		font-size: 12px;
		color: #898989;
		word-wrap:break-word;
		word-break:normal; 
	}
	
	.view-bottom{
		width: 100%;
		height: 80px;
		float: left;
		border-top: #000000 1px solid;
	}
	
	.view-add{
		width: calc(100% - 10px);
		height: 60px;
		text-align: center;
		padding: 0px 0px 5px 10px;
	}
	
	.view-cameraInfo{
		color: #FFFFFF;
	}
	
	.view-addLeft{
		float: left;
		border-radius: 3%;
		height: calc(100% - 4px);
		padding-top: 4px;
		background-color: rgb(180,27,18);
		width: 60%;
	}
	
	.view-addRight{
		float: left;
		padding-top: 4px;
		height: calc(100% - 4px);
		border-radius: 3%;
		margin-left: 5px;
		background-color: rgb(180,27,18);
		width: calc(40% - 15px);
	}
	
	.view-visa{
		padding-right: 10px;
	}
	
	.view-visaTitle{
		height: 30px;
		line-height: 30px;
		border-radius: 2%;
		background-color: white;
		margin: 0 0 10px 10px;
		padding: 5px 10px 5px 10px;
	}
	
	.view-line1{
		float: left;
		width: calc(50% - 23px);
		border-top: #000000 1px solid;
		margin-top: 15px;
	}
	
	.view-visaText{
		float: left;
		margin-left: 7px;
		margin-right: 7px;
	}
	
	.view-visaList{
		background: #FFFFFF;
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
</style>
