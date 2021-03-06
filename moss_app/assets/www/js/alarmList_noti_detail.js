/**
 *		alarmList_noti_detail.js
 */

var alarmList_noti_detail_debugPrefix = "[alarmList_noti_detail.js] : ";

var pictureSource;   // picture source
var destinationType; // sets the format of returned value 
var imgUrl = "";
var notiseqnum = "";
var setOfficeName = "";
var pollingStartFlag = false;
var interval_detail = null;	// 상세 페이지 폴링용 변수
var interval_flag = false;
var commentSeqArray = new Array();
var pollingDate_detail = null;
var pollingCD_detail = "";
var pollingCM_detail = "";
var myScroll;
var faultLocation = "";	// 고장국사 상세 주소 (맵 표시용 변수)
var geocodeLat = "";
var geocodeLng = "";
var daum_map = null;
var detail_services = "";		// 상세페이지 -> 업무매뉴얼 이동시 사용되는 서비스코드
var marker = new Array();		// 다음맵 마커용 배열
var infowindow = new Array();	// 다음맵 마커 인포윈도우용 배열
var detail_danOrgCode = "";
var detail_nearLocationDate = null;
var confirmCnt = 0;
var detail_tableVisible = true;
var detail_pingFlag = true;
var detail_nesCode = "";
var detail_mstIp = "";
var detail_workPlaceSeqNum = "";

//	workPlaceSeqNum이 없을 경우 사업장 정보가 없다는 경고창을 출력
function showOfficeAlert() {
	showCommonAlert("사업장 정보", "사업장 정보가 존재하지 않습니다.");
}

function call_user(num) {
	console.log(alarmList_noti_detail_debugPrefix + "=============== 전화 연결 start cnt =============== : " + confirmCnt);
	
	if(deviceInfo == "Android") {
		// 중복 실행 방지 조건
		if(confirmCnt == 0) {
			confirmCnt ++;
			
			function callConfirmCallback(button) {
				if(button == "2") {
					console.log(alarmList_noti_detail_debugPrefix + "=============== 전화 연결 시작 ===============");
					location.href = "tel:" + num;
				} else {
					console.log(alarmList_noti_detail_debugPrefix + "=============== 전화 연결 취소 ===============");
				}
				// confirm이 출력 된 후 변수 초기화
				confirmCnt = 0;
			}
			
			navigator.notification.confirm(
					num + '번으로 연결하시겠습니까?', 	// message
					callConfirmCallback, 					// callback to invoke with index of button pressed
					'전화연결', 					// title
					'취소,확인'
			);
		}
	} else {
		location.href = "tel:" + num;
	}
	console.log(alarmList_noti_detail_debugPrefix + "=============== 전화 연결 end scnt =============== : " + confirmCnt);
	
}

var onLocationSuccess = function(position) {
	// 현재 위치를 가져온 뒤 위치 정보를 서버로 전송
    setLocationInfo(position.coords.latitude , position.coords.longitude);
};

