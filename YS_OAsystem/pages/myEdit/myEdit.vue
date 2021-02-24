<template>
	<view>
		<view class="view-main" v-for="(item,i) in resultArray" :key="i">
			<view class="view-distance">
				<view class="view-transTitle">{{item[0]}}:</view>
				<view class="view-addressInput">
					<input v-model="item[1]"/>
				</view>
				<view style="float: left;"></view>
			</view>
		</view>
		<view class="view-line"></view>
		<view class="view-button">
			<button class="button-confirm" @click="confirmChange()">确认</button>
		</view>
	</view>
</template>

<script>
	// api
	import { bioPostApi} from './api.js'
	export default {
		data(){
			return{
				// 界面类型 1:自我介绍 2:修改密码
				type:0,
				// 数据源
				resultArray:[],
				// 自我介绍所用的头像src
				avatar:""
			}
		},
		methods:{
			//变更确认
			confirmChange(){
				if(this.type === 1){
					this.bioPost()
				}else if(this.type === 2){
					this.passwordPost()
				}
			},
			// 自我介绍提交
			bioPost(){
				const that = this
				that.$api.post(bioPostApi, {
					avatar:that.avatar,
					bio:that.resultArray[0][1]
				}).then(res => {
				    // 返回
				    let pages = getCurrentPages();  //获取所有页面栈实例列表
				    let nowPage = pages[ pages.length - 1];  //当前页页面实例
				    let prevPage = pages[ pages.length - 2 ];  //上一页页面实例
				    prevPage.$vm.applySuccess = true;
				    wx.navigateBack({})
				    console.log(res)
				}).catch(err => {
				    console.log(err)
				})
			},
			// 修改密码提交
			passwordPost(){
				const that = this
				wx.request({
				  url: 'https://newoa.yshz.com.cn/index/user/changepwd.html',
				  method:'POST',
				  header: {
				    'cookie': wx.getStorageSync("PHPSESSID") + wx.getStorageSync("LOGINTOKEN")
				  },
				  data:{
					  oldpassword: that.resultArray[0][1],
					  newpassword: that.resultArray[1][1],
					  renewpassword: that.resultArray[2][1],
				  },
				  success(idcode) {
					// 返回
					let pages = getCurrentPages();  //获取所有页面栈实例列表
					let prevPage = pages[ pages.length - 2 ];  //上一页页面实例
					prevPage.$vm.applySuccess = true;
					wx.navigateBack({})
					console.log(idcode)
				  },
				  fail(e){
					console.log(e)
				  }
				})
			}
		},
		onLoad(bioEdit) {
			let resultsArr = JSON.parse(bioEdit.obj)
			this.type = resultsArr.type
			// 自我介绍
			if(this.type === 1){
				this.resultArray = resultsArr.value
				this.avatar = this.resultArray[0][2]
			}else if(this.type === 2){
				// 修改密码
				wx.setNavigationBarTitle({
				    title: '修改密码'
				})
				this.resultArray = resultsArr.value
			}
			console.log(this.resultArray)
		}
	}
</script>

<style>
	.view-main{
		padding: 10px 10px 10px 20px;
	}
	
	.view-distance{
		height: 50px;
		line-height: 50px;
	}
	
	.view-addressInput{
		margin-top: 14px;
		float: left;
		margin-left: 3px;
	}
	
	.view-transTitle{
		float: left;
		width: 70px;
		color: rgb(180,27,18);
	}
	
	.view-line{
		height: 3px;
		width: 100%;
		background-color: #dcdcdc;
	}
	
	.view-button{
		position: absolute;
		bottom: 0;
	}
	
	.button-confirm{
		width: 100vw;
		height: 70px;
		background-color: rgb(180,27,18);
		text-align: center;
		line-height: 50px;
		color: white;
		border-radius: 0;
	}
</style>
