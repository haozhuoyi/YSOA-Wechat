<template>
	<view class="view-outside">
		<view id="target" class="popup_success" :style="{opacity: successOpacity}">
			{{infoMessage}}
		</view>
		<view class="view-main">
			<view class="view-content">
				<view class="view-title">
					<view class="view-titleUp">
						<view class="view-titleContent">
							个人信息
						</view>
					</view>
					<view class="view-titleDown">
						<view class="view-infoContent">
							由自己编辑，部分内容展示在对外的信息，如昵称、头像等
						</view>
					</view>
				</view>
				<view class="view-head" @click="chooseImage()">
					<view class="head-title">头像</view>
					<view class="head-icon">
						<uni-icons type="forward" color="#898989"></uni-icons>
					</view>
					<view class="head-pic">
						<image :src="userPicSrc" class="image-user"></image>
					</view>
				</view>
				<view class="view-head">
					<view class="head-title">姓名</view>
					<view class="head-text">{{dataSource.name}}</view>
				</view>
				<view class="view-head" @click="bioEditJump()">
					<view class="head-title">自我介绍</view>
					<view class="head-icon">
						<uni-icons type="forward" color="#898989"></uni-icons>
					</view>
					<view class="head-text">{{dataSource.bio}}</view>
				</view>
				<view class="view-head">
					<view class="head-title">电话</view>
					<view class="head-icon">
						<uni-icons type="forward" color="#898989"></uni-icons>
					</view>
					<view class="head-text">{{dataSource.mobile}}</view>
				</view>
				<view class="view-head">
					<view class="head-title">邮箱</view>
					<view class="head-text">{{dataSource.email}}</view>
				</view>
				<view class="view-head">
					<view class="head-title">连续登陆</view>
					<view class="head-text">{{dataSource.successions}}天</view>
				</view>
				<view class="view-head">
					<view class="head-title">最长连续登陆</view>
					<view class="head-text">{{dataSource.maxsuccessions}}天</view>
				</view>
				<view class="view-password" @click="passwordEditJump()">
					修改密码
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	// api
	import { confirmChangeApi, reloadListApi} from './api.js'
	export default {
		data(){
			return{
				// 数据源
				dataSource:{},
				// 用户头像src
				userPicSrc:"",
				// 弹窗透明度
				successOpacity:0,
				// 修改成功flg
				applySuccess:false,
				// 弹窗内容
				infoMessage:""
			}
		},
		methods:{
			//图片变更
			chooseImage(){
				const that = this
				uni.chooseImage({
					count: 1,
					sizeType:['compressed'],
					success(res) {
						// 上传图片
						that.$api.upload(res)
						.then(res => {
							console.log(res)
							that.showInfo("修改成功")
							// 显示上传信息
							const url = JSON.parse(res).data.url
							// 确认
							that.confirmChange(url)
							console.log(url)
						}).catch(err => {
							that.showPopFlg = false
							// that.showInfo(err)
						    console.log(err)
						})
					}
				})
			},
			//变更确认
			confirmChange(avatarSrc = this.dataSource.avatar){
				const that = this
				console.log("datasource:" + JSON.stringify(that.dataSource.bio))
				that.$api.post(confirmChangeApi, {
					avatar:avatarSrc,
					bio:that.dataSource.bio
				}).then(res => {
				    // 刷新
				    that.reloadList()
				    console.log(res)
				}).catch(err => {
				    console.log(err)
				})
			},
			//取得列表
			reloadList(){
				const that = this
				that.$api.get(reloadListApi, {})
				.then(res => {
				   that.dataSource = res
				   //设置头像src
				   that.userPicSrc = "https://newoa.yshz.com.cn" + res.avatar
				   console.log(res)
				}).catch(err => {
				    console.log(err)
				})
			},
			//自我介绍跳转
			bioEditJump(){
				let obj = {
						type:1,
						value:[["自我介绍",this.dataSource.bio,this.dataSource.avatar]]
						}
				this.editJump(obj)
			},
			//密码修改跳转
			passwordEditJump(){
				let obj = {
						type:2,
						value:[["原始密码",""],["新 密 码 ",""],["再次输入",""]]
						}
				this.editJump(obj)
			},
			// 编辑页面跳转
			editJump(obj){
				uni.navigateTo({
					url: '../myEdit/myEdit?obj=' + JSON.stringify(obj),
					success: res => {},
					fail: () => {},
					complete: () => {}
				});
			},
			showInfo(info){
				this.infoMessage = info
				this.successOpacity = 1;
				setTimeout(()=>{   //设置延迟执行
					this.successOpacity = 0;
					this.applySuccess = false
				},1500);
			}
		},
		//初次进入
		onShow() {
			this.reloadList()
			if(this.applySuccess){
				this.showInfo("修改成功")
			}
		}
	}
</script>

<style>
	.view-outside{
		background: #f1f1f1;
		height: 100vh;
	}
	.view-main{
		background: white;
	}
	.view-content{
		width: calc(100vw - 20px);
		margin: auto;
		height: 100%;
	}
	.view-title{
		height: 65px;
	}
	.view-titleUp{
		height: 40px;
		width: 100%;
	}
	.view-titleContent{
		float: left;
		height: 40px;
		line-height: 40px;
		font-size: 18px;
		font-weight: bold;
	}
	.view-titleDown{
		float: left;
		height: 25px;
		font-size: 11px;
		color: #898989;
	}
	.view-head{
		height: 50px;
		line-height: 50px;
		border-bottom: #f1f1f1 1px solid;
	}
	.head-title{
		float: left;
	}
	.head-pic{
		float: right;
		height: 50px;
	}
	.head-icon{
		float: right;
		line-height: 50px;
	}
	.head-text{
		float: right;
		color: #898989;
		margin-right: 5px;
	}
	.view-password{
		height: 50px;
		line-height: 50px;
		color: rgb(180,27,18);
		text-align: center;
	}
	.image-user{
		height: 30px;
		width: 30px;
		margin-top: 10px;
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
