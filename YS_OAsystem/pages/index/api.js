const decryptPhoneNumberApi = '/wechat/decodePhoneNum' // 解析手机号
const makeTokenApi = '/wechat/makeToken' // 制作thinkPHP所需_token_
const saveWXinfoApi = '/wechat/saveWXinfo' // 保存微信信息
const checkMsgFlgApi = '/wechat/findWXInfo' // 查询是否拥有msg权限

module.exports = {
	decryptPhoneNumberApi,
	makeTokenApi,
	saveWXinfoApi,
	checkMsgFlgApi
}