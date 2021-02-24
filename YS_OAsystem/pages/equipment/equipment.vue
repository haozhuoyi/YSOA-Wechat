<template>
	<view>
		<view id="target" class="popup_success" :style="{opacity: successOpacity}">
			{{infoMessage}}
		</view>
		<view>
			<drag-button
				:isDock="true"
				:existTabBar="true"
				@btnClick="equipmentAdd()"/>
		</view>
		<view class="list-main">
			<list>
			    <!-- 注意事项: 不能使用 index 作为 key 的唯一标识 -->
			    <cell v-for="(item, index) in dataList" :key="item.id">
			      <view class="div-cell">
					  <view class="div-no">No:{{item.id}}</view>
					  <view class="view-main">
						  <view class="view-mainLeft">
							  <view class="view-address">
								  <view class="address-title">名称:</view>
								  <view class="address-content">{{item.device_name}}</view>
							  </view>
							  <view class="view-address">
								  <view class="address-title">型号:</view>
								  <view class="address-content">{{item.device_assetno}}</view>
							  </view>
							  <view class="view-year">
								  <view class="address-title">租借日期:</view>
								  <view class="address-content">{{item.startdate}}</view>
							  </view>
						  </view>
						  <view class="view-mainRight">
							<view class="div-confirm">
								<uni-icons :type="item.enddate === '9999-12-31'?'spinner-cycle':'checkmarkempty'" size="30"
								:color="item.enddate === '9999-12-31'?'red':'rgb(83,214,75)'"></uni-icons>
								<view class="div-confirmText">{{item.enddate === '9999-12-31'?'使用中':'已归还'}}</view>
							</view>					  
						  </view>
					  </view>
					  <view class="view-button">
						  <button class="button-edit" :disabled="item.enddate !== '9999-12-31'" @click="equipmentReturn(item)">归还</button>
					  </view>
				  </view>
			    </cell>
			</list>
		</view>
	</view>
</template>

<script>
	import dragButton from "@/components/drag-button/drag-button.vue";
	// api
	import { getEquipmentListApi, equipmentReturnApi} from './api.js'
	export default {
		components: {
			dragButton
		},
		data() {
			return {
				// 数据源
				dataList:[],
				// 是否刷新flg
				refreshFlg:false,
				// 弹窗透明度
				successOpacity:0,
				// 申请成功flg
				applySuccess:false,
				// 弹窗内容
				infoMessage:""
			}
		},
		methods:{
			// 获取列表数据
			getEquipmentList(){
				const that = this
				that.dataList = []
				that.$api.get(getEquipmentListApi, {})
				.then(res => {
				    that.dataList = res.data
				    console.log(that.dataList)
				}).catch(err => {
				    console.log(err)
				})
			},
			// 跳转申请设备界面
			equipmentAdd(){
				uni.navigateTo({
					url: '../equipmentEdit/equipmentEdit',
					success: res => {},
					fail: () => {},
					complete: () => {}
				});
			},
			// 归还设备
			equipmentReturn(item){
				const that = this
				that.$api.post(equipmentReturnApi, {
					'action':'returndevice',
					'id':item.id
				})
				.then(res => {
				    // 刷新
				    that.getEquipmentList()
				    that.showInfo("归还成功")
				    console.log(res)
				}).catch(err => {
				    console.log(err)
				})
			},
			// 显示弹窗
			showInfo(info){
				this.infoMessage = info
				this.successOpacity = 1;
				setTimeout(()=>{   //设置延迟执行
					this.successOpacity = 0;
					this.applySuccess = false
				},1500);
			},
			// 请求错误弹窗
			requestError(e){
				this.showInfo(e)
				return
			}
		},
		// refreshFlg控制是否刷新
		// editSuccess控制是否显示弹窗
		// ＊＊＊onLoad只有进入界面时触发，后退不会触发。onShow在界面每次处于最上层时都会触发。＊＊＊
		onLoad (option) {
			this.refreshFlg = option.refresh
			console.log(option.refresh)
		},
		onShow(){
			if(this.refreshFlg){
				this.getEquipmentList()
			}
			if(this.applySuccess){
				this.showInfo("申请成功")
			}
			this.refreshFlg = false
		}
	}
</script>

<style>
	.div-cell{
		height: 200px;
		width: calc(100vw - 40px);
		border-radius: 2%;
		background-color: white;
		margin: 0 0 10px 10px;
		padding: 5px 10px 10px 10px;
	}
	
	.list-main{
		background: #f1f1f1;
		padding-top: 10px;
		padding-bottom: 1px;
		overflow-x: hidden;
	}
	
	.div-no{
		font-size: 12px;
		font-weight: bold;
	}
	
	.div-sub{
		height: 60px;
		margin-top: 10px;
	}
	
	.div-housingSub{
		height: 30px;
		line-height: 30px;
		text-align: end;
		font-size: 17px;
		font-weight: bold;
		padding-right: 10px;
	}
	
	.div-confirm{
		float: left;
		margin-top: 25px;
		width: 100%;
		text-align: center;
	}
	
	.div-transportSub{
		height: 30px;
		line-height: 30px;
		font-size: 17px;
		font-weight: bold;
		padding-left: 10px;
	}
	
	.div-housingSubText{
		text-align: end;
		font-size: 15px;
		color: #898989;
	}
	
	.div-confirmText{
		margin-top: 20px;
		text-align: center;
	}
	
	.div-transportSubText{
		font-size: 15px;
		color: #898989;
	}
	
	.view-transport{
		width: 30%;
		float: left;
		height: 70px;
	}
	
	.view-housing{
		float: left;
		width: 30%;
		height: 70px;
	}
	
	.view-address{
		height: 20px;
		margin-top: 30px;
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
	}
	
	.view-year{
		margin-top: 30px;
		height: 20px;
	}
	
	.view-button{
		height: 30px;
		margin-top:10px;
	}
	
	.button-edit{
		float: right;
		width: 80px;
		font-size: 12px;
		height: 25px;
		line-height: 25px;
		background-color: white;
		border-radius: 10%;
		border: #898989 0.1px solid;
		margin-right: 15px;
	}
	
	.view-mainLeft{
		float: left;
		width: 60%;
		height: 150px;
	}
	
	.view-mainRight{
		float: left;
		width: 30%;
		height: 150px;
	}
	
	.view-main{
		width: 100vw;
		height: 150px;
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
