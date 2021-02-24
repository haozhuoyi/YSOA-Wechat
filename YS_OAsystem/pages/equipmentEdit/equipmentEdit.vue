<template>
	<view>
		<view id="target" class="popup_success" :style="{opacity: successOpacity}">
			{{errorMessage}}
		</view>
		<view class="view-main">
			<view class="view-transport">
				<view class="view-equipmentTitle">设备型号:</view>
				<view class="uni-list-cell-db">
					<picker @change="bindPickerChange" :value="index" :range="equipments" range-key="name">
						<view class="uni-input">{{equipments[index].name}}</view>
						<uni-icons type="arrowdown" class="icons-pickersA" color="#898989"></uni-icons>
					</picker>
				</view>
			</view>
			<view class="view-address">
				<view class="view-transTitle">登记日期:</view>
				<view class="view-rightAddress">
					<view class="view-firstAddress" @click="onShowDatePicker()">
						<view class="view-addressSel">
							{{dateValue}}
							<uni-icons type="arrowdown" class="icons-pickers" color="#898989"></uni-icons>
						</view>
					</view>
				</view>
			</view>
		</view>
		<view class="view-line"></view>
		<view class="view-button">
			<button class="button-confirm" @click="confirm()">登记</button>
		</view>
		<mx-date-picker :show="showPicker" type="date" :value="dateValue" color="rgb(180,27,18)" :show-tips="true" @confirm="onSelected" @cancel="onSelected" />
	</view>
</template>

<script>
	import MxDatePicker from "@/components/mx-datepicker/mx-datepicker.vue";
	// api
	import { confirmApi, devicesApi} from './api.js'
	export default {
		components: {
			MxDatePicker
		},
		data(){
			return{
				// 日期选择器
				showPicker:false,
				// 日期选择器默认日期
				dateValue:"2020/01/01",
				// 设备列表
				equipments:[],
				// 设备列表选中项index
				index: 0,
				// 弹窗透明度
				successOpacity:0,
				// 弹窗内容
				errorMessage:""
			}
		},
		methods: {
			// 确定按钮提交
			confirm(result){
				const that = this
				let reg=new RegExp('/','g')
				let date = that.dateValue.replace(reg,"-")
				//发起网络请求
				that.$api.post(confirmApi, {
					action:'receivedevice',
					device_text:that.equipments[that.index].name,
					device:that.equipments[that.index].id,
					startdate:date
				}).then(res => {
					console.log(res)
					if(res.code === 1){
						let pages = getCurrentPages();  //获取所有页面栈实例列表
						let nowPage = pages[ pages.length - 1];  //当前页页面实例
						let prevPage = pages[ pages.length - 2 ];  //上一页页面实例
						prevPage.$vm.refreshFlg = true;
						prevPage.$vm.applySuccess = true;
						wx.navigateBack({})
					}else{
						that.errorMessage = res.msg
						that.successOpacity = 1;
						setTimeout(()=>{   //设置延迟执行
							that.successOpacity = 0;
						},1500);
					}
				}).catch(err => {
				    console.log(err)
				})
			},
			//显示日期选择器
			onShowDatePicker(){
				this.showPicker = true;
			},
			//日期选择器选择
			onSelected(e) {//选择
				this.showPicker = false;
				if(e) {
					this.dateValue = e.value; 
					//选择的值
					console.log('value => '+ e.value);
				}
			},
			// 设备选择器选择
			bindPickerChange(e) {
				console.log('picker发送选择改变，携带值为', e.target.value)
				this.index = e.target.value
			},
		},
		onLoad (editResults) {
			const that = this
			// 设备列表获取
			that.$api.get(devicesApi, {})
			.then(res => {
			    that.equipments = res.list
			    console.log(res)
			}).catch(err => {
			    console.log(err)
			})
		},
		mounted() {
			//获取现在时间
			let aData = new Date();
			this.dateValue = aData.getFullYear() + "/" + (aData.getMonth() + 1) + "/" + aData.getDate();
		}
	}
</script>

<style>
	.view-main{
		padding: 20px 10px 0px 20px;
	}
	
	.view-transport{
		height: 50px;
		border-bottom: #f1f1f1 1px solid;
	}
	
	.view-transTitle{
		float: left;
		width: 70px;
		color: rgb(180,27,18);
	}
	
	.input-trans{
		font-weight: bold;
		margin-left: 5px;
	}
	
	.view-address{
		height: 51px;
		margin-top: 20px;
	}
	
	.view-addressSel{
		float: left;
		width: 100%;
		font-weight: bold;
	}
	
	.icons-pickers{
		float: right;
	}
	
	.view-rightAddress{
		float: left;
		height: 51px;
		width: calc(100% - 95px);
		margin-left: 15px;
	}
	
	.view-firstAddress{
		height: 40px;
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
	
	.uni-input {
		height: 50rpx;
		padding: 15rpx 25rpx;
		line-height:50rpx;
		font-size:28rpx;
		background:#FFF;
		flex: 1;
		float: left;
		white-space: nowrap;
		width:80%
	}
	
	.uni-list-cell-db {
		float: left;
		margin-left: 5px;
		width: calc(100% - 85px);
		font-weight: bold;
	}
	
	.view-equipmentTitle{
		float: left;
		width: 70px;
		color: rgb(180,27,18);
		padding-top: 8px;
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
	
	.icons-pickersA{
		padding-top: 7px;
		float: right;
	}
</style>