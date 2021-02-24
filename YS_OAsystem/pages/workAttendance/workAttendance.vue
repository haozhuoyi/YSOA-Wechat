<template>
	<view class="view-main">
		<uni-popup ref="popup" type="center">
		    <uni-popup-message type="success" message="提交成功" :duration="2000"></uni-popup-message>
		</uni-popup>
		<view class="title">
			<view class="title-left">
				<uni-icons type="arrowleft" class="icons-left" size="30" @click="monthLastClick()"></uni-icons>
			</view>
			<view class="title-mid">
				{{choseYear}}年{{choseMonth}}月
			</view>
			<view class="title-right">
				<uni-icons type="arrowright" class="icons-right" size="30" @click="monthNextClick()"></uni-icons>
			</view>
		</view>
			<view class="check">
				<scroll-view scroll-x="true" class="scroll-X"
				@scrolltolower="scrolltolower()" @scrolltoupper="scrolltoupper()" :scroll-left="scrollRight">
					<view style="width: 185vw;">
						<view class="check1">
							<view style="float:left;">规定出勤：</view>
							<view class="text-time">{{setTime}}</view>
							<view class="text-h">h</view>
						</view>
						<view class="check1">
							<view style="float:left;">实际出勤：</view>
							<view class="text-time">{{actualTime}}</view>
							<view class="text-h">h</view>
						</view>
						<view class="check1">有给休：{{haveMoneyRestTime}}&nbsp;h</view>
						<view class="check1">振替休日：{{replaceRestTime}}&nbsp;h</view>
						<view class="check1">工作日加班：{{workingDayOvertime}}&nbsp;h</view>
						<view class="check1">休息日加班：{{restDayOvertime}}&nbsp;h</view>
						<view class="check1">病休：{{illRestTime}}&nbsp;h</view>
						<view class="check1">事休：{{thingRestTime}}&nbsp;h</view>
						<view class="arrow-right" v-show="arrowFlg" @click="goRight()">
							<uni-icons type="arrowright" class="icons-right2" color="black" size="30"></uni-icons>
						</view>
					</view>
				</scroll-view>
			</view>
		<view class="content">
			<scroll-view scroll-y="true" class="scroll-Y">
				<view v-for="(item, index) in workAttendanceList" :key="index" style="margin: 0 5px;">
					<view class="list-item" :style="{ backgroundColor : (item.time_on_duty == '' || item.time_off_duty == '')
													&& (item.week != '六' && item.week != '日' )
													&& (item.summary != 01 && item.summary != 05 && item.summary != 08 && item.summary != 11 && item.summary != 14)
													? 'rgb(255, 208, 223)' : '',
													backgroundColor:(item.week == '六' || item.week == '日'
													 || item.summary == '01' || item.summary == '05' || item.summary == '08' || item.summary == '11' || item.summary == '14')
													 && item.summary != '13'
													?'#e0e0e0':''}">
						<view class="item-left">{{item.date_show}}({{item.week}})</view>
						<view class="item-mid">
							<picker mode="multiSelector" :range="startTimeArray" :value="startTime" @change="startTimeChange(item,$event)" class="picker-left">
								<view class="text-onTime">{{item.time_on_duty == ""?"无":item.time_on_duty}}</view>
								<uni-icons type="arrowdown" class="arrow" color="#898989"></uni-icons>
							</picker>
							<view style="float: left;">--</view>
							<picker mode="multiSelector" :range="endTimeArray" :value="endTime" @change="endTimeChange(item,$event)" class="picker-mid">
								<view class="text-onTime">{{item.time_off_duty == ""?"无":item.time_off_duty}}</view>
								<uni-icons type="arrowdown" class="arrow" color="#898989"></uni-icons>
							</picker>
						</view>
						<view class="item-right">
							<picker mode="selector" :range="summaryArray" range-key="title" @change="memoChange(item,$event)" class="picker-right">
								<view class="view-summary">{{summaryArray[item.new_summary].title}}</view>
								<uni-icons type="arrowdown" style="float: right;" color="#898989"></uni-icons>
							</picker>
						</view>
					</view>
				</view>
			</scroll-view>
		</view>
		<view class="view-button">
			<button class="button-confirm" @click="subAttendanceData()" :disabled="!submitUseFlg"
			 :style="{ backgroundColor : submitUseFlg?'rgb(180,27,18)':'#898989'}">提交</button>
		</view>
	</view>
