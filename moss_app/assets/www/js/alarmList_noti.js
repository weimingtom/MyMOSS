/**
 * 		고장상황 진행 리스트
 */
var alarmList_noti_debugPrefix = "[alarmList_noti.js] : ";

function showAlarmList_noti (listStatus) {
	// 페이지가 보여지면서 로더를 보여준다.
	$.mobile.loading( "show", {
		  text: "리스트를 읽어오는 중 입니다.",
		  textVisible: true,
		  theme: "a",
		  html: ""
	});
	
	var userId = getUserID();
	var status = "";
	
	if(listStatus == "1") {
		status = "[진행]";
	} else {
		status = "[완료]";
	}
	
	$.ajax({
		url:  url + "FaultNoti",
		type: "post",
		timeout: commonTimeout,
		dataType: "json",
		data: {loginId:userId, departmentCd:departmentCd, userTypeCd:userTypeCD, status:listStatus},
		success: function (result) {
			var bodyData = result.body;
			var liText = "";
			
			var headerData = result.header;
			// header log
			console.log(alarmList_noti_debugPrefix + "########### Header Data : FaultNoti  ###########");
			$.each(headerData, function(key, val){
				console.log(alarmList_noti_debugPrefix + key + " : " + val);
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
				$.each(bodyData, function(key, val){
					console.log(alarmList_noti_debugPrefix + "========== 고장상황" + status + "리스트 ===========");
					$.each(val, function(key, val){
						console.log(alarmList_noti_debugPrefix + key + ", " + val);
				    });
					// 고장 / 완료에 따라 링크되는 페이지가 다르다 (if문으로 분기) 
					if(listStatus == "1") {
//						TT유무에 따른 TT이미지 삽입 >> 고장상황(진행) 페이지 이동...
						if(val.TT_YN == "Y") {
							liText +=	"<li data-icon='false'>" +
							 "<a href='alarmList_noti_detail.html?notiseqnum="+ val.NOTISEQNUM +"' style='padding-top:0; padding-bottom:0'>" +
									 "<div style='overflow:hidden; text-overflow:ellipsis; margin-top:0.5em; margin-bottom:0.5em;'>" +
									 "<div style='display:inline; border-width:1px;'><img src='../img/TT_icon.png' class='listImg_tt'></div>" +
									 "<div style='display:inline;' class='listSubject'>"+ val.SUBJECT +"</div>" +
									 "</div>" +
									 "<div>" + 
									 "<p style='font-size:1em;'>"+ val.WRITEDATE +"</p>" +
									 "</div>" +
									 "<div>" +
									 "<p style='display:inline; float:right; font-size:1em;'>담당자 : "+ val.WRITERNAME +"</p>" +
									 "<p style='display:inline; float:left; font-size:1em;'>출동자 : "+ nullCheck(val.MOVELIST) +"</p>" +
									 "</div>" +
								"</a>" +
						    "</li>";
						} else {
							liText +=	"<li data-icon='false'>" +
							 "<a href='alarmList_noti_detail.html?notiseqnum="+ val.NOTISEQNUM +"' style='padding-top:0; padding-bottom:0'>" +
									 "<div style='overflow:hidden; text-overflow:ellipsis; margin-top:0.5em; margin-bottom:0.5em;'>" +
									 "<div style='display:inline;' class='listSubject'>"+ val.SUBJECT +"</div>" +
									 "</div>" +
									 "<div>" + 
									 "<p style='font-size:1em;'>"+ val.WRITEDATE +"</p>" +
									 "</div>" +
									 "<div>" +
									 "<p style='display:inline; float:right; font-size:1em;'>담당자 : "+ val.WRITERNAME +"</p>" +
									 "<p style='display:inline; float:left; font-size:1em;'>출동자 : "+ nullCheck(val.MOVELIST) +"</p>" +
									 "</div>" +
								"</a>" +
						    "</li>";
						}
					} else {
//						TT유무에 따른 TT이미지 삽입 >> 고장상황(완료) 페이지 이동...
						if(val.TT_YN == "Y") {
							liText +=	"<li data-icon='false'>" +
							 "<a href='alarmList_success_detail.html?notiseqnum="+ val.NOTISEQNUM +"' style='padding-top:0; padding-bottom:0'>" +
									 "<div style='overflow:hidden; text-overflow:ellipsis; margin-top:0.5em; margin-bottom:0.5em;'>" +
									 "<div style='display:inline; border-width:1px;'><img src='../img/TT_icon.png' class='listImg_tt'></div>" +
									 "<div style='display:inline;' class='listSubject'>"+ val.SUBJECT +"</div>" +
									 "</div>" +
									 "<div>" + 
									 "<p style='font-size:1em;'>"+ val.WRITEDATE +"</p>" +
									 "</div>" +
									 "<div>" +
									 "<p style='display:inline; float:right; font-size:1em;'>담당자 : "+ val.WRITERNAME +"</p>" +
									 "<p style='display:inline; float:left; font-size:1em;'>출동자 : "+ nullCheck(val.MOVELIST) +"</p>" +
									 "</div>" +
								"</a>" +
						    "</li>";
						} else {
							liText +=	"<li data-icon='false'>" +
							 "<a href='alarmList_success_detail.html?notiseqnum="+ val.NOTISEQNUM +"' style='padding-top:0; padding-bottom:0'>" +
									 "<div style='overflow:hidden; text-overflow:ellipsis; margin-top:0.5em; margin-bottom:0.5em;'>" +
									 "<div style='display:inline;' class='listSubject'>"+ val.SUBJECT +"</div>" +
									 "</div>" +
									 "<div>" + 
									 "<p style='font-size:1em;'>"+ val.WRITEDATE +"</p>" +
									 "</div>" +
									 "<div>" +
									 "<p style='display:inline; float:right; font-size:1em;'>담당자 : "+ val.WRITERNAME +"</p>" +
									 "<p style='display:inline; float:left; font-size:1em;'>출동자 : "+ nullCheck(val.MOVELIST) +"</p>" +
									 "</div>" +
								"</a>" +
						    "</li>";
						}
					}
			    });
			}
			// 리스트 재 생성 겹치는 문제 예외처리
			if($.mobile.activePage.is('#page_alarmList_noti')) {
				// 동적으로 리스트 생성 후 리스트 새로고침
				$("#alarmList_noti").append(liText).listview("refresh");
			}else if($.mobile.activePage.is('#page_alarmList_success')){
				// 동적으로 리스트 생성 후 리스트 새로고침
				$("#alarmList_success").append(liText).listview("refresh");
			}
			// 화면에 리스트 출력이 완료되면 loader를 종료
			$.mobile.hidePageLoadingMsg();
			console.log(alarmList_noti_debugPrefix + "========== 고장상황" + status + "리스트 출력 완료 ==========");
		},
		error: function(jqXHR, textStatus, errorThrown) {
			$.mobile.hidePageLoadingMsg();
			showCommonAlert("고장상황", textStatus);
	        console.log(alarmList_noti_debugPrefix + "고장상황" + status + "리스트 출력 에러 status : " + jqXHR.status);
	        console.log(alarmList_noti_debugPrefix + "고장상황" + status + "리스트 출력 에러 responseText : " + jqXHR.responseText);
			console.log(alarmList_noti_debugPrefix + "고장상황" + status + "리스트 출력 에러 errorThrown : " + errorThrown);
	    }
	});
}

$(document).on("pagebeforecreate","#page_alarmList_noti",function(event) {
	//	메뉴패널 생성, 반드시 pagebeforecreate 이벤트단에서 호출한다.
	commonCreateMenuPanel();
});

$(document).on("pageshow","#page_alarmList_noti",function(event) {
	//	페이지에 따른 메뉴패널 설정
	commonConfigMenuPanel();
	//	페이지 위젯 초기화
	$('#page_alarmList_noti').trigger('pagecreate');
	
	var listStatus = "1";
	showAlarmList_noti(listStatus);
	
	$("#btn_refresh").click(function () {
		$("#alarmList_noti").empty();
		showAlarmList_noti(listStatus);
	});
});

$(document).on("pagebeforecreate","#page_alarmList_success",function(event) {
	//	메뉴패널 생성, 반드시 pagebeforecreate 이벤트단에서 호출한다.
	commonCreateMenuPanel();
});

$(document).on("pageshow","#page_alarmList_success",function(event) {
	//	페이지에 따른 메뉴패널 설정
	commonConfigMenuPanel();
	//	페이지 위젯 초기화
	$('#page_alarmList_success').trigger('pagecreate');
	
	var listStatus = "2";
	showAlarmList_noti(listStatus);
	
	$("#btn_refresh").click(function () {
		$("#alarmList_success").empty();
		showAlarmList_noti(listStatus);
	});
});