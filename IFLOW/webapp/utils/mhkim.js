sap.ui.define([
	"jquery.sap.global",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox"
], function (MessageToast, jQuery, JSONModel, MessageBox) {
	"use strict";
	return {
		
		/*
			넘어온 값이 빈값인지 체크합니다. 
			!value 하면 생기는 논리적 오류를 제거하기 위해
			명시적으로 value === 사용
			[], {} 도 빈값으로 처리
		*/
		isEmpty : function(value) {
			if (value == "" || value === null || value === undefined || (value !== null && typeof value == "object" && !Object.keys(value).length)) {
				return true;
			} else {
				return false;
			}
		},
		
		/*
		 *		LocalSystemTime
		 */
		getLocalDateTime: function () {
			try {
				var dt = new Date();
				var localDate = dt;

				var gmt = localDate;
				var min = gmt.getTime() / 1000 / 60; // convert gmt date to minutes
				var localNow = new Date().getTimezoneOffset(); // get the timezone
				// offset in minutes
				var localTime = min - localNow; // get the local time

				var dateStr = new Date(localTime * 1000 * 60);
				dateStr = dateStr.toISOString("yyyy-MM-dd'T'HH:mm:ss'Z'");
				// dateStr = dateStr.toString("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
				return dateStr;
			} catch (e) {
				// console.log("Method: getLocalDateTime, Error Message : " + e.message);
			}
		},
		
		/*
		 *		getParseDateTime
		 */
		getDate: function (date) {
			var year = date.getFullYear();
			var month = date.getMonth() + 1;
			var day = date.getDate();
			if (month < 10) {
				month = "0" + month;
			}
			if (day < 10) {
				day = "0" + day;
			}
			var yyyyMMdd = year + "-" + month + "-" + day;

			return yyyyMMdd;
		},
		
		getTime : function(date) {
			return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
		},
		
		setLeadingZero: function(num, size) {
			var s = num+"";
		    while (s.length < size) s = "0" + s;
		    return s;		
		}
	};
});