</template>

<script>
	// 第三方ui
	import uniPopup from '@/components/uni-popup/uni-popup.vue'
	import uniPopupMessage from '@/components/uni-popup/uni-popup-message.vue'
	import uniPopupDialog from '@/components/uni-popup/uni-popup-dialog.vue'
	// api
	import { makeWorkAttendanceTotalDataApi, getWorkAttendanceDataApi
	, getHolidayDataApi, submitSummaryDataApi, submitAttendanceDataApi} from './api.js'
	export default {
		components: {
			uniPopup,
			uniPopupMessage,
			uniPopupDialog
		},
		data() {
			return {
				// 规定出勤时间
				setTime:0,
				// 实际出勤时间
				actualTime:0,
				// 工作日加班时间
				workingDayOvertime:0,
				// 休息日加班时间
				restDayOvertime:0,
				// 有给休时间
				haveMoneyRestTime:0,
				// 事休时间
				thingRestTime:0,
				// 病休时间
				illRestTime:0,
				// 振替休日时间
				replaceRestTime:0,
				// 振替出勤时间
				replaceWorkTime:0,
				// 数据列表
				workAttendanceList:[],
				// 业务年份
				choseYear:0,
				// 业务月份
				choseMonth:0,
				// 下班时间列表
				endTimeArray:[],
				// 上班时间列表
				startTimeArray:[],
				// 上班默认时间
				startTime:[[10],[1]],
				// 下班默认时间
				endTime:[[18],[31]],
				// 节假日列表
				holidayArray:[],
				// 提交按钮是否可用
				submitUseFlg:true,
				// 右滑箭头显示flg
				arrowFlg:true,
				// 滚动区域坐标
				scrollRight:0,
				// 状态列表
				summaryArray:[
					{
						"title":"无",
						"value":"00"
					},
					{
						"title":"有給休",
						"value":"01",
					},
					{
						"title":"事休",
						"value":"05",
					},
					{
						"title":"病休",
						"value":"08",
					},
					{
						"title":"法定休日",
						"value":"11",
					},
					{
						"title":"振替出勤",
						"value":"13",
					},
					{
						"title":"振替休日",
						"value":"14",
					}
				]
			}
		},
		watch:{
			workAttendanceList:{
				handler(val,oldval){
					// 计算实际出勤时间
					this.calActualTime(val)
				},
				deep:true
			}
		},
		methods:{
			// 获取规定出勤时间
			getSetTime(){
				const that = this
				that.$api.post(makeWorkAttendanceTotalDataApi, {
					'year' : that.choseYear,
					'month' : that.choseMonth
				}).then(res => {
				    that.setTime = res
				    console.log(res)
				}).catch(err => {
				    console.log(err)
				})
			},
			//获取上个月日期
			getLastMonth(){
				let date = new Date; 
				let year = date.getFullYear();
				let month = date.getMonth();
				if(month == 0){
					year = year - 1;
					month = 12;
				}
				this.choseYear = year
				this.choseMonth = month
			},
			//获取考勤数据
			getWorkAttendanceData(){
				const that = this
				that.$api.post(getWorkAttendanceDataApi, {
					'year' : that.choseYear,
					'month' : that.choseMonth
				}).then(res => {
				   console.log(res)
				   if(res === "考勤数据未同步"){
				   	that.workAttendanceList = []
				   	that.actualTime = 0
				   	that.workingDayOvertime = 0
				   	that.restDayOvertime = 0
				   	that.submitUseFlg = false
				   	return
				   }
				   that.submitUseFlg = true
				   that.workAttendanceList = res
				}).catch(err => {
				    console.log(err)
				})
			},
			// 上下班时间列表做成
			makeStartAndEndTimeArray(){
				let endHoursList = []
				let endMinutesList = []
				let startHoursList = []
				let startMinutesList = []
				this.endTimeArray=[]
				this.startTimeArray=[]
				// 下班时间小时做成
				for(let i = -1;i<32;i++){
					let hour = i.toString()
					if(hour.length === 1){
						hour = "0" + hour
					}
					if(i === -1){
						hour = "无"
					}
					endHoursList.push(hour)
				}
				// 上班时间小时做成
				for(let i = -1;i<24;i++){
					let hour = i.toString()
					if(hour.length === 1){
						hour = "0" + hour
					}
					if(i === -1){
						hour = "无"
					}
					startHoursList.push(hour)
				}
				// 下班时间分钟做成
				for(let j = -1;j<60;j++){
					let minute = j.toString()
					if(minute.length === 1){
						minute = "0" + minute
					}
					if(j === -1){
						minute = "无"
					}
					endMinutesList.push(minute)
				}
				// 上班时间分钟做成
				for(let j = -1;j<60;j++){
					let minute = j.toString()
					if(minute.length === 1){
						minute = "0" + minute
					}
					if(j === -1){
						minute = "无"
					}
					startMinutesList.push(minute)
				}
				this.endTimeArray.push(endHoursList)
				this.endTimeArray.push(endMinutesList)
				this.startTimeArray.push(startHoursList)
				this.startTimeArray.push(startMinutesList)
			},
			// 上班时间下拉选择事件
			startTimeChange(item,e){
				if(e.detail["value"][0] === 0 || e.detail["value"][1] === 0){
					item["time_on_duty"] = ""
					return
				}
				let hour = (e.detail["value"][0] - 1).toString()
				let minute = (e.detail["value"][1] - 1).toString()
				if(hour.length == 1){
					hour = "0" + hour
				}
				if(minute.length == 1){
					minute = "0" + minute
				}
				item["time_on_duty"] = hour + ":" + minute
			},
			// 下班时间下拉选择事件
			endTimeChange(item,e){
				if(e.detail["value"][0] === 0 || e.detail["value"][1] === 0){
					item["time_off_duty"] = ""
					return
				}
				let hour = (e.detail["value"][0] - 1).toString()
				let minute = (e.detail["value"][1] - 1).toString()
				if(hour.length == 1){
					hour = "0" + hour
				}
				if(minute.length == 1){
					minute = "0" + minute
				}
				item["time_off_duty"] = hour + ":" + minute
			},
			// 备注下拉选择事件
			memoChange(item,e){
				item["summary"] = this.summaryArray[e.detail.value].value
				item["new_summary"] = parseInt(e.detail.value)
			},
			// 计算实际出勤和加班时间
			calActualTime(val){
				let actualWorkTime = 0
				let workingDayOvertime = 0
				let workingDays = 0
				let restDayOvertime = 0
				let haveMoneyRestTime = 0
				let replaceRestTime = 0
				let replaceWorkTime = 0
				let illRestTime = 0
				let thingRestTime = 0
				val.forEach((item, index) => {
					//startTime：上班时间，endTime下班时间
					let startTime = item.time_on_duty
					let endTime = item.time_off_duty
					let startHour = 0
					let startMinute = 0
					let endHour = 0
					let endMinute = 0
					// 若一边时间为无，跳过
					if((startTime === "" && endTime !=="") || (endTime === "" && startTime !=="")){
						return
					}
					// 若两边都为无且不为休假状态，跳过
					else if((startTime === "" && endTime === "") &&
					(item['new_summary'] !== 1 && item['new_summary'] !== 2 && item['new_summary'] !== 3 && item['new_summary'] !== 6)){
						return
					}
					// 若都有时间时，正常
					else{
						startHour = Number(startTime.substr(0,2))
						startMinute = Number(startTime.substr(3,2))
						endHour = Number(endTime.substr(0,2))
						endMinute = Number(endTime.substr(3,2))
					}
					let restTime = 0
					
					// 除去中午休息时间
					if(startHour < 12 || (startHour === 12 && startMinute === 0)){
						// 上班时间早于等于12点
						if(endHour < 12 || (endHour === 12 && endMinute === 0)){
							// 下班时间早于等于12点
							restTime = 0
						}else if(endHour === 12 && endMinute !== 0){
							// 下班时间处于12点至1点之间
							restTime = (endMinute/60).toFixed(2)
						}else if(endHour >= 13){
							// 下班时间晚于1点
							restTime = 1
						}
					}else if(startHour === 12 && startMinute !== 0){
						// 上班时间处于12点至1点之间
						if(endHour === 12 && endMinute !== 0){
							// 下班时间处于12点至1点之间
							restTime = ((endMinute - startMinute)/60).toFixed(2)
						}else if(endHour >= 13){
							// 下班时间晚于1点
							restTime = ((60 - startMinute)/60).toFixed(2)
						}
					}else if(startHour > 13 || (startHour === 13 && startHour === 0)){
						// 上班时间晚于1点
						restTime = 0
					}
					let workHours = endHour - startHour
					let workMinutes = ((endMinute - startMinute)/60).toFixed(2)
					let day = Number(workHours) + Number(workMinutes)
					actualWorkTime = actualWorkTime + day - restTime
					
					// 计算工作日加班时间
					if((item['new_summary'] === 0 && item['week'] !== "六" && item['week'] !== "日") || item['new_summary'] === 5){
						workingDayOvertime = workingDayOvertime + day - restTime
						workingDays++
					}
					// 计算休息日加班时间
					if((item['new_summary'] === 0 && item['week'] === "六" && item['week'] === "日")
						|| (this.holidayArray.indexOf(item['work_date']) !== -1 && item['new_summary'] !== 5)){
						restDayOvertime = restDayOvertime + day - restTime
					}
					
					switch (item['new_summary']) {
						// 计算有给休时间
						case 1:
							let leaveTime = 7.5 - (day - restTime)
							if(leaveTime < 0){
								leaveTime = 0
							}
							haveMoneyRestTime = haveMoneyRestTime + leaveTime
							break
						// 计算事休时间
						case 2:
							leaveTime = 7.5 - (day - restTime)
							if(leaveTime < 0){
								leaveTime = 0
							}
							thingRestTime = thingRestTime + leaveTime
							break
						// 计算病休时间
						case 3:
							leaveTime = 7.5 - (day - restTime)
							if(leaveTime < 0){
								leaveTime = 0
							}
							illRestTime = illRestTime + leaveTime
							break
						// 计算振替出勤时间
						case 5:
							leaveTime = day - restTime
							if(leaveTime < 0){
								leaveTime = 0
							}
							replaceWorkTime = replaceWorkTime + leaveTime
							break
						// 计算振替休日时间
						case 6:
							leaveTime = 7.5 - (day - restTime)
							if(leaveTime < 0){
								leaveTime = 0
							}
							replaceRestTime = replaceRestTime + leaveTime
							break
						default:
							break
					}
				})
				// 实际出勤
				this.actualTime = actualWorkTime.toFixed(1)
				// 工作日加班
				this.workingDayOvertime = (workingDayOvertime - (workingDays * 7.5)).toFixed(1)
				// 休息日加班
				this.restDayOvertime = restDayOvertime.toFixed(1)
				// 有给休
				this.haveMoneyRestTime = haveMoneyRestTime.toFixed(1)
				// 事休
				this.thingRestTime = thingRestTime.toFixed(1)
				// 病休
				this.illRestTime = illRestTime.toFixed(1)
				// 振替休日
				this.replaceRestTime = replaceRestTime.toFixed(1)
				// 振替出勤
				this.replaceWorkTime = replaceWorkTime.toFixed(1)
			},
			// 获取节假日列表
			getHolidayData(){
				const that = this
				that.$api.post(getHolidayDataApi, {
					'month' : that.choseMonth
				}).then(res => {
				   console.log(res)
				   that.holidayArray = res
				}).catch(err => {
				   console.log(err)
				})
			},
			// 切换上个月
			monthLastClick(){
				this.choseMonth -= 1
				if(this.choseMonth === 0){
					this.choseMonth = 12
					this.choseYear -= 1
				}
				this.getUseData()
			},
			// 切换下个月
			monthNextClick(){
				this.choseMonth += 1
				if(this.choseMonth === 13){
					this.choseMonth = 1
					this.choseYear += 1
				}
				this.getUseData()
			},
			// 获取显示用数据
			getUseData(){
				// 获取规定出勤时间
				this.getSetTime()
				// 获取节假日列表
				this.getHolidayData()
				// 获取出勤时间列表
				this.getWorkAttendanceData()
			},
			// 提交考勤数据
			subAttendanceData(){
				// 提交汇总数据
				this.subSummaryData()
				// 提交考勤数据
				this.subWorkData()
			},
			// 提交汇总数据
			subSummaryData(){
				const that = this
				let subData = {
					'work_year' : this.choseYear,
					'work_month' : this.choseMonth,
					'set_time' : this.setTime,
					'actual_time' : this.actualTime,
					'work_over_time' : this.workingDayOvertime,
					'rest_over_time' : this.restDayOvertime,
					// 属性追加 2021年01月18日
					'money_rest_time' : this.haveMoneyRestTime,
					'thing_rest_time' : this.thingRestTime,
					'ill_rest_time' : this.illRestTime,
					'replace_rest_time' : this.replaceRestTime,
					'replace_work_time' : this.replaceWorkTime
				}
				
				that.$api.post(submitSummaryDataApi, subData)
				.then(res => {
				   console.log(res)
				}).catch(err => {
				   console.log(err)
				})
			},
			// 提交考勤数据
			subWorkData(){
				const that = this
				let subData = {
					'work_year' : that.choseYear,
					'work_month' : that.choseMonth,
					'work_data' : that.workAttendanceList
				}
				
				that.$api.post(submitAttendanceDataApi, subData)
				.then(res => {
				   console.log(res)
				   that.$refs.popup.open()
				}).catch(err => {
				   console.log(err)
				})
			},
			// 右滑事件
			scrolltolower(){
				this.arrowFlg = false
			},
			// 左滑事件
			scrolltoupper(){
				this.arrowFlg = true
				this.scrollRight = 0
			},
			// 去右边
			goRight(){
				let { windowWidth, windowHeight } = uni.getSystemInfoSync()
				this.scrollRight = windowWidth
				this.arrowFlg = false
			}
		},
		onLoad() {
			// 获取业务年月
			this.getLastMonth()
			// 获取显示用数据
			this.getUseData()
			// 制作上下班时间下拉列表
			this.makeStartAndEndTimeArray()
		}
	}
