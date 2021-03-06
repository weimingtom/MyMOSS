/**
 * 		TFMS TT 리스트
 */
var alarmList_ttDetail_debugPrefix = "[TFMS_detail.js] : ";

// TFMS TT 의 DateFormat으로 변경
function myDateFormat(str) {
	var resYear = str.substring(0,4);
	var resMon = str.substring(4,6);
	var resDay = str.substring(6,8);
	var resHour = str.substring(8,10);
	var resMin = str.substring(10,12);
	
	var returnDate = resYear + "-" + resMon + "-" + resDay + " " + resHour + ":" + resMin;
	
	console.log(alarmList_ttDetail_debugPrefix + "============ old date format : "+ str +" ============");
	console.log(alarmList_ttDetail_debugPrefix + "============ new date format : "+ returnDate +" ============");
	
	return returnDate;
}

function showTTDetail(ttsrlnum) {
	ttsrlnum = ttsrlnum.replace("#", "");
	
	$.ajax({
		url: url + "TFMSTTDetail",
		type: "post",
		timeout: commonTimeout,
		data: {ttsrlnum:ttsrlnum},
		success: function (result) {
			var headerData = result.header;
			// header log
			console.log(alarmList_ttDetail_debugPrefix + "########### Header Data : TFMS TT Detail  ###########");
			$.each(headerData, function(key, val){
				console.log(alarmList_ttDetail_debugPrefix + key + " : " + val);
			});

			if(headerData.result != 0) {
				$.mobile.hidePageLoadingMsg();
				showCommonAlert("TT 상세보기", headerData.errMsg);
			} else { 
				var bodyData = result.body;
				console.log(alarmList_ttDetail_debugPrefix + "============= TFMS TT Detail : Response  =============");
				$.each(bodyData, function(key, val){
					//	log
					$.each(val, function(key, val) {
						console.log(alarmList_ttDetail_debugPrefix + key + " : " + val);
					});					//	table 1
					var detail_html = 	"<div style='margin-left:1em;'><h2>TT 기본정보</h2></div>" +
										"<div class='CSSTableGenerator'>" +
										"<table>" +
										"<tr>" +
										"</tr>" +
										"<tr>" +
										"<td style='width:5.5em; -moz-border-radius-topleft:5px; -webkit-border-top-left-radius:5px; border-top-left-radius:5px;'>TT번호</td>" +
										"<td colspan='3' style='-moz-border-radius-topright:5px; -webkit-border-top-right-radius:5px; border-top-right-radius:5px;'>"+ nullCheck(val.TT_NO) +"</td>" +
										"</tr>" +
										"<tr>" +
										"<td>고장발생시간</td>" +
										"<td colspan='3'>"+ myDateFormat(nullCheck(val.FAULT_OCCUR_DD) + nullCheck(val.FAULT_OCCUR_HH)) +"</td>" +
										"</tr>" +
										"<tr>" +
										"<td>VOC</td>" +
										"<td colspan='3'>총:"+ nullCheck(val.TOTAL_VOC_CNT) +", 고장:"+ nullCheck(val.FAULT_VOC_CNT) +", 시설:"+ nullCheck(val.TT_VOC_MAPP_CNT) +"</td>" +
										"</tr>" +
										"<tr>" +
										"<td>고장/비고장</td>" +
										"<td>"+ nullCheck(val.FAULT_YN_NM) +"</td>" +
										"<td>상태</td>" +
										"<td>"+ nullCheck(val.PROC_STATUS_NM) +"</td>" +
										"</tr>" +
//										"<tr>" +
//										"<td>접수시각</td>" +
//										"<td colspan='3'>"+ nullCheck(val.TT_RECPT_TIME) +"</td>" +
//										"</tr>" +
										"<tr>" +
										"<td>도메인</td>" +
										"<td colspan='3'>"+ nullCheck(val.DOMAIN_CD_NM) +"</td>" +
//										"<td>접수자</td>" +
//										"<td>"+ nullCheck(val.TT_RECPT_USER_NM) +"</td>" +
										"</tr>" +
										"<tr>" +
										"<td>조직</td>" +
										"<td colspan='3'>"+ nullCheck(val.OPER_ORG_ID_NM) +"</td>" +
										"</tr>" +
										"</table>" +
										"</div>" +
										"<br>" +
										//	table 2
										"<div style='margin-left:1em;'><h2>고장시설</h2></div>" +
										"<div class='CSSTableGenerator'>" +
										"<table >" +
										"<tr>" +
										"<td style='width:5em;'>항목</td>" +
										"<td>경보시설</td>" +
										"<td>고장시설</td>" +
										"</tr>" +
										"<tr>" +
										"<td>국사</td>" +
										"<td>"+ nullCheck(val.AL_OFFICE_NM) +"</td>" +
										"<td>"+ nullCheck(val.SRC_OFFICE_NM) +"</td>" +
										"</tr>" +
										"<tr>" +
										"<td>분야1</td>" +
										"<td>"+ nullCheck(val.AL_NEMAINTYPE_NM) +"</td>" +
										"<td>"+ nullCheck(val.SRC_NEMAINTYPE_NM) +"</td>" +
										"</tr>" +
										"<tr>" +
										"<td>분야2</td>" +
										"<td>"+ nullCheck(val.AL_NESUBTYPE_NM) +"</td>" +
										"<td>"+ nullCheck(val.SRC_NESUBTYPE_NM) +"</td>" +
										"</tr>" +
										"<tr>" +
										"<td>장비모델</td>" +
										"<td>"+ nullCheck(val.AL_MODELNAME) +"</td>" +
										"<td>"+ nullCheck(val.SRC_MODELNAME) +"</td>" +
										"</tr>" +
										"<tr>" +
										"<td>장비코드</td>" +
										"<td>"+ nullCheck(val.AL_EQUIP_ID) +"</td>" +
										"<td>"+ nullCheck(val.SRC_EQUIP_ID) +"</td>" +
										"</tr>" +
										"<tr>" +
										"<td>대표IP</td>" +
										"<td>"+ nullCheck(val.AL_MASTER_IP) +"</td>" +
										"<td>"+ nullCheck(val.SRC_MASTER_IP) +"</td>" +
										"</tr>" +
										"<tr>" +
										"<td>운용/회선</td>" +
										"<td>"+ nullCheck(val.AL_USE_CNT) +"/"+ nullCheck(val.AL_SBCR_CNT) +"</td>" +
										"<td>"+ nullCheck(val.SRC_USE_CNT) +"/"+ nullCheck(val.SRC_SBCR_CNT) +"</td>" +
										"</tr>" +
										"</table>" +
										"</div>" +
										"<br>" +
										//	table 3
										"<div style='margin-left:1em;'><h2>고장처리</h2></div>" +
										"<div class='CSSTableGenerator'>" +
										"<table >" +
										"<tr>" +
										"<td style='width:5em;'>항목</td>" +
										"<td colspan='2'>처리상황</td>" +
										"</tr>" +
										"<tr>" +
										"<td>조치사항</td>" +
										"<td colspan='2'>"+ nullCheck(val.TT_CONT) +"</td>" +
										"</tr>" +
										"<tr>" +
										"<td>원인1/2</td>" +
										"<td>"+ nullCheck(val.MAIN_CAUSE_NM) +"</td>" +
										"<td>"+ nullCheck(val.SUB_CAUSE_NM) +"</td>" +
										"</tr>" +
										"<tr>" +
										"<td>조치1/2</td>" +
										"<td>"+ nullCheck(val.RESTORE_ACTION_TYPE) +"</td>" +
										"<td>"+ nullCheck(val.REMOTE_ACTION_TYPE) +"</td>" +
										"</tr>" +
										"<tr>" +
										"<td>등급/제어</td>" +
										"<td>"+ nullCheck(val.VOC_CLASS) +"</td>" +
										"<td>"+ nullCheck(val.REMOTE_CONTROL_TYPE) +"</td>" +
										"</tr>" +
										"<tr>" +
										"<td>인력</td>" +
										"<td>투입 : "+ nullCheck(val.TT_MNPL_CNT) +"</td>" +
										"<td>출동 : "+ nullCheck(val.TT_WORK_CNT) +"</td>" +
										"</tr>" +
										"</table>" +
										"</div>";
										
					$("#contents_space").html(detail_html);
					$.mobile.hidePageLoadingMsg();
			    });
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			$.mobile.hidePageLoadingMsg();
			showCommonAlert("TT 상세보기", textStatus);
	        console.log(alarmList_noti_detail_debugPrefix + "TFMS TT 상세보기 : " + jqXHR.status);
	        console.log(alarmList_noti_detail_debugPrefix + "TFMS TT 상세보기 : " + jqXHR.responseText);
			console.log(alarmList_noti_detail_debugPrefix + "TFMS TT 상세보기 : " + errorThrown);
			console.log(alarmList_noti_detail_debugPrefix + "TFMS TT 상세보기 : 파라미터 : TT_NUM = " + ttsrlnum);
	    }
	});
}

$(document).on("pagebeforeshow","#page_alarmList_detail_TFMS",function(event) {
	// list에서 이동 시 전달받은 상세페이지 번호
	var ttsrlnum = commonRequest("ttSrlNum");
	// 상세화면 로딩
	showTTDetail(ttsrlnum);
	// 상단 하단 margin 적용
	$( '#contentWrapper' ).css( "top", 53 );
	$( '#contentWrapper' ).css( "bottom", 5 );
	// zoom enable
	myScroll = new iScroll('contentWrapper', { zoom: true });
});

$(document).on("pageshow","#page_alarmList_detail_TFMS",function(event) {
	// 페이지가 보여지면서 로더를 보여준다.
	$.mobile.loading( "show", {
		  text: "데이터 수신 중...",
		  textVisible: true,
		  theme: "a",
		  html: ""
	});
});