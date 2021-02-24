<template>
	<view>
		<view id="target" class="popup_success" :style="{opacity: successOpacity}">
			{{infoMessage}}
		</view>
		<view class="list-main">
			<list>
			    <!-- 注意事项: 不能使用 index 作为 key 的唯一标识 -->
			    <cell v-for="(item, index) in dataList" :key="item.id">
			      <view class="div-cell">
					  <view class="div-no">No:{{item.monthly_address_id}}</view>
					  <view class="div-sub">
						<view class="view-housing">
							<view class="div-housingSub">{{item.housingsubsidy}}元</view>
							<view class="div-housingSubText">住房补贴</view>
						</view>
						<view class="div-confirm">
							<uni-icons :type="item.confirm === 1?'checkmarkempty':'closeempty'" size="30"
							:color="item.confirm === 1?'rgb(83,214,75)':'red'"></uni-icons>
							<view class="div-confirmText">{{item.confirm === 1?'已确认':'未确认'}}</view>
						</view>
						<view class="view-transport">
							<view class="div-transportSub">{{item.trafficsubsidy}}元</view>
							<view class="div-transportSubText">交通补贴</view>
						</view>
					  </view>
					  <view class="view-address">
						  <view class="address-title">地址:</view>
						  <view class="address-content">{{item.full_address}}</view>
					  </view>
					  <view class="view-year">
						  <view class="address-title">年月:</view>
						  <view class="address-content">{{item.yearmonth}}</view>
					  </view>
					  <view class="view-button">
						  <button class="button-edit" :disabled="item.confirm === 1" @click="addressConfirm(index)">确认</button>
						  <button class="button-edit" :disabled="item.confirm === 1" @click="addressEdit(index)">修改信息</button>
					  </view>
				  </view>
			    </cell>
			</list>
		</view>
	</view>
</template>

<script>
	// api
	import { getAddressListApi, addressConfirmApi} from './api.js'
	export default {
		data() {
			return {
				// 数据源
				dataList:[],
				// 是否刷新flg
				refreshFlg:false,
				// 是否修改成功flg
				editSuccess:false,
				// 弹窗透明度
				successOpacity:0,
				// 弹窗内容
				infoMessage:""
			}
		},
		methods: {
			// 跳转地址编辑
			addressEdit(index){
				let item = JSON.stringify(this.dataList[index])
				uni.navigateTo({
					url: '../addressEdit/addressEdit?obj=' + item,
					success: res => {},
					fail: () => {},
					complete: () => {}
				});
			},
			// 获取地址列表数据
			getAddressList(){
				const that = this
				that.$api.get(getAddressListApi, {})
				.then(res => {
				    console.log(res)
				    that.dataList = res
				}).catch(err => {
				    console.log(err)
				})
			},
			// 显示info弹窗
			showInfo(info){
				this.infoMessage = info
				this.successOpacity = 1;
				setTimeout(()=>{   //设置延迟执行
					this.successOpacity = 0;
				},1500);
			},
			// 请求错误弹窗
			requestError(e){
				this.showInfo(e)
				return
			},
			// 地址确认
			addressConfirm(index){
				const that = this
				let item = that.dataList[index]
				//发起网络请求
				that.$api.post(addressConfirmApi, {
					yearmonth: item.yearmonth
				})
				.then(res => {
				    that.showInfo("修改成功")
				    that.getAddressList()
				}).catch(err => {
				    console.log(err)
				})
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
				this.getAddressList()
			}
			if(this.editSuccess){
				this.showInfo("修改成功")
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
	width: 40%;
	height: 24px;
	line-height: 24px;
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
	height: 40px;
}

.address-title{
	float: left;
	width: 30px;
	font-size: 12px;
	color: #898989;
	margin-right: 5px;
}

.address-content{
	float: left;
	width: calc(100% - 35px);
	font-size: 12px;
	color: #898989;
}

.view-year{
	margin-top: 20px;
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
	margin-left: 5px;
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
