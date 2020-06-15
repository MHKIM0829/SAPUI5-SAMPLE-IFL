sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/base/Log",
	"com/istn/IFLOW/utils/mhkim",
], function (Controller, JSONModel, MessageToast, MessageBox, Log, Utils) {
	"use strict";

	return Controller.extend("com.istn.IFLOW.controller.Main", {
		onInit: function () {
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
		},
		
		onAfterRendering: function() {
			
			// set initial data
			this.onInitData();
			
			this.oPage = this.getView().byId("page");
			this.oModelPage = new JSONModel(this.initViewData);
			this.oPage.setModel(this.oModelPage);
			this.oPage.bindElement("/");
			
			this.oTableInputItem = this.getView().byId("idTableInputItem");
			this.oTableViewFlowHeader = this.getView().byId("idViewFlowHeader");
			this.oTableViewFlowDetail = this.getView().byId("idViewFlowDetail");
			
			this.oFormHeader = this.getView().byId("idFormHeader");
			
			
			this.setFormHeader();
			this.getFlowHeader();
		},
		
		setFormHeader: function() {
			
			var oFormData = JSON.parse(JSON.stringify(this.initFlowHeader));
			oFormData.propInput = JSON.parse(JSON.stringify(this.propInput));
			
			oFormData.FLOWCODE = "MH001";
			oFormData.FLOWCNT = "001";
			oFormData.CREATOR_LOGIN_ID = "ITK00010";
			oFormData.CREATOR_NAME = "생성자";
			oFormData.CREATOR_PERNR = "100000000";
			oFormData.CREATOR_ORGEH = "ITORG11100";
			oFormData.CREATOR_ORGTX = "재무팀";
			oFormData.TITLE = "결재 테스트";
			
			this.oFormHeader.setModel(new JSONModel(oFormData));
			this.oFormHeader.bindElement('/');
		},
		
		onCreateFlow: function(oEvent) {
			
			var that =  this; 
			
			var oPageData = this.oPage.getModel().getData();
			var oHeader = this.oFormHeader.getModel().getData();
			delete oHeader.propInput;
			// var oItem = JSON.parse(JSON.stringify(this.oTableInputItem.getModel().getData()));
			
			var d = new Date();
			
			oHeader.CREATE_DATE = Utils.getDate(d);
			oHeader.CREATE_TIME = Utils.getTime(d);
			oHeader.START_DATE = Utils.getDate(d);
			oHeader.START_TIME = Utils.getTime(d);
			
			for(var idx=0; idx<oHeader.DETAIL.length; idx++) {
				oHeader.DETAIL[idx].WFIT_TYPE = "S";
				oHeader.DETAIL[idx].CREATE_DATE = Utils.getDate(d);
				oHeader.DETAIL[idx].CREATE_TIME = Utils.getTime(d);
				if(idx === 0) {
					oHeader.DETAIL[idx].START_DATE = Utils.getDate(d);
					oHeader.DETAIL[idx].START_TIME = Utils.getTime(d);
					oHeader.DETAIL[idx].IT_WFSTAT = "P";
				}
			}
			
			var data = JSON.stringify(oHeader);
			
			var uri = "/NODE_SAMP/api/v1/iFlow";
			var method = "POST";
			
			$.ajax({
				url: uri,
				method: method,
				data: data,
				contentType: "application/json; charset=utf-8",
				async: false,
				success: function (data, textStatus, jqXHR) {
					if(data.error) {
						oPageData.footer.iconSrc = "sap-icon://error";
						oPageData.footer.iconColor = "#B00";
						oPageData.footer.message = "결재 생성 실패";
					} else {
						oPageData.footer.iconSrc = "sap-icon://message-success";
						oPageData.footer.iconColor = "#2B7C2B";
						oPageData.footer.message = "결재 생성 " + data.FLOWNO;	
					}
				},
				error: function (xhr, status, thrownError) {
					oPageData.footer.iconSrc = "sap-icon://error";
					oPageData.footer.iconColor = "#B00";
					oPageData.footer.message = "결재 생성 실패";	
				},
				complete: function (xhr, status) {
					that.oPage.setModel(new JSONModel(oPageData));
					that.getFlowHeader();
				}
			});
			
		},
		
		onHeaderConfirm: function(oEvent) {
			
			var oPageData = this.oPage.getModel().getData();
			var data = this.oFormHeader.getModel().getData();
			
			if(!Utils.isEmpty(data.TITLE)) oPageData.footer.BtnCreateFlow.enabled = true;
			else oPageData.footer.BtnCreateFlow.enabled = false;
			
			
			if(Utils.isEmpty(data.TITLE)) data.propInput.inputTITLE.valueState = "Error";
			else data.propInput.inputTITLE.valueState = "None";
			
			if(!Utils.isEmpty(data.TITLE)) {
				
				var FLOWIT = 1;
				
				data.DETAIL = [];
				for(var idx=0; idx<3; idx++) {
					
					var temp = JSON.parse(JSON.stringify(this.initFlowItem));
					temp.FLOWCODE = data.FLOWCODE;
					temp.FLOWCNT = data.FLOWCNT;
					temp.FLOWIT = Utils.setLeadingZero(FLOWIT, 2);
					temp.APPROVE_LOGIN_ID = "ITK" + Utils.setLeadingZero(FLOWIT, 5);
					temp.APPROVER_SAP_ID = "ITK" + Utils.setLeadingZero(FLOWIT, 5);
					temp.APPROVER_NAME = "결재자" + Utils.setLeadingZero(FLOWIT, 3);
					temp.APPROVER_PERNR = Utils.setLeadingZero(FLOWIT, 10);
					temp.APPROVER_ORGEH = "ITORG" + Utils.setLeadingZero(FLOWIT, 5);
					temp.APPROVER_ORGTX = "부서" + Utils.setLeadingZero(FLOWIT, 3);
					
					data.DETAIL.push(temp);
					FLOWIT++;
				}
				
				this.data = data;
				this.getFlowHeader();
			}
			
			this.oPage.setModel(new JSONModel(oPageData));
			this.oTableInputItem.setModel(new JSONModel(data.DETAIL));
			this.oTableInputItem.bindRows("/");
			this.oFormHeader.setModel(new JSONModel(data));
			
		},
		
		getFlowHeader: function() {
			
			var that =  this; 
			
			var uri = "/NODE_SAMP/api/v1/iFlow";
			var method = "GET";
			
			$.ajax({
				url: uri,
				method: method,
				async: true,
				success: function (data, textStatus, jqXHR) {
					
					data.value.sort(function(a, b) {
					    return a.CREATE_DATE < b.CREATE_DATE ? -1 : a.CREATE_DATE > b.CREATE_DATE ? 1 : 0 
					    	|| a.CREATE_TIME < b.CREATE_TIME ? -1 : a.CREATE_TIME > b.CREATE_TIME ? 1 : 0 ;
					});
							
					that.oTableViewFlowHeader.setModel(new JSONModel(data.value));
					that.oTableViewFlowHeader.bindRows("/");
				},
				error: function (xhr, status, thrownError) {
					console.log("ERROR");
				},
				complete: function (xhr, status) {
					// console.log("COMPLETE");
				}
			});
		},
		
		/*
			테이블의 헤더 선택시 하위 아이템 표시
		*/
		onClickHeader: function (oEvent) {
			
			var that = this;
			
			var oControllerId = oEvent.oSource.sId.split('--').reverse()[0];
			switch (oControllerId) {
				case 'idViewFlowHeader':
	
					var oTable = this.getView().byId(oControllerId);
					var oTableData = oTable.getModel().getData();
					
					if(!Utils.isEmpty(oTableData[oEvent.mParameters.rowIndex])) {
						/*
						Deep Read
						*/
						var deepQuery = "(" + "FLOWNO='"+ oTableData[oEvent.mParameters.rowIndex].FLOWNO + "'," 
											+ "FLOWCODE='"+ oTableData[oEvent.mParameters.rowIndex].FLOWCODE  + "'," 
											+ "FLOWCNT='"+ oTableData[oEvent.mParameters.rowIndex].FLOWCNT + "'" + ")?$expand=DETAIL";
						var uri = "/NODE_SAMP/api/v1/iflow" + "?query=" + deepQuery;
						var method = "GET";
						$.ajax({
							url: uri,
							method: method,
							async: true,
							success: function (data, textStatus, jqXHR) {
								debugger;
								 that.oTableViewFlowDetail.setModel(new JSONModel(data.DETAIL));
								 that.oTableViewFlowDetail.bindRows("/");
							},
							error: function (xhr, status, thrownError) {
								console.log("ERROR");
							},
							complete: function (xhr, status) {
								// console.log("COMPLETE");
							}
						});
					}
					break;
				default:
					console.log('test');
			}
		},
		
		onDeleteFlow : function(oEvent) {
			
			var that = this;
			
			var oPageData = this.oPage.getModel().getData();
			var tableData = this.oTableViewFlowHeader.getModel().getData();
			
			var selIdx = this.oTableViewFlowHeader.getSelectedIndices();
			
			var oRequest = {
				requests : []
			};
			
			var requestItem = {
				atomicityGroup : "",
				id : "",
				method : "",
				url : ""
			}
			
			for (var idx = 0; idx < selIdx.length; idx++) {
				
				var item = JSON.parse(JSON.stringify(requestItem));
				item.atomicityGroup = "group1";
				item.id = Utils.setLeadingZero(idx+1, 3);
				item.method = "DELETE"
				item.url = "IFLT0001(" + "FLOWNO='"+ tableData[selIdx[idx]].FLOWNO + "'," 
										+ "FLOWCODE='"+ tableData[selIdx[idx]].FLOWCODE  + "'," 
										+ "FLOWCNT='"+ tableData[selIdx[idx]].FLOWCNT + "'" + ")";
				
				oRequest.requests.push(item);
			}
			
			
			var uri = "/NODE_SAMP/api/v1/iflowBatch";
			var method = "POST";
			var data = JSON.stringify(oRequest);
			
			$.ajax({
				url: uri,
				method: method,
				data : data,
				contentType: "application/json; charset=utf-8",
				async: true,
				success: function (data, textStatus, jqXHR) {
					 if(data.responses[0].status === 204) {
						oPageData.footer.iconSrc = "sap-icon://message-success";
						oPageData.footer.iconColor = "#2B7C2B";
						oPageData.footer.message = `결재 ${data.responses.length}건 삭제 완료` ;	
					 } else {
					 	oPageData.footer.iconSrc = "sap-icon://error";
						oPageData.footer.iconColor = "#B00";
						oPageData.footer.message = "결재 삭제 실패";
					 }
				},
				error: function (xhr, status, thrownError) {
					console.log("ERROR");
				},
				complete: function (xhr, status) {
					that.oPage.setModel(new JSONModel(oPageData));
					that.oTableViewFlowDetail.setModel(new JSONModel(data.DETAIL));
					that.getFlowHeader();
				}
			});
			
		},
		
		onInitData: function () {
			
			this.initViewData = {};
			this.initViewData.footer = {
				iconSrc: "",
				iconColor: "",
				message: "",
				BtnCreateFlow : {
					enabled: false 
				}
			};
			
			this.initFlowHeader = {
				FLOWCODE: "",
				FLOWCNT: "",
				TITLE:"",
				DETAIL: []
			};
			
			this.initFlowItem = {
				FLOWCODE: "",
				FLOWCNT: "",
				FLOWIT: ""
			};
				
			
			this.propInput = {
				
				inputTITLE : {
					valueState: "None",
				},
				inputKUNNR : {
					editable: false
				},
				inputWAERS : {
					editable: false
				}
			};
			
		}
	});
});