// onError Callback receives a PositionError object
function onLocationError(error) {
    console.log(alarmList_noti_detail_debugPrefix + 'code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
    
    if($.mobile.activePage.is('#page_alarmList_detail')){
		interval_detail = setInterval(function(){
			faultNotiPolling();
		}, 10*1000);
		console.log(alarmList_noti_detail_debugPrefix + "========= 고장상황(진행) 상세 페이지 폴링 시작, Polling Number => " + interval_detail + "=========");
    }
    
    if(error.code == 2) {
    	var message = "";
    	if(deviceType = "Android") {
    		message = "위치서비스가 비활성화 되어있습니다.\n정상적인 사용을 위해\n환경설정 -> 더보기 -> 위치서비스로 이동하여 [무선 네트워크 사용]을\n활성화하시기 바랍니다.";
    	} else {
    		message = "위치서비스가 비활성화 되어있습니다.\n정상적인 사용을 위해\n설정 -> 개인 정보 보호 -> 위치 서비스로 이동하여\nMOSS의 위치서비스를 활성화하시기 바랍니다.";
    	}
    	showCommonAlert("위치정보 수집 실패", message);
    }
}
//	스마트폰에서 사진을 촬영
function take_pic() {
    navigator.camera.getPicture(onPhotoURISuccess, function(ex) {
    	console.log(alarmList_noti_detail_debugPrefix + "=============== Camera Error ===============");
	    }, { quality : 70,
	    	targetWidth: 250,
	    	targetHeight: 250,
	    	correctOrientation: true,
	    	destinationType: destinationType.FILE_URI });
}
//	스마트폰 앨범에서 사진을 선택
function album_pic() { 
    navigator.camera.getPicture(onPhotoURISuccess, function(ex) {
    	console.log(alarmList_noti_detail_debugPrefix + "=============== Camera Error ==============="); 
    	},  { quality: 70, 
            targetWidth: 250,
            targetHeight: 250,
            correctOrientation: true,
	        destinationType: destinationType.FILE_URI,
	        sourceType: pictureSource.PHOTOLIBRARY });
}

function captureError(error) {
    var msg = 'An error occurred during capture: ' + error.code;
    navigator.notification.alert(msg, null, 'Error!');
}
function formatError(error) {
//	showCommonAlert("사진등록", "사진을 선택하세요");
    console.log(alarmList_noti_detail_debugPrefix + "Error getting file format data: " + error.code); 
}

function onPhotoURISuccess(imageURI) {
  var smallImage = document.getElementById('smallImage');
  smallImage.style.display = 'block';
  smallImage.src = imageURI;
  console.log(alarmList_noti_detail_debugPrefix + $("#smallImage").attr("src"));
  console.log(alarmList_noti_detail_debugPrefix + "img data load end");
  
  imgUrl = imageURI;
  console.log(alarmList_noti_detail_debugPrefix + "imgURL = " + imgUrl);
}

//현재 위치 전송 기능
var setLocation = function() {
	if(interval_detail != null && $.mobile.activePage.is('#page_alarmList_detail')) {
		clearInterval(interval_detail); 
		console.log(alarmList_noti_detail_debugPrefix + "========= 고장상황(진행) 상세 페이지 폴링 중지, Polling Number => " + interval_detail + "=========");
	}
	
	function onConfirm(button) {
		if(button == "2") {
			$.mobile.loading( "show", {
				  text: "현재 위치 전송 중...",
				  textVisible: true,
				  theme: "a",
				  html: ""
			});
			navigator.geolocation.getCurrentPosition(onLocationSuccess, onLocationError);
			console.log(alarmList_noti_detail_debugPrefix + "========= 현재 위치 전송 =========");
		} else {
			$.mobile.hidePageLoadingMsg();
			console.log(alarmList_noti_detail_debugPrefix + "========= 현재 위치 전송 취소 =========");
			 if($.mobile.activePage.is('#page_alarmList_detail')){
				interval_detail = setInterval(function(){
					faultNotiPolling();
				}, 10*1000);
				console.log(alarmList_noti_detail_debugPrefix + "========= 고장상황(진행) 상세 페이지 폴링 시작, Polling Number => " + interval_detail + "=========");
		    }
		}
		confirmFlag = true;
	}
	
	if(confirmFlag) {
		confirmFlag = false;
		navigator.notification.confirm(
				'현재 위치를 서버로 전송하시겠습니까?', // message
				onConfirm, // callback to invoke with index of button pressed
				'현재 위치 전송', // title
				'취소,확인'
			);
	}
};

//	고장상황 상세 화면을 출력
function getAlarmDetailPage() {
	$.mobile.loading( "show", {
		  text: "로딩중...",
		  textVisible: true,
		  theme: "a",
		  html: ""
	});
	
	notiseqnum = commonRequest("notiseqnum");
	notiseqnum = notiseqnum.replace("#", "");
	console.log(alarmList_noti_detail_debugPrefix + "================ request notiseqnum ================ : " + notiseqnum);

	$.ajax({
		url: url + "FaultNotiDetailInfo",
		type: "post",
		timeout: commonTimeout,
		dataType: "json",
		data: {notiseqnum:notiseqnum},
		success: function (result) {
			var headerData = result.header;
			// header log
			console.log(alarmList_noti_detail_debugPrefix + "########### Header Data : FaultNotiDetailInfo  ###########");
			$.each(headerData, function(key, val){
				console.log(alarmList_noti_detail_debugPrefix + key + " : " + val);
			});

			if(headerData.result != 0) {
				$.mobile.hidePageLoadingMsg();
				showCommonAlert("고장상황 상세보기", headerData.errMsg);
			} else { 
				var bodyData = result.body;
				
				$.each(bodyData, function(key, val){
					console.log(alarmList_noti_detail_debugPrefix + "============ 고장상황 상세화면 출력 ============");
					
					$.each(val, function(key, val) {
						console.log(alarmList_noti_detail_debugPrefix + key + " : " + val);
					});
					
					//	본문 테이블 생성
					var tableText = "<table id='table_detail'>" +
									"<tr>" +
									"</tr>" +
									"<tr>" +
									"<td style='-moz-border-radius-topleft:5px; -webkit-border-top-left-radius:5px; border-top-left-radius:5px;'>제목</td>" +
									"<td colspan='3' style='-moz-border-radius-topright:5px; -webkit-border-top-right-radius:5px; border-top-right-radius:5px;' id='detail_subject'>" +"</td>" +
									"</tr>" +
									"<tr>" +
									"<td>일시</td>" +
									"<td id='detail_writeDate' colspan='3'></td>" +
									"</tr>" +
									"<tr>" +
									"<td>이장<br>시간</td>" +
									"<td id='detail_faultRecoverTime' colspan='3'></td>" +
									"</tr>" +
									"<tr>" +
									"<td style='width:18%'>담당자</td>" +
									"<td id='detail_writerName' style='width:23%'></td>" +
									"<td style='width:16%'>VOC</td>" +
									"<td id='detail_vocCnt' style='width:43%'></td>" +
									"</tr>" +
									"<tr>" +
									"<td>국사</td>" +
									"<td colspan='3' id='detail_officeName'></td>" +
									"</tr>" +
									"<tr>" +
									"<td>분야</td>" +
									"<td colspan='3' id='detail_services'></td>" +
									"</tr>" +
									"<tr>" +
									"<td>상세<br>주소</td>" +
									"<td colspan='3' id='detail_addr'></td>" +
									"</tr>" +
									"<tr>" +
									"<td colspan='4' id='detail_content'></td>" +
									"</tr>" +
									"</table>";
					//	본문 테이블 append
					$("#table_faultDetail").html(tableText);
					//	본문 데이터 셋팅
					$("#detail_subject").text(nullCheck(val.SUBJECT));
					$("#detail_writeDate").text(nullCheck(val.WRITEDATE));
					$("#detail_faultRecoverTime").text(nullCheck(val.FAULT_RECOVER_TIME));
					$("#detail_writerName").text(nullCheck(val.WRITERNAME));
					$("#detail_services").text(nullCheck(val.SERVICES));
					detail_services = nullCheck(val.SERVICESCODE);	// 인접출동자 호출 용 변수
					detail_danOrgCode = nullCheck(val.DANORGCODE);	// 인접출동자 호출 용 변수
					$("#detail_addr").text(nullCheck(val.OFFICESDETAILADDR));
					faultLocation = nullCheck(val.OFFICESDETAILADDR);	// 국사위치 지오코딩용 변수
					$("#detail_vocCnt").text("총:"+ nullCheck(val.TOTAL_VOC_CNT) +", 고장:"+ nullCheck(val.FAULT_VOC_CNT) +", 시설:"+ nullCheck(val.TT_VOC_MAPP_CNT));
					$("#detail_officeName").text(nullCheck(val.OFFICENAMES));
					$("#detail_content").text(nullCheck(val.CONTENT));
					
					if(pollingDate_detail == null) {
						pollingDate_detail = nullCheck(val.WRITEDATE);		// 폴링 파라미터로 따로 저장
					}
					setOfficeName = nullCheck(val.OFFICENAMES);			// office name을 전송 파라미터용도로 따로 저장
					detail_nesCode = nullCheck(val.NESCODE);				// PingTest 버튼 visible 판단용도로 저장
					detail_workPlaceSeqNum = nullCheck(val.WORKPLACESEQNUM);	// 사업장 상세보기 용도로 저장
					//	MST_IP를 담는 변수는 셋팅 항상 초기화한다.
					detail_mstIp = null;
					if(val.NESCODE != "null" && val.NESCODE != null && val.NESCODE != "") {
						detail_mstIp = nullCheck(val.MSTIP);					// Ping test ip
					}
					
					// 고장 상황 상세 댓글
					var commentData = result.comment;
					var liText = "";
					var userType = "";
					
					$.each(commentData, function(key, val){
						console.log(alarmList_noti_detail_debugPrefix + "============ 고장상황 상세화면 댓글 출력 ============ CommentSeqNum => " + val.COMMENTSEQNUM);
						
						$.each(val, function(key, val) {
							console.log(alarmList_noti_detail_debugPrefix + key + " : " + val);
						});
						
						commentSeqArray.push(parseInt(val.COMMENTSEQNUM));	// commentSeqNum을 배열에 저장

						liText += 	"<li>" +
									"<div id='comment_list'>";
						//	현장, 센터에 따른 색 구분
						if(val.USERTYPE == "1") {
							userType = "<div style='display:inline;'>[현장]</div>";
						} else {
							userType = "<div style='display:inline; color:red'>[센터]</div>";
						}
						//	폰 번호 등록, 미등록에 대한 전화번호 링크 구분
						if(val.MOBILE_PHONE_NUM != null) {
							liText += 	"<p onclick=\"javascript:call_user('" + val.MOBILE_PHONE_NUM + "'); return false;\"><b>" + val.WRITEDATE + " (" + val.WRITERNAME + ")</b></p>" +
										"<p><img src='../img/list_phone.png' onclick=\"javascript:call_user('" + val.MOBILE_PHONE_NUM + "'); return false;\"></p>" +
										"</div>" +
										"<p style='white-space:pre-wrap; font-size:1em;'>" + userType + " <div style='display:inline;'>" + val.CONTENT + "</div></p>";
						} else {
							liText += 	"<p><b>" + val.WRITEDATE + " (" + val.WRITERNAME + ")</b></p>" +
										"</div>" +
										"<p style='white-space:pre-wrap; font-size:1em;'>" + userType + " <div style='display:inline;'>" + val.CONTENT + "</div></p>";
						}
						//	첨부 파일 유무에 따른 구분
						if(val.FILEBINARY != null) {
							liText += 	"<p align='center'><img src='data:image/jpeg;base64," + val.FILEBINARY + "' width='250px'></p>" +
										"</li>";
						} else {
							liText += 	"</li>";
						}
					});
					$("#Detail_commentList").empty();
					$("#Detail_commentList").append(liText).listview("refresh");
					// 화면에 리스트 출력이 완료되면 loader를 종료
					$.mobile.hidePageLoadingMsg();
			    });
			}
			console.log(alarmList_noti_detail_debugPrefix + "============ 고장상황 상세화면 출력 완료 ============");
		},
		error: function(jqXHR, textStatus, errorThrown) {
			$.mobile.hidePageLoadingMsg();
			showCommonAlert("고장상황 상세보기", textStatus);
			
	        console.log(alarmList_noti_detail_debugPrefix + "고장상황 상세화면 출력 에러 : " + jqXHR.status);
	        console.log(alarmList_noti_detail_debugPrefix + "고장상황 상세화면 출력 에러 : " + jqXHR.responseText);
			console.log(alarmList_noti_detail_debugPrefix + "고장상황 상세화면 출력 에러 : " + errorThrown);
	    }
	}).done(function() {
	    if($.mobile.activePage.is('#page_alarmList_detail') && pollingDate_detail != null){
			interval_flag = true;
			// 상세 페이지 폴링
			interval_detail = setInterval(function(){
				faultNotiPolling();
			}, 10*1000);
	    }
	});
}

//	현재 위치 전송
function setLocationInfo(latitude, longitude) {
	var setWorkerId = loginId;
	var setLatLng = latitude + "," + longitude;
	var setReverseGeocoding = "";
	
	$.ajax({
	    url: "http://maps.googleapis.com/maps/api/geocode/json",
	    timeout: commonTimeout,
	    type: 'get',
	    dataType: "json",
	    data:{latlng:setLatLng, sensor:true},
	    cache: false,
	    success: function(result){
	    	var resultData = result.results;
	    	console.log(alarmList_noti_detail_debugPrefix + "============ Reverse Geocoding 완료 ============");
	    	$.each(resultData, function(key, val){
	    		if(key == "0") {
	    			setReverseGeocoding = val.formatted_address;
	    			console.log(alarmList_noti_detail_debugPrefix + "setReverseGeocoding = " + setReverseGeocoding);
	    		}
		    	$.each(val, function(key, val){
		    		console.log(alarmList_noti_detail_debugPrefix + key + " : " + val);
		    	});
	    	});
	    }
	}).done (function() {
		$.ajax({
			url: url + "CurLocRegist",
			type: "post",
			timeout: commonTimeout,
			dataType: "json",
			data: {workerid:setWorkerId, latitude:latitude, longitude:longitude, address:setReverseGeocoding},
			success: function (result) {
				var headerData = result.header;
				// header log
				console.log(loginDebugPrefix + "########### Header Data : CurLocRegist  ###########");
				$.each(headerData, function(key, val){
					console.log(loginDebugPrefix + key + " : " + val);
				});
				if(headerData.result != 0) {
					$.mobile.hidePageLoadingMsg();
					console.log(alarmList_noti_detail_debugPrefix + "============ 현재 위치 전송 실패 ============");
					showCommonAlert("현재위치전송", headerData.errMsg);
				} else { 
					console.log(alarmList_noti_detail_debugPrefix + "============ 현재 위치 전송 ============");
					console.log(alarmList_noti_detail_debugPrefix + "workerid = " + setWorkerId);
					console.log(alarmList_noti_detail_debugPrefix + "latitude = " + latitude);
					console.log(alarmList_noti_detail_debugPrefix + "longitude = " + longitude);
					console.log(alarmList_noti_detail_debugPrefix + "address = " + setReverseGeocoding);
					console.log(alarmList_noti_detail_debugPrefix + "============ 현재 위치 전송 완료 ============");
				}
				// 화면에 리스트 출력이 완료되면 loader를 종료
				$.mobile.hidePageLoadingMsg();
			},
			error: function(jqXHR, textStatus, errorThrown) {
				$.mobile.hidePageLoadingMsg();
				showCommonAlert("현재위치전송", textStatus);
				
		        console.log(alarmList_noti_detail_debugPrefix + "현재 위치 전송 에러 : " + jqXHR.status);
		        console.log(alarmList_noti_detail_debugPrefix + "현재 위치 전송 에러 : " + jqXHR.responseText);
				console.log(alarmList_noti_detail_debugPrefix + "현재 위치 전송 에러 : " + errorThrown);
		    }
		});
	}).done(function() {
	    if($.mobile.activePage.is('#page_alarmList_detail')){
			interval_detail = setInterval(function(){
				faultNotiPolling();
			}, 10*1000);
			console.log(alarmList_noti_detail_debugPrefix + "========= 고장상황(진행) 상세 페이지 폴링 시작, Polling Number => " + interval_detail + "=========");
	    }
	});
}

//	상황 보고
function setReport() {
	$.mobile.loading( "show", {
		  text: "상황 보고...",
		  textVisible: true,
		  theme: "a",
		  html: ""
	});
	
	console.log(alarmList_noti_detail_debugPrefix + "============ 상황 보고 Parameter ============");
	
	var workerid = loginId;
	var userstate = $(":input:radio[name=detail_report]:checked").val();
	var destination = setOfficeName;
	var writenrname = userName;
	var usertype = "1";	//	현장 작업자 코드 1 고정;
	
	console.log(alarmList_noti_detail_debugPrefix + "workerid = " + workerid);
	console.log(alarmList_noti_detail_debugPrefix + "userstate = " + userstate);
	console.log(alarmList_noti_detail_debugPrefix + "destination = " + destination);
	console.log(alarmList_noti_detail_debugPrefix + "notiseqnum = " + notiseqnum);
	console.log(alarmList_noti_detail_debugPrefix + "writenrname = " + writenrname);
	console.log(alarmList_noti_detail_debugPrefix + "usertype = " + usertype);
	
	$.ajax({
		url: url + "FaultNotiReport",
		type: "post",
		timeout: commonTimeout,
		dataType: "json",
		data: {workerid:workerid, userstate:userstate, destination:destination, notiseqnum:notiseqnum, writername:writenrname, usertype:usertype},
		success: function (result) {
			var headerData = result.header;
			// header log
			console.log(loginDebugPrefix + "########### Header Data : FaultNotiReport  ###########");
			$.each(headerData, function(key, val){
				console.log(loginDebugPrefix + key + " : " + val);
			});

			if(headerData.result != 0) {
				$.mobile.hidePageLoadingMsg();
				console.log(alarmList_noti_detail_debugPrefix + "============ 상황 보고 실패 ============");
				showCommonAlert("상황보고", headerData.errMsg);
			} else { 
				console.log(alarmList_noti_detail_debugPrefix + "============ 상황 보고 완료 ============");
			}
			// 화면에 리스트 출력이 완료되면 loader를 종료
			$.mobile.hidePageLoadingMsg();
		},
		error: function(jqXHR, textStatus, errorThrown) {
			$.mobile.hidePageLoadingMsg();
			showCommonAlert("상황보고", textStatus);
			
	        console.log(alarmList_noti_detail_debugPrefix + "============ 상황 보고 에러 ============ : " + jqXHR.status);
	        console.log(alarmList_noti_detail_debugPrefix + "============ 상황 보고 에러 ============ : " + jqXHR.responseText);
			console.log(alarmList_noti_detail_debugPrefix + "============ 상황 보고 에러 ============ : " + errorThrown);
	    }
	}).done( function() {
		getFaultCommentList();
		$( "#popupNested" ).popup( "close" );
	});
}

// cordova api fileUploader, 사진 + 댓글 등록
function fileUpload() {
	// 댓글이 입력 되지 않고 전송 버튼을 눌렸을 때 체크
	if($("#setContent").val().length == "") {
		showCommonAlert("댓글작성", '댓글을 입력하세요');
	} else {
		$.mobile.loading( "show", {
			  text: "댓글 등록 중...",
			  textVisible: true,
			  theme: "a",
			  html: ""
		});
		
		var contents = $("#setContent").val();
	    var options = new FileUploadOptions();
	    options.fileKey="file";
	    options.fileName=imgUrl.substr(imgUrl.lastIndexOf('/')+1);
	    options.mimeType="image/jpeg";

	    var params = new Object();
	    params.notiseqnum = notiseqnum;
	    params.writerid = loginId;
	    params.writername = userName;
	    params.usertype = "1";
	    params.userstate = "0";
	    params.content = contents;
	    options.params = params;
	    
	    var ft = new FileTransfer();
	    ft.upload(imgUrl, encodeURI(url + "FaultNotiComment"), winUpload, failUpload, options);
	}
}

function winUpload(r) {
	$.mobile.hidePageLoadingMsg();
	$("#setContent").val("");
    console.log("Code = " + r.responseCode);
    console.log("Response = " + r.response);
    console.log("Sent = " + r.bytesSent);
    
    // 업로드 완료 후 다시 상세페이지로 전환한다.
    $('#btn_back').click();
}

function failUpload(error) {
	$.mobile.hidePageLoadingMsg();
	if(error.code == 1) {
		showCommonAlert("댓글등록", "사진을 선택하세요");
	} else {
	    showCommonAlert("An error has occurred: Code" , error.code);
	}
    console.log("upload error source " + error.source);
    console.log("upload error target " + error.target);
}

//	댓글 전송
function setComment() {
	// 댓글이 입력 되지 않고 전송 버튼을 눌렸을 때 체크
	if($("#setContent").val().length == "") {
		showCommonAlert("댓글작성", '댓글을 입력하세요');
	} else {
		$("#notiseqnum").val(notiseqnum);
		$("#writerid").val(loginId);
		$("#writername").val(userName);
		$("#usertype").val("1");
		$("#userstate").val("0");
		$("#form_content").val($("#setContent").val());
		
		console.log(alarmList_noti_detail_debugPrefix + "============= 댓글 입력 파라미터 ==========");
		console.log(alarmList_noti_detail_debugPrefix + "notiseqnum = " + $("#notiseqnum").val());
		console.log(alarmList_noti_detail_debugPrefix + "writerid = " + $("#writerid").val());
		console.log(alarmList_noti_detail_debugPrefix + "writername = " + $("#writername").val());
		console.log(alarmList_noti_detail_debugPrefix + "usertype = " + $("#usertype").val());
		console.log(alarmList_noti_detail_debugPrefix + "userstate = " + $("#userstate").val());
		console.log(alarmList_noti_detail_debugPrefix + "content = " + $("#form_content").val());
		
		$( "#myForm_onlyComment" ).submit();
	}
}

function showRequest(formData, jqForm, options) {
	$.mobile.loading( "show", {
		  text: "댓글 및 이미지 업로드...",
		  textVisible: true,
		  theme: "a",
		  html: ""
	});
	
    var queryString = $.param(formData); 
    console.log(alarmList_noti_detail_debugPrefix + 'About to submit: \n\n' + queryString);

    return true; 
} 

function showResponse(responseText, statusText, xhr, $form)  { 
//    console.log(alarmList_noti_detail_debugPrefix + 'status: ' + statusText + '\n\nresponseText: \n' + responseText + '\n\nThe output div should have already been updated with the responseText.');
    
	var headerData = responseText.header;
	// header log
	console.log(alarmList_noti_detail_debugPrefix + "============= showResponse =============");
	$.each(headerData, function(key, val){
		console.log(alarmList_noti_detail_debugPrefix + key + " : " + val);
	});
	
    $.mobile.hidePageLoadingMsg();
    getFaultCommentList();
    
    $("#setContent").val("");
} 

var options = { 
        beforeSubmit:  showRequest,  	// pre-submit callback 
        success:       showResponse,  	// post-submit callback
        url : url + "FaultNotiComment",
        dataType:  "json",        		// 'xml', 'script', or 'json' (expected server response type)
        clearForm: true,        		// clear all form fields after successful submit 
        resetForm: true,        		// reset the form after successful submit 
        timeout:   10*1000
};

//	상세 페이지 Polling
function faultNotiPolling() {
	//	폴링 플래그를 확인 후 폴링 시작
	if(!interval_flag) {
		return false;
	}
	
	console.log(alarmList_noti_detail_debugPrefix + "*************** 고장상황 상세화면 폴링 *************** NotiSeqNum = " + notiseqnum);
	console.log(alarmList_noti_detail_debugPrefix + "*************** 고장상황 상세화면 폴링 *************** pollingDate_detail = " + pollingDate_detail);
	
	notiseqnum = notiseqnum.replace("#", "");
	
	$.ajax({
		url: url + "FaultNotiPolling",
		type: "post",
		async: false,
		timeout: commonTimeout,
		data: {notiseqnum:notiseqnum, lastdate:pollingDate_detail},
		success: function (result) {
			var headerData = result.header;
			// header log
			console.log(alarmList_noti_detail_debugPrefix + "########### Header Data : FaultNotiPolling  ###########");
			$.each(headerData, function(key, val){
				console.log(alarmList_noti_detail_debugPrefix + key + " : " + val);
			});

			if(headerData.result != 0) {
				$.mobile.hidePageLoadingMsg();
				showCommonAlert("고장상황[상세화면]폴링", headerData.errMsg);
				pollingStartFlag = false;
			} else {
				//	폴링 시작을 위한 플래그를 설정한다.
				pollingStartFlag = true;
				var bodyData = result.body;
				
				$.each(bodyData, function(key, val){
					$.each(val, function(key, val) {
						console.log(alarmList_noti_detail_debugPrefix + key + ", " + val);
					});
					//	폴링에 필요한 데이터를 설정.
					pollingDate_detail = val.GREATESTDATE;
					pollingCD_detail = val.CD;
					pollingCM_detail = val.CM;
					console.log(alarmList_noti_detail_debugPrefix + "*************** GREATEST DATE ***************" + pollingDate_detail);
			    });
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			$.mobile.hidePageLoadingMsg();
			showCommonAlert("고장상황[상세화면]폴링", textStatus);
			pollingStartFlag = false;
			
	        console.log(alarmList_noti_detail_debugPrefix + "고장상황 상세화면 폴링 에러 : " + jqXHR.status);
	        console.log(alarmList_noti_detail_debugPrefix + "고장상황 상세화면 폴링 에러 : " + jqXHR.responseText);
			console.log(alarmList_noti_detail_debugPrefix + "고장상황 상세화면 폴링 에러 : " + errorThrown);
			console.log(alarmList_noti_detail_debugPrefix + "고장상황 상세화면 폴링 에러 , 파라미터 : notiseqnum = " + notiseqnum + ", lastdate = " + pollingDate_detail);
	    }
	}).done( function() {
		//	플래그 상태를 체크하여 페이지를 새로고침 한다.
		if(pollingStartFlag) {
			// 전체 업데이트
			if(pollingCM_detail == "R") {
				console.log(alarmList_noti_detail_debugPrefix + "*************** 고장상황 상세화면 Reload ! ***************");
				getAlarmDetailPage();
			} 
			// 댓글 업데이트
			if(pollingCM_detail =="L") {
				console.log(alarmList_noti_detail_debugPrefix + "*************** 고장상황 상세화면 Prepend Comment ! ***************");
				getFaultCommentList();
			}
			// 변경 없음
			if(pollingCM_detail == "N") {
				console.log(alarmList_noti_detail_debugPrefix + "*************** 고장상황 상세화면 None ! ***************");
			}
			// 본문 업데이트
			if(pollingCD_detail == "C") {
				console.log(alarmList_noti_detail_debugPrefix + "*************** 고장상황 상세화면 ChangeData : Change ***************");
				getFaultContent();
			}
			// 변경 없음
			if(pollingCD_detail == "N") {
				console.log(alarmList_noti_detail_debugPrefix + "*************** 고장상황 상세화면 ChangeData : None ***************");
			}
		}
	});
}
//	댓글 리스트 페이징
function getFaultCommentList() {

	var commentSeqNum = "";
	
	if(commentSeqArray.length > 0) {
		commentSeqNum = getMaxValue();
	} else {
		commentSeqNum = 0;
	}
	
	notiseqnum = notiseqnum.replace("#", "");
	
	$.ajax({
		url: url + "FaultPagingCommentList",
		type: "post",
		timeout: commonTimeout,
		data: {notiseqnum:notiseqnum, commentseqnum:commentSeqNum},
		success: function (result) {
			var bodyData = result.body;
			
			$.each(bodyData, function(key, val) {
				// 고장 상황 상세 댓글
				var liText = "";
				var userType = "";
				var headerData = result.header;
				// header log
				console.log(loginDebugPrefix + "########### Header Data : FaultPagingCommentList  ###########");
				$.each(headerData, function(key, val){
					console.log(loginDebugPrefix + key + " : " + val);
				});

				if(headerData.result != 0) {
					$.mobile.hidePageLoadingMsg();
					showCommonAlert("고장상황[댓글]", headerData.errMsg);
				} else { 
					$.each(val, function(key, val) {
						console.log(alarmList_noti_detail_debugPrefix + key + ", " + val);	//	로그출력
					});
					console.log(alarmList_noti_detail_debugPrefix + "============ 고장상황 상세화면 댓글 Prepend ============ CommentSeqNum : " + val.COMMENTSEQNUM);
					commentSeqArray.push(parseInt(val.COMMENTSEQNUM));	// commentSeqNum을 배열에 저장

					liText += 	"<li>" +
								"<div id='comment_list'>";
					
					//	현장, 센터에 따른 색 구분
					if(val.USERTYPE == "1") {
						userType = "<div style='display:inline;'>[현장]</div>";
					} else {
						userType = "<div style='display:inline; color:red'>[센터]</div>";
					}
					//	폰 번호 등록, 미등록에 대한 전화번호 링크 구분
					if(val.MOBILE_PHONE_NUM != null) {
						liText += 	"<p onclick=\"javascript:call_user('" + val.MOBILE_PHONE_NUM + "'); return false;\"><b>" + val.WRITEDATE + " (" + val.WRITERNAME + ")</b></p>" +
									"<p><img src='../img/list_phone.png' onclick=\"javascript:call_user('" + val.MOBILE_PHONE_NUM + "'); return false;\"></p>" +
									"</div>" +
									"<p style='white-space:pre-wrap; font-size:1em;'>" + userType + " <div style='display:inline;'>" + val.CONTENT + "</div></p>";
					} else {
						liText += 	"<p><b>" + val.WRITEDATE + " (" + val.WRITERNAME + ")</b></p>" +
									"</div>" +
									"<p style='white-space:pre-wrap; font-size:1em;'>" + userType + " <div style='display:inline;'>" + val.CONTENT + "</div></p>";
					}
					//	첨부 파일 유무에 따른 구분
					if(val.FILEBINARY != null) {
						liText += 	"<p align='center'><img src='data:image/jpeg;base64," + val.FILEBINARY + "' width='250px'></p>" +
									"</li>";
					} else {
						liText += 	"</li>";
					}
					
					$("#Detail_commentList").prepend(liText).listview("refresh");
				}
		    });
		},
		error: function(jqXHR, textStatus, errorThrown) {
			$.mobile.hidePageLoadingMsg();
			showCommonAlert("고장상황[댓글]", textStatus);
			
	        console.log(alarmList_noti_detail_debugPrefix + "고장상황 상세화면 댓글 리스트 에러 : " + jqXHR.status);
	        console.log(alarmList_noti_detail_debugPrefix + "고장상황 상세화면 댓글 리스트 에러 : " + jqXHR.responseText);
			console.log(alarmList_noti_detail_debugPrefix + "고장상황 상세화면 댓글 리스트 에러 : " + errorThrown);
	    }
	});
}

// 고장상황 상세 내용만 재 조회
function getFaultContent() {
	
	notiseqnum = notiseqnum.replace("#", "");
	
	$.ajax({
		url: url + "FaultNotiDetail",
		type: "post",
		timeout: commonTimeout,
		data: {notiseqnum:notiseqnum},
		success: function (result) {
			var headerData = result.header;
			// header log
			console.log(alarmList_noti_detail_debugPrefix + "########### Header Data : FaultNotiDetail  ###########");
			$.each(headerData, function(key, val){
				console.log(loginDebugPrefix + key + " : " + val);
			});

			if(headerData.result != 0) {
				$.mobile.hidePageLoadingMsg();
				showCommonAlert("고장상황[상세화면 본문]", headerData.errMsg);
			} else { 
				var bodyData = result.body;
				$.each(bodyData, function(key, val) {
					console.log(alarmList_noti_detail_debugPrefix + "============ 고장상황 상세화면 내용 업데이트 ============ notiseqnum : " + val.notiseqnum);
					//	본문 데이터 셋팅
					$("#detail_subject").text(nullCheck(val.SUBJECT));
					$("#detail_writeDate").text(nullCheck(val.WRITEDATE));
					$("#detail_faultRecoverTime").text(nullCheck(val.FAULT_RECOVER_TIME));
					$("#detail_transferDate").text("미구현");
					$("#detail_writerName").text(nullCheck(val.WRITERNAME));
					$("#detail_services").text(nullCheck(val.SERVICES));
					$("#detail_addr").text(nullCheck(val.OFFICESDETAILADDR));
					faultLocation = nullCheck(val.OFFICESDETAILADDR);	// 국사위치 지오코딩용 변수
					$("#detail_vocCnt").text("총:"+ nullCheck(val.TOTAL_VOC_CNT) +", 고장:"+ nullCheck(val.FAULT_VOC_CNT) +", 시설:"+ nullCheck(val.TT_VOC_MAPP_CNT));
					$("#detail_officeName").text(nullCheck(val.OFFICENAMES));
					$("#detail_content").text(nullCheck(val.CONTENT));
					
					if(pollingDate_detail == null) {
						pollingDate_detail = nullCheck(val.WRITEDATE);		// 파라미터용으로 따로 저장
					}
					setOfficeName = nullCheck(val.OFFICENAMES);			// office name을 전송 파라미터용도로 따로 저장
			    });
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			$.mobile.hidePageLoadingMsg();
			showCommonAlert("고장상황[상세화면 본문]", textStatus);
			
	        console.log(alarmList_noti_detail_debugPrefix + "고장상황 상세화면 내용 업데이트 에러 : " + jqXHR.status);
	        console.log(alarmList_noti_detail_debugPrefix + "고장상황 상세화면 내용 업데이트 에러 : " + jqXHR.responseText);
			console.log(alarmList_noti_detail_debugPrefix + "고장상황 상세화면 내용 업데이트 에러 : " + errorThrown);
	    }
	});
}

// 코멘트 seqNum 최대값 산출
function getMaxValue() {
	var maxSeqNum = Math.max.apply(null, commentSeqArray);
	console.log(alarmList_noti_detail_debugPrefix + "Max Comment SeqNum = " + maxSeqNum);
	
	return maxSeqNum;
}

//	위경도를 구글에 요청한다.
function getGeocode(faultLocation, mapCanvasId) {
	//	지오코드의 유효성을 판별하기 위한 변수.
	var status = "";
	console.log(alarmList_noti_detail_debugPrefix + "============ Geocoding start : " + faultLocation + " ============");
	
	$.ajax({
		url: "http://maps.googleapis.com/maps/api/geocode/json",
	    type: 'get',
	    dataType: "json",
		timeout: commonTimeout,
		data: {address:faultLocation, sensor:false},
		success: function (result) {
			console.log(alarmList_noti_detail_debugPrefix + "============ Geocoding success============");
			status = result.status;
			var results = result.results;

			$.each(results, function(key, val) {
				//	위도 경도를 셋팅한다.
				geocodeLat = val.geometry.location.lat;
				geocodeLng = val.geometry.location.lng;
		    });
		},
		error: function(jqXHR, textStatus, errorThrown) {
	        console.log(alarmList_noti_detail_debugPrefix + "============ Geocoding error ============ : " + jqXHR.status);
	        console.log(alarmList_noti_detail_debugPrefix + "============ Geocoding error ============ : " + jqXHR.responseText);
			console.log(alarmList_noti_detail_debugPrefix + "============ Geocoding error ============ : " + errorThrown);
	    }
	}).done(function() {
		console.log(alarmList_noti_detail_debugPrefix + "============ Geocoding Result : "+ status +"============");
		console.log(alarmList_noti_detail_debugPrefix + "============ Geocoding Lat : "+ geocodeLat +"============");
		console.log(alarmList_noti_detail_debugPrefix + "============ Geocoding Lng : "+ geocodeLng +"============");
		
		if(status != "OK") {
			//	주소정보가 올바르지 않을 경우 경고창 출력 후 이전페이지로 이동.
			showCommonAlert("지도보기", "주소 정보가 올바르지 않습니다.");
			return;
		}else {
			//	지도 출력, 맵이 들어갈 div id를 인자, 경도, 위도를 인자로 넘긴다.
			showOllehMap(mapCanvasId, geocodeLng, geocodeLat);
		}
	});
}

//	인접출동자 정보를 맵에 표시한다.
function getNearLocationInfo() {
	console.log(alarmList_noti_detail_debugPrefix + "============ getNearLocationInfo() ============ date : " + detail_nearLocationDate);
	console.log(alarmList_noti_detail_debugPrefix + "============ getNearLocationInfo() ============ danOrgCode : " + detail_danOrgCode);
	
	$.mobile.loading( "show", {
		  text: "인접출동자를 표시합니다.",
		  textVisible: true,
		  theme: "a",
		  html: ""
	});
	
	$.ajax({
		url: url + "UserNearLocationInfo",
	    type: 'post',
	    dataType: "json",
		timeout: commonTimeout,
		data: {danorgcode:detail_danOrgCode, currentdate:detail_nearLocationDate},
		success: function (result) {
			var headerData = result.header;
			// header log
			console.log(loginDebugPrefix + "########### Header Data : UserNearLocationInfo  ###########");
			$.each(headerData, function(key, val){
				console.log(loginDebugPrefix + key + " : " + val);
			});

			if(headerData.result != 0) {
				$.mobile.hidePageLoadingMsg();
				showCommonAlert("인접 출동자", headerData.errMsg);
			} else { 
				console.log(alarmList_noti_detail_debugPrefix + "============ get UserNearLocationInfo success Marker RePaint============");
				// 인접 출동자 새로 고침 시 현재 그려진 마커/인포윈도우를 제거한뒤 배열 초기화
				if(marker.length == 0) {
					console.log(alarmList_noti_detail_debugPrefix + "============ setMarker count ============ : " + marker.length);
				} 
				else {
					console.log(alarmList_noti_detail_debugPrefix + "============ reMarker count ============ : " + marker.length);
					for(var i=0; i < marker.length; i++) {
						marker[i].setMap(null);
						infowindow[i].close();
					}
					marker = new Array();
					infowindow = new Array();
				}
				
				var body = result.body;
				var points = new Array();

				$.each(body, function(key, val) {
					$.each(val, function(key, val) {
						console.log(alarmList_noti_detail_debugPrefix + key + " : " + val);
				    });
					//	출동자 위치정보 수집 시간
					detail_nearLocationDate = val.CURRENTDATE;
					//	올레맵용 좌표 변환 UTM_K >> WGS84, 인자로 경도, 위도를 넘긴다.
					var coordinate = transformLatLng(val.LONGITUDE, val.LATITUDE);
					points[key] = coordinate;
					// 마커 생성
					marker[key] = new olleh.maps.Marker({position: points[key]});
					marker[key].setMap(ollehMap);
					
					// 인포 윈도우 생성
					//	infoWindow contentString 터치 시 이벤트 발생
					var contentString  = "<p style='margin:7px 22px 7px 12px;font:12px/1.5 sans-serif'><strong>"+ val.USERNAME +"</strong><br><a href='tel:"+ val.MOBILE_PHONE_NUM +"'>"+ val.MOBILE_PHONE_NUM +"</a></p>";
					infowindow[key] = new olleh.maps.InfoWindow({ 
					    content: contentString
					});
			    });
				// 리스너 연결 : 마커에 클릭 이벤트 할당 Android의 경우 click 이벤트, iOS의 경우 touchstart 이벤트를 사용한다.
				for(var i = 0; i < marker.length; i++) {
					marker[i].index = i;
					if (deviceInfo != "Android") {
						olleh.maps.event.addListener(marker[i], "touchstart", function() {
							for(var i = 0; i < marker.length; i++) {
								infowindow[i].close();
							}
							infowindow[this.index].open(ollehMap, marker[this.index]);
						});
					} 
					else {
						olleh.maps.event.addListener(marker[i], "click", function() {
							for(var i = 0; i < marker.length; i++) {
								infowindow[i].close();
							}
							infowindow[this.index].open(ollehMap, marker[this.index]);
						});
					}
				}
				$.mobile.hidePageLoadingMsg();
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			$.mobile.hidePageLoadingMsg();
			showCommonAlert("인접 출동자", textStatus);
			
	        console.log(alarmList_noti_detail_debugPrefix + "============ get UserNearLocationInfo error ============ : " + jqXHR.status);
	        console.log(alarmList_noti_detail_debugPrefix + "============ get UserNearLocationInfo error ============ : " + jqXHR.responseText);
			console.log(alarmList_noti_detail_debugPrefix + "============ get UserNearLocationInfo error ============ : " + errorThrown);
	    }
	}).done(function() {
		console.log(alarmList_noti_detail_debugPrefix + "============ Marker success ============ marker size : " + marker.length);
	});
}


// 사업장 상세 정보 페이지로 이동 시킨다.
function changePageOfficeDetail(workPlaceSeqNum) {
	$.mobile.changePage("map_transOffice_detail.html?workplaceSeqNum=" + workPlaceSeqNum);
}

//	상황보고용 라디오 버튼을 생성한다.
function createReportRadioButton() {
	var radioHtml = "";
	
	for (var i=0; i<moveStateCode.length; i++) {
		if(i == 0) {
			radioHtml += 	"<input type='radio' name='detail_report' data-theme='d' data-iconpos='right' id='radio-choice-v"+ i +"' value='"+ moveStateCode[i] +"' checked='checked'>" +
							"<label for='radio-choice-v"+ i +"'>"+ moveStateCodeVal[i] +"</label>";
		} else {
			radioHtml += 	"<input type='radio' name='detail_report' data-theme='d' data-iconpos='right' id='radio-choice-v"+ i +"' value='"+ moveStateCode[i] +"'>" +
							"<label for='radio-choice-v"+ i +"'>"+ moveStateCodeVal[i] +"</label>";
		}
	}
	
	$("#report_controlgroup").append(radioHtml);
	$("#report_controlgroup").trigger('create');
}

function getPingResult(ip) {
	console.log(alarmList_noti_detail_debugPrefix + "========= Ping Test IP : " + ip + "=========");
	var errFlag = true;
	
	// 연속 실행 금지 방지 flag
	if(detail_pingFlag) {
		detail_pingFlag = false;
		
		$.mobile.loading( "show", {
			  text: "Ping Test...",
			  textVisible: true,
			  theme: "a",
			  html: ""
		});
		//	Ping Test 시작 시 폴링을 멈춘다.
		if(interval_detail != null && $.mobile.activePage.is('#page_alarmList_detail')) {
			clearInterval(interval_detail); 
			console.log(alarmList_noti_detail_debugPrefix + "========= 고장상황(진행) 상세 페이지 폴링 중지, Polling Number => " + interval_detail + "=========");
		}
		
		$.ajax({
			url: url + "PingTest",
			type: "post",
			timeout: commonTimeout,
			data: {ipaddress:ip},
			success: function (result) {
				var headerData = result.header;
				// header log
				console.log(alarmList_noti_detail_debugPrefix + "########### Header Data : PingTest  ###########");
				$.each(headerData, function(key, val){
					console.log(alarmList_noti_detail_debugPrefix + key + " : " + val);
				});

				if(headerData.result != 0) {
					$.mobile.hidePageLoadingMsg();
					showCommonAlert("PingTest", headerData.errMsg);
				} else { 
					errFlag = false;
					console.log(alarmList_noti_detail_debugPrefix + "=============== PingTest Result ===============");
					$.each(headerData, function(key, val) {
						console.log(alarmList_noti_detail_debugPrefix + key + " : " + val);
					});
					$("#ping_result").text(headerData.errMsg);
				}
			},
			error: function(jqXHR, textStatus, errorThrown) {
				$.mobile.hidePageLoadingMsg();
				showCommonAlert("PingTest", textStatus);
				
		        console.log(alarmList_noti_detail_debugPrefix + "PingTest 에러 : " + jqXHR.status);
		        console.log(alarmList_noti_detail_debugPrefix + "PingTest 에러 : " + jqXHR.responseText);
				console.log(alarmList_noti_detail_debugPrefix + "PingTest 에러 : " + errorThrown);
		    }
		}).done(function() {
			$.mobile.hidePageLoadingMsg();
			// Ping Test 완료 후 다시 폴링 시작
			 if($.mobile.activePage.is('#page_alarmList_detail')){
				interval_detail = setInterval(function(){
					faultNotiPolling();
				}, 10*1000);
				console.log(alarmList_noti_detail_debugPrefix + "========= 고장상황(진행) 상세 페이지 폴링 시작, Polling Number => " + interval_detail + "=========");
		    }
			 if(!errFlag) {
					$("#popup_pingTest").popup( "open");
			 }
			detail_pingFlag = true;
		});
	} else {
		console.log(alarmList_noti_detail_debugPrefix + "========= Ping Test 가 이미 수행 중입니다. =========");
	}
}

// 고장 상황(진행) 상세 지도 보기
$(document).on("pageshow","#page_alarmList_detail_map",function(event) {
	//	Navbar의 클릭 이벤트 시 버튼 토글 상태를 해제
	$("div:jqmData(role='navbar')").click(function () {
		$("a").removeClass("ui-btn-active");
	});
	// header의 back 버튼 클릭 시 이동할 상세 페이지 셋팅
	$("#btn_back").attr("href", $("#btn_back").attr("href") + "?notiseqnum=" + notiseqnum);
	
	var header = $("div[data-role='header']:visible");
	var footer = $("div[data-role='footer']:visible");
	var content = $("div[data-role='content']:visible");
	var viewport_height = $(window).height();

	var content_height = viewport_height - header.outerHeight() - footer.outerHeight();
	/* Trim margin/border/padding height */
	content_height -= (content.outerHeight() - content.height());
	// 디바이스에 사이즈에 동적으로 map height를 설정
	$("#map_canvas").css('min-height', content_height);
	//	인접출동자를 맵에 표시
	$("#btn_getWorker").click(function() {
		getNearLocationInfo();
	});
	// 다음맵 호출 
	$("#btn_callNavi").click(function() {
		
		$.mobile.loading( "show", {
			  text: "올레네비를 실행합니다.",
			  textVisible: true,
			  theme: "a",
			  html: ""
		});
		// 현재 위치 정보를 수집 한 뒤 목적지까지 길찾기 시작
		navigator.geolocation.getCurrentPosition(onCurrentPosSuccess, onCurrentPosError);
	});
	// 상세주소를 지오코드로 변환하여 맵을 그린다, 인자로 상세주소와 맵이 그려질 div id를 넘긴다.
	getGeocode(faultLocation, "map_canvas");
});

// 고장 상황(진행)상세 댓글 + 사진 입력
$(document).on("pagebeforeshow","#page_alarmList_detail_capture",function(event) {
	//	Navbar의 클릭 이벤트 시 버튼 토글 상태를 해제
	$("div:jqmData(role='navbar')").click(function () {
		$("a").removeClass("ui-btn-active");
	});
	// header의 back 버튼 클릭 시 이동할 상세 페이지 셋팅
	$("#btn_back").attr("href", $("#btn_back").attr("href") + "?notiseqnum=" + notiseqnum);
	
	$('#btn_captureImg').click(function() {
		take_pic();
	});
	$('#btn_loadImg').click(function() {
		album_pic();
	});
	$('#btn_setComment_capture').click(function() {
		fileUpload();
	});
});

//	고장 상황(진행) 상세 페이지
$(document).on("pagebeforeshow","#page_alarmList_detail",function(event) {	
	//	Navbar의 클릭 이벤트 시 버튼 토글 상태를 해제
	$("div:jqmData(role='navbar')").click(function () {
		$("a").removeClass("ui-btn-active");
	});
	
	// 현재위치 전송 이벤트
	$("#btn_setLocation").click(function () {
		setLocation();
	});
	
	// 상황보고 확인 버튼 이벤트
	$("#btn_setReport").click(function () {
		setReport();
	});
	
	// 상황보고 팝업 창 닫기 이벤트 
	$('#btn_closePopup').click(function () {
		$("#popupNested").popup( "close" );
	});
	
	// 지도보기 버튼 이벤트 
	$('#btn_showMap').click(function () {
		//	고장국사의 상세주소 정보가 올바르지 않을 경우 예외처리
		if(faultLocation == null || faultLocation == "-") {
			showCommonAlert("지도보기", "상세주소가 올바르지 않습니다.");
		} else {
			$.mobile.changePage("alarmList_noti_detail_map.html");
		}
	});
	
	// Ping Test 팝업 창 닫기 이벤트 
	$('#btn_closePing').click(function () {
		$("#popup_pingTest").popup( "close" );
	});
	
	// 테이블 접기 이벤트
	$("#btn_tableVisible").click(function () {
		if(detail_tableVisible) {
			$("#btn_tableVisible .ui-btn-text").text("테이블 펴기");
			$("#btn_tableVisible").attr("data-icon", "arrow-d");
			$("#btn_tableVisible").buttonMarkup( "refresh" );
			$("#table_detail").hide();
			detail_tableVisible = false;
		} else {
			$("#btn_tableVisible .ui-btn-text").text("테이블 접기");
			$("#btn_tableVisible").attr("data-icon", "arrow-u");
			$("#btn_tableVisible").buttonMarkup( "refresh" );
			$("#table_detail").show();
			detail_tableVisible = true;
		}
	});
	
	// PingTest 버튼을 누르면 다이얼로그를 호출한다.
	$("#btn_pingTest").click(function () {
		$("#popupPingTest").popup("open");
		//	다이얼로그 출력 시 MST_IP가 존재할 경우 값을 설정한다.
		if(detail_mstIp != null || detail_mstIp != "-") {
			$('#input_IPv4').val(detail_mstIp);
		}
	});
	
	//	PingTest 다이얼로그 확인버튼 이벤트
	$("#btn_ping_submit").click(function () {
		//	IPv4 유효성 체크
		if(checkIP($('#input_IPv4').val())) {
			//	입력된 IP주소로 PingTest 시작
			getPingResult($('#input_IPv4').val());
			//	다이얼로그 닫기, 입력 초기화
			$("#popupPingTest").popup("close");
			$('#input_IPv4').val("");
		} else {
			showCommonAlert("PingTest", "IP주소가 잘못되었습니다.");
		}
	});
	
	//	PingTest 다이얼로그 취소버튼 이벤트
	$("#btn_ping_cancel").click(function () {
		//	다이얼로그 닫기, 입력 초기화
		$("#popupPingTest").popup("close");
		$('#input_IPv4').val("");
	});
	
	// 상세보기 화면에서 팝업 창 생성 시 Polling stop & start
	$( "#popupNested" ).popup({
		  afteropen: function( event, ui ) {
			if(interval_detail != null && $.mobile.activePage.is('#page_alarmList_detail')) {
				clearInterval(interval_detail); 
				console.log(alarmList_noti_detail_debugPrefix + "========= 고장상황(진행) 상세 페이지 폴링 중지, Polling Number => " + interval_detail + "=========");
			}
		  }
	});
	$( "#popupNested" ).popup({
		  afterclose: function( event, ui ) {
			if($.mobile.activePage.is('#page_alarmList_detail')) {
				interval_detail = setInterval(function(){
					faultNotiPolling();
				}, 10*1000);
				console.log(alarmList_noti_detail_debugPrefix + "========= 고장상황(진행) 상세 페이지 폴링 시작, Polling Number => " + interval_detail + "=========");
			}
		  }
	});
	// 폼 전송 전 데이터 셋팅
	$("#btn_setComment_text").click(function () {
		setComment();
	});
	// ajax 폼 전송
	$('#myForm_onlyComment').ajaxForm(options);
	
	// 상세 페이지 출력
	getAlarmDetailPage();
	
	// 상단 하단 margin 적용
	$( '#contentWrapper' ).css( "top", 53 );
	$( '#contentWrapper' ).css( "bottom", 91 );
	// zoom enable
	myScroll = new iScroll('contentWrapper', { zoom: true });
});

$(document).on("pageshow","#page_alarmList_detail",function(event) {
	//	코드 테이블 값으로 상황보고용 라디오 버튼을 생성
	createReportRadioButton();
	//	하위버전 OS에서 해당 폼 안에 아래 속성이 존재할 경우 
	//	페이지 로딩이 되지 않아 페이지 로딩 후 스크립트로 속성 추가
	$("#myForm_onlyComment").attr("data-ajax", false);
});
// 고장 상황(진행) 페이지 이동 시 폴링 인터벌 해제
$(document).on("pagebeforehide","#page_alarmList_detail",function(event) {
	console.log(alarmList_noti_detail_debugPrefix + "========= 고장상황(진행) 상세화면 pagebeforehide :  Polling Stop, PollingDate init ========= ");
	clearInterval(interval_detail); // stop the interval
	interval_detail = null;			// 인터벌 초기화
	commentSeqArray = new Array();	// 상세화면 이동 시 댓글 번호 배열 초기화
	pollingDate_detail = null;		// 상세화면 이동 시 PollingDate 초기화
	interval_flag = false;			// 폴링 플래그 초기
});

// 고장 상황(완료)
$(document).on("pagebeforeshow","#page_alarmList_detail_success",function(event) {
	// 상세 페이지 출력
	getAlarmDetailPage();
	// 상단 하단 margin 적용
	$( '#contentWrapper' ).css( "top", 53 );
	$( '#contentWrapper' ).css( "bottom", 5 );
	// zoom enable
	myScroll = new iScroll('contentWrapper', { zoom: true });
});

$(document).on("pageshow","#page_alarmList_detail_success",function(event) {

});