/**
 * 		TFMS TT 리스트
 */
var alarmList_TFMS_debugPrefix = "[TFMS_list.js] : ";

function getTTList() {
	// 페이지가 보여지면서 로더를 보여준다.
	$.mobile.loading( "show", {
		  text: "리스트를 읽어오는 중 입니다.",
		  textVisible: true,
		  theme: "a",
		  html: ""
	});
	
	$.ajax({
		url:  url + "TFMSTTList",
		type: "post",
		timeout: commonTimeout,
		dataType: "json",
//		data: {},
		success: function (result) {
			var liText = "";
			
			var headerData = result.header;
			// header log
			console.log(alarmList_TFMS_debugPrefix + "########### Header Data : TFMS TT List  ###########");
			$.each(headerData, function(key, val){
				console.log(loginDebugPrefix + key + " : " + val);
			});

			if(headerData.result != 0) {
				$.mobile.hidePageLoadingMsg();
				liText += 	"<li data-icon='false'> "+
			    			"	<a href='#'>" +
			    			"		<center><h2>데이터가 존재하지 않습니다.</h2></center>" +
			    			"		<p></p>" +
			    			"	</a>" +
			    			"</li>";
			} else { 
				var bodyData = result.body;
				//json array sort function
				function sortTFMSList(prop1, prop2, asc) {
					bodyData = bodyData.sort(function(a, b) {
				        if (asc) return (a[prop1] + a[prop2] > b[prop1] + b[prop2]) ? 1 : ((a[prop1] + a[prop2] < b[prop1] + b[prop2]) ? -1 : 0);
				        else return (b[prop1] + b[prop2] > a[prop1] + a[prop2]) ? 1 : ((b[prop1] + b[prop2] < a[prop1] + a[prop2]) ? -1 : 0);
				    });
				}
				// 단 + 시간 으로 Descending
				sortTFMSList('ORG_NM_3', "FAULT_OCCUR_TIME", false);
				
				$.each(bodyData, function(key, val){
					console.log(alarmList_TFMS_debugPrefix + "========== TFMS List ===========");
					$.each(val, function(key, val){
						console.log(alarmList_TFMS_debugPrefix + key + " : " + val);
				    });

					var svcName = nullCheck(val.SERVICE_NM);
					var orgName = nullCheck(val.ORG_NM_3);
					var srcOffName = nullCheck(val.SRC_OFFICE_NM);
					var srcEquipName = nullCheck(val.SRC_EQUIP_NM);
					var faultOccTime = nullCheck(val.FAULT_OCCUR_TIME);
					var totVocCnt = nullCheck(val.TOTAL_VOC_CNT);
					var srcType = nullCheck(val.SRC_NEMAINTYPE_NM) + "/" + nullCheck(val.SRC_NESUBTYPE_NM);
					var causeName = nullCheck(val.CAUSE1_NM) +"/"+ nullCheck(val.CAUSE2_NM);
					var procStatus = nullCheck(val.PROC_STATUS_NM);
					
					liText += 	"<li><a href='alarmList_TFMS_detail.html?ttSrlNum="+ val.TT_SRL_NUM +"' style='padding-right:0;'>" +
								"<div style='overflow:hidden; text-overflow:ellipsis;>" +
								"<h2 style='margin:0; padding:0; font-size:1em'>["+ procStatus +"] ["+ faultOccTime +"]</h2>" +
								"<h2 style='margin:0; padding:0; margin-bottom:0.25em; font-size:1em'>["+ orgName +"] ["+ srcOffName +"] ["+ srcEquipName +"]</h2>" +
								"<fieldset class='ui-grid-a' style='margin-top:0.25em;'>" +
								"<div class='ui-block-a' style='overflow:hidden; text-overflow:ellipsis; width:65%; font-size:0.9em'>분야 : "+ srcType +"</div>" +
								"<div class='ui-block-b' style='overflow:hidden; text-overflow:ellipsis; width:35%; font-size:0.9em;'>서비스 : "+ svcName +"</div>" +
								"</fieldset>" +
								"<fieldset class='ui-grid-a'>" +
								"<div class='ui-block-a' style='overflow:hidden; text-overflow:ellipsis; width:65%; font-size:0.9em'>원인 : "+ causeName +"</div>" +
								"<div class='ui-block-b' style='overflow:hidden; text-overflow:ellipsis; width:35%; font-size:0.9em;'>총VOC: "+ totVocCnt +"</div>" +
								"</fieldset>" +
								"</div>" +
								"</a>" +
								"</li>";
			    });
			}
			// 동적으로 리스트 생성 후 리스트 새로고침
			$("#alarmList_tt").append(liText).listview("refresh");
			// 화면에 리스트 출력이 완료되면 loader를 종료
			$.mobile.hidePageLoadingMsg();
			console.log(alarmList_noti_debugPrefix + "========== TFMS 리스트 출력 완료 ==========");
		},
		error: function(jqXHR, textStatus, errorThrown) {
			$.mobile.hidePageLoadingMsg();
			showCommonAlert("TT 목록", textStatus);
	        console.log(alarmList_noti_debugPrefix + "TFMS" + status + "리스트 출력 에러 status : " + jqXHR.status);
	        console.log(alarmList_noti_debugPrefix + "TFMS" + status + "리스트 출력 에러 responseText : " + jqXHR.responseText);
			console.log(alarmList_noti_debugPrefix + "TFMS" + status + "리스트 출력 에러 errorThrown : " + errorThrown);
	    }
	});
}

$(document).on("pagebeforecreate","#page_alarmList_TFMS",function(event) {
	//	메뉴패널 생성, 반드시 pagebeforecreate 이벤트단에서 호출한다.
	commonCreateMenuPanel();
});

$(document).on("pageshow","#page_alarmList_TFMS",function(event) {
	//	페이지에 따른 메뉴패널 설정
	commonConfigMenuPanel();
	//	페이지 위젯 초기화
	$('#page_alarmList_TFMS').trigger('pagecreate');
	//	TFMS 리스트 호출
	getTTList();
	//	새로고침 버튼
	$("#btn_refresh").click(function () {
		$.mobile.silentScroll($('div[data-role="header"]').offset().top);
		$("#alarmList_tt").empty();
		// TFMS 리스트 호출
		getTTList();
	});
});
