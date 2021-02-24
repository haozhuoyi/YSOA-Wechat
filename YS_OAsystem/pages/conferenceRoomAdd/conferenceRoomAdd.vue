<template>
	<view>
		<view id="target" class="popup_success" :style="{opacity: successOpacity}">
			{{errorMessage}}
		</view>
		<view class="view-main">
			<view class="view-transport">
				<view class="view-equipmentTitle">日期:</view>
				<view class="view-longBorder">
					<input class="input-red" v-model="date" disabled="true"/>
				</view>
			</view>
			<view class="view-transport">
				<view class="view-equipmentTitle">开始时间:</view>
				<view class="view-shortBorder">
					<picker mode="time" :value="startTime" @change="startTimeChange">
						<view style="float: left;">{{startTime}}（UTC+09:00 東京）</view>
						<uni-icons type="arrowdown" style="float: right;" color="#898989"></uni-icons>
					</picker>
				</view>
			</view>
			<view class="view-transport">
				<view class="view-equipmentTitle">结束时间:</view>
				<view class="view-shortBorder">
					<picker mode="time" :value="endTime" @change="endTimeChange">
						<view style="float: left;">{{endTime}}（UTC+09:00 東京）</view>
						<uni-icons type="arrowdown" style="float: right;" color="#898989"></uni-icons>
					</picker>
				</view>
			</view>
			<view class="view-transport">
				<view class="view-equipmentTitle">标题:</view>
				<view class="view-shortBorder">
					<input class="input-title" v-model="title" placeholder="<在此处输入标题>"/>
				</view>
			</view>
			<view class="view-transport">
				<view class="view-equipmentTitle">参会人员:</view>
				<view class="view-shortBorder">
					<input class="input-red" v-model="memberChoose" disabled="true"/>
				</view>
			</view>
			<view class="view-transport">
				<view class="view-equipmentTitle">会议地点:</view>
				<view class="view-shortBorder">
					<input class="input-red" v-model="place" disabled="true"/>
				</view>
			</view>
			<view class="view-conferenceMemo">
				<view class="view-equipmentTitle">备注:</view>
				<view class="view-memberBorder">
					<textarea class="view-manPickerText" v-model="memo"/>
				</view>
			</view>
		</view>
		<view class="view-button">
			<button class="button-confirm" @click="getCsrfTicket()">申请</button>
		</view>
	</view>
</template>

