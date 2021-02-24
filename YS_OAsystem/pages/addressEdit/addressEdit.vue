<template>
	<view>
		<view class="view-main">
			<view class="view-transport">
				<view class="view-transTitle">交通方式:</view>
				<view class="view-transInput">
					<input class="input-trans" v-model="editAddress.route" placeholder="<请输入交通方式>"/>
				</view>
			</view>
			<view class="view-address">
				<view class="view-transTitle">家庭地址:</view>
				<view class="view-rightAddress">
					<view class="view-firstAddress">
						<view class="view-addressSel">
							<pickRegions @getRegion="addressSet" class="pickers" :defaultRegion="defaultFirstAddress">
								{{editAddress.city}}
								<uni-icons type="arrowdown" class="icons-pickers" color="#898989"></uni-icons>
							</pickRegions>
						</view>
					</view>
					<view class="view-secondAddress">
						<view class="view-addressSel">
							<input v-model="editAddress.address" placeholder="<请输入详细地址>"/>
						</view>
					</view>
				</view>
			</view>
			<view class="view-distance">
				<view class="view-transTitle">距离:</view>
				<view class="view-addressInput">
					<input type='number' v-model="editAddress.distance" style="width: 40px;" placeholder="0"/>
				</view>
				<view style="float: left;">公里</view>
			</view>
		</view>
		<view class="view-line"></view>
		<view class="view-button">
			<button class="button-confirm" @click="confirm()">确定</button>
		</view>
	</view>
</template>

<script>
	import pickRegions from '@/components/pick-regions/pick-regions.vue'
	// api
	import { confirmApi} from './api.js'
	export default {
		components: {
			pickRegions
		},
		data(){
			return{
				// 数据源
				editAddress:{},
				// 地址下拉列表数据源
				defaultFirstAddress:[]
			}
		},
		methods: {
			// 地址下拉列表选择触发，更改格式为显示所用 A,B,C
			addressSet(region){
				console.log(region)
				this.editAddress.city = region[0].name + ',' + region[1].name + ',' + region[2].name
			},
			// 确定按钮提交
			confirm(result){
				// 修改地址格式为通信所用 A/B/C
				let reg=new RegExp(',','g')
				let city = this.editAddress.city.replace(reg,"/")
				//发起网络请求
				this.$api.post(confirmApi, {
					action: 'changeaddress',
					yearmonth: this.editAddress.yearmonth,
					city: city,
					address: this.editAddress.address,
					distance: this.editAddress.distance,
					route: this.editAddress.route
				}).then(res => {
				    let pages = getCurrentPages();  //获取所有页面栈实例列表
				    let nowPage = pages[ pages.length - 1];  //当前页页面实例
				    let prevPage = pages[ pages.length - 2 ];  //上一页页面实例
				    // 修改前页面刷新flg和编辑完成flg
				    prevPage.$vm.refreshFlg = true;
				    prevPage.$vm.editSuccess = true;
				    // 返回前页面
				    wx.navigateBack({})
				}).catch(err => {
				    console.log(err)
				})
			}
		},
		onLoad (editResults) {
			// 获取前页面传输数据
			this.editAddress = JSON.parse(editResults.obj)
			// 处理地址格式
			this.defaultFirstAddress = this.editAddress.city.split('/')
			const reg=new RegExp('/','g')
			this.editAddress.city = this.editAddress.city.replace(reg,",")
			console.log(this.defaultFirstAddress)
			console.log(this.editAddress)
		}
	}
</script>

<style>
	.view-main{
		padding: 20px 10px 10px 20px;
	}
	
	.view-transport{
		height: 70px;
		border-bottom: #f1f1f1 1px solid;
	}
	
	.view-transTitle{
		float: left;
		width: 70px;
		color: rgb(180,27,18);
	}
	
	.view-transInput{
		float: left;
	}
	
	.input-trans{
		font-weight: bold;
		margin-left: 5px;
	}
	
	.view-address{
		height: 102px;
		margin-top: 20px;
		border-bottom: #f1f1f1 1px solid;
	}
	
	.view-addressSel{
		float: left;
		margin-left: 5px;
		width: calc(100% - 15px);
		font-weight: bold;
	}
	
	.icons-pickers{
		float: right;
	}
	
	.view-rightAddress{
		float: left;
		height: 102px;
		width: calc(100% - 70px);
	}
	
	.view-firstAddress{
		height: 40px;
		border-bottom: #f1f1f1 1px solid;
	}
	
	.view-secondAddress{
		margin-top: 20px;
		height: 40px;
	}
	
	.view-distance{
		height: 70px;
		line-height: 70px;
	}
	
	.view-addressInput{
		margin-top: 23px;
		float: left;
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