</script>

<style>
	.title{
		width: 100%;
		height: 30px;
		background-color: white;
	}
	
	.title-left{
		float: left;
		width: 30%;
		height: 100%;
	}
	
	.title-mid{
		float: left;
		width: 40%;
		height: 100%;
		line-height: 30px;
		text-align: center;
	}
	
	.title-right{
		float: left;
		width: 30%;
		height: 100%;
	}
	
	.view-main{
		background-color: #f1f1f1;
		overflow: hidden;
		height: 100vh;
	}
	
	.check{
		margin: 5px;
		padding: 5px;
		width:calc(100% - 20px);
		background-color: white;
		height: 80px;
	}
	
	.check-content{
		padding: 5px;
		width:100%;
		background-color: white;
		height: 80px;
	}
	
	.check1{
		width: 25%;
		height: 50%;
		line-height: 40px;
		float: left;
	}
	
	.list-item{
		width: 100%;
		height: 50px;
		background-color: white;
		margin-bottom: 5px;
	}
	
	.item-left{
		float: left;
		text-align: center;
		border-right: rgb(180,27,18) solid 1px;
		width: 70px;
		line-height: 50px;
	}
	
	.item-mid{
		float: left;
		text-align: center;
		line-height: 50px;
		width: calc(100% - 162px);
	}
	
	.icons-left{
		float: right;
		line-height: 30px;
	}
	
	.icons-right{
		float: left;
		line-height: 30px;
	}
	
	.text-time{
		float:left;
		color:rgb(180,27,18);
	}

	.text-h{
		margin-left: 5px;
		float:left;
	}
	
	.picker-left{
		float: left;
		margin-right: 5px;
		width: 40%;
	}
	
	.arrow{
		float: right; 
	}
	
	.picker-right{
		float: left; 
		line-height: 50px; 
		margin-right: 5px;
	}
	
	.scroll-Y{
		height: calc(100vh - 200px);
	}

	.text-onTime{
		float: left;
		text-align: center;
		width: calc(100% - 16px);
	}
	
	.view-summary{
		float: left;
		text-align: center;
		width: 68px;
	}
	
	.view-button{
		position: absolute;
		bottom: 0;
	}
	
	.button-confirm{
		width: 100vw;
		height: 70px;
		text-align: center;
		line-height: 50px;
		color: white;
		border-radius: 0;
	}
	
	.popup_success{
		text-align: center;
		width: 100vw;
		height: 30px;
		line-height: 30px;
		background-color: rgb(180,27,18);
		color: white;
		position: absolute
	}
	
	.item-right{
		float: right;
		border-left: rgb(180,27,18) solid 1px;
		width: 90px;
	}
	
	.picker-mid{
		float: left;
		margin-left: 5px;
		width: 40%;
	}
	
	.scroll-X{
		width: 100%;
		height: 100%;
	}
	
	.arrow-right{
		position: fixed;
		right: 10px;
		background: rgba(0,0,0,0.4);
		opacity: 0.3;
		width: 25px;
		height: 80px;
	}
	
	.icons-right2{
		line-height: 80px;
	}
</style>