<script>
	export default {
		data(){
			return{
				// 弹窗透明度
				successOpacity:0,
				// 弹窗内容
				errorMessage:"",
				date:"",
				place:"TV会議室（杭州）",
				memo:"",
				startTime: "00:00",
				endTime: "00:00",
				title:"",
				memberChoose: "YS杭州"
			}
		},
		methods:{
			startTimeChange(event){
				let time = event.detail.value
				console.log(time)
				this.startTime = time
			},
			endTimeChange(event){
				let time = event.detail.value
				console.log(time)
				this.endTime = time
			},
			getCsrfTicket(){
				const that = this
				wx.request({
					url: 'https://ys-group.cybozu.com/g/schedule/add.csp?bdate=' + that.date + '&uid=f34&gid=f7',
					header: {
						'cookie': wx.getStorageSync("CYBOZUCOOKIE"),
						'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'
					},
					success(addressResults) {
						let csrfTicket = that.makeCsrfTicket(addressResults.data)
						that.confirm(csrfTicket)
						console.log(addressResults)
					},
					fail(e){
						that.requestError(e)
					}
				})
			},
			makeCsrfTicket(data){
				let startIndex = data.indexOf('"CSRF_TICKET":"') + 15
				let endIndex = startIndex + 32
				let csrfTicket = data.substring(startIndex,endIndex)
				console.log(csrfTicket)
				return csrfTicket
			},
			confirm(csrfTicket){
				const that = this
				let stringArray = that.date.split('-')
				let startTimeArray = that.startTime.split(':')
				let endTimeArray = that.endTime.split(':')
				let sendArray = {
					'tab_name':'schedule/add',
					'tmp_key':1604902225,
					'allow_file_attachment':1,
					'csrf_ticket':csrfTicket,
					'additional_items':"",
					'tab':"",
					'bdate':that.date,
					'uid':'f34',
					'gid':'f7',
					'referer_key':'3c531bb24eaeda35cc2ea604ba21f712',
					'start_year':stringArray[0],
					'start_month':stringArray[1],
					'start_day':stringArray[2],
					'start_hour':startTimeArray[0],
					'start_minute':startTimeArray[1],
					'end_year':stringArray[0],
					'end_month':stringArray[1],
					'end_day':stringArray[2],
					'end_hour':endTimeArray[0],
					'end_minute':endTimeArray[1],
					'timezone_candidate-region':'(All)',
					'all-timezone_candidate':'Asia/Tokyo',
					'timezone_candidate':'Asia/Tokyo',
					'end_timezone_candidate-region':'(All)',
					'all-end_timezone_candidate':'Asia/Tokyo',
					'end_timezone_candidate':'Asia/Tokyo',
					'timezone':'Asia/Tokyo',
					'end_timezone':'Asia/Tokyo',
					'title':that.title,
					'menu':"",
					'selected_users_sUID':'g18',
					'selected_groups_sUID':18,
					'selected_roles_sUID':"",
					'for_redirect_at_non_command_page[]':"",
					'selected_users_sITEM':34,
					'pulldown_head':0,
					'using_purpose':"",
					'company_name':"",
					'zip_code':"",
					'physical_address':"",
					'map_url':"",
					'route':"",
					'route_time':"",
					'route_fare':"",
					'company_telephone_number':"",
					'memo':that.memo,
					'html5':true,
					'upload_ticket':'ca877446a5358acb7dd20cb35771df5b0103b00aec5aca5c722cd5578b7bbc98',
					'private':0,
					'selected_users_p_sUID':"",
					'selected_groups_p_sUID':"",
					'selected_roles_p_sUID':"",
					'for_redirect_at_non_command_page[]':"",
					'use_ajax':1,
					'use_ajax':1
				}
				wx.request({
					url: 'https://ys-group.cybozu.com/g/schedule/command_add.csp?',
					method:'POST',
					header: {
						'cookie': wx.getStorageSync("CYBOZUCOOKIE"),
						'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8',
					},
					data:sendArray,
					success(addressResults) {
						console.log(addressResults.data)
						let data = JSON.stringify(addressResults.data)
						if(data.indexOf("GRN_SCHD_13012") !== -1){
							that.showInfo("结束时间必须大于开始时间")
						}else if(data.indexOf("GRN_SCHD_13208") !== -1){
							that.showInfo("该时间段已有其他预约")
						}else if(data.indexOf("Garoon错误") !== -1){
							that.showInfo("未知错误")
						}else{
							let pages = getCurrentPages();  //获取所有页面栈实例列表
							let nowPage = pages[ pages.length - 1];  //当前页页面实例
							let prevPage = pages[ pages.length - 2 ];  //上一页页面实例
							prevPage.$vm.refreshFlg = true;
							prevPage.$vm.applySuccess = true;
							wx.navigateBack({})
						}
					},
					fail(e){
						that.requestError(e)
					}
				})
			},
			// 显示info弹窗
			showInfo(info){
				this.errorMessage = info
				this.successOpacity = 1;
				setTimeout(()=>{   //设置延迟执行
					this.successOpacity = 0;
				},1500);
			},
		},
		onLoad(editResults) {
			this.date = editResults.date
		}
	}
</script>

<style>
	.view-main{
		padding: 0px 10px 0px 20px;
		border-bottom: #dcdcdc 3px solid;
	}
	
	.view-transport{
		padding-top: 20px;
		height: 40px;
		border-bottom: #f1f1f1 1px solid;
	}
	
	.view-equipmentTitle{
		float: left;
		width: 20%;
		color: rgb(180,27,18);
	}
	
	.view-longBorder {
		float: left;
		margin-left: 5px;
		font-weight: bold;
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

	.view-shortBorder{
		float: left;
		margin-left: 5px;
		font-weight: bold;
	}
	
	.view-memberBorder{
		float: left;
		margin-left: 5px;
		width: calc(100vw - 20% - 40px);
		font-weight: bold;
		height: 80px;
	}
	
	.view-manPickerText{
		float: left;
		width: calc(100% - 20px);
		height: 80px;
	}
	
	.view-conferenceMemo{
		padding-top: 20px;
		height: 80px;
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
