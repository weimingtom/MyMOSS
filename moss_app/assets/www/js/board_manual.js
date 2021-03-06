/**
 * 		업무매뉴얼 리스트
 */
var manualList_debugPrefix = "[board_manual.js] : ";
var alarmNoti_serCode=new Array();
var alarmNoti_serName=new Array();
var alarmNotice_serCode=new Array();
var manualSel="";
var serCode=new Array();
var serName=new Array();
var maChecked="";
var inputWordText="";
var serviceId="";

/**
 * 서비스분야 배열생성
 */
function serviceCode_CodeName(){
		
	$.ajax({
		url: url+"ServiceList",
		type: "post",
		timeout: commonTimeout,
		dataType: "json",
		success:function(result){			
			var headerData=result.header;
			
			console.log(transOffice_debugPrefix + url+"ServiceList");
			
			$.each(headerData, function(key, val) {
                console.log(transOffice_debugPrefix + key + " : " + val);
            });
			
			if(headerData.result != 0){
				showCommonAlert("서비스분야", headerData.errMsg);
				console.log(manualList_debugPrefix + "분야데이터없음");
			}else{
				var bodyData=result.body;
				$.each(bodyData, function(key,val){
					$.each(val, function(key, val) {
	                    console.log(manualList_debugPrefix + key + " : " + val);
	                });
					
					serCode[key]=val.CD;
					serName[key]=val.CD_NM;									
				});	
			}
		},
		error : function(jqXHR, textStatus, errorThrown){
			console.log(commonDebugPrefix + "서비스코드배열 생성 에러");
			showCommonAlert("서비스분야", textStatus);
		}
	});
}

/**
 * 컨텐츠 크기 맞추기(검색창 고정시키기 위함)
 */
function manualCSS(){
	//디바이스에 따라 화면 높이 맞추기
	var header = $("div[data-role='header']:visible");
	var footer = $("div[data-role='footer']:visible");
	var content = $("div[data-role='content']:visible"); 
	var viewport_height = $(window).height();
			
	var content_height = viewport_height - header.outerHeight() - footer.outerHeight();	
	
	content_height -= (content.outerHeight() - content.height());
	
	$("#manual_content").css('height', content_height);
	
	var manualConH = $("#manual_content").height();
	var manualSearH = $("#selectNsearch").height() + 13;	//+13은 검색창 magine 준 부분
		
	var manualLiH = manualConH - manualSearH;
											
	$("#listManual").css('height', manualLiH);
} 

/**
 * 셀렉트박스 생성
 */
function makeSel(){
	
	var manualSel="";
	
	if(serCode.length > 0){
		
		//페이지에 따라 달리 생성
		if($.mobile.activePage.attr('id') == 'page_manualList'){	//업무매뉴얼 페이지 일때
			console.log(manualList_debugPrefix + "=======전체분야 셀렉트박스=======");
					
			//생성
			for(var i=0; i<serCode.length; i++){																			
				manualSel += "<option value='" + serCode[i] + "'>" + serName[i] + "</option>";			
			}
			//삽입
			$('#manualField').append(manualSel).trigger("create").selectmenu( "refresh" );
			
		}else if($.mobile.activePage.attr('id') == 'page_alarmManualList'){		//고장상황에서 넘어온 업무매뉴얼 페이지 일때
			
			console.log(manualList_debugPrefix + "======고장관련분야 셀렉트박스======= ::: " + detail_services);
			
			//고장진행에서 넘어온 분야가 없을경우 모든 분야를 보여줌
			if(detail_services == null){
				//생성
				for(var i=0; i<serCode.length; i++){																			
					manualSel += "<option value='" + serCode[i] + "'>" + serName[i] + "</option>";			
				}
				//삽입
				$('#manualField').append(manualSel).trigger("create").selectmenu( "refresh" );
			}else{
				//고장관련 서비스코드 배열생성(문자열로 넘어온것 ","로 끊어서 배열에 저장)
				alarmNoti_serCode = detail_services.split(",");
			}
			
			//배열 중복 제거
			var unique_serCode=new Array;				
			$.each(alarmNoti_serCode, function(i, el){
				if($.inArray(el, unique_serCode) === -1) unique_serCode.push(el);
			});
			
			//고장관련 서비스이름 배열생성 (서비스코드와 같은 서비스이름 인덱스 번호의 값을 가져옴)
			var index = 0;					
			for(var i=0; i<unique_serCode.length; i++){	
				var aaa = unique_serCode[i];   	// '01', '02', '03', '04' ...
				var bbb = eval(aaa)-1;				// 1, 2, 3, 4  //eval 함수는 문자열을 숫자로 변환시켜줌 01->1  //-1한 이유는 밸류와 index번호를 맞춰주기 위함. bbb의 값이 내가 꺼내올 배열의 인덱스 번호가 되어야 한다. 
				var ccc = serName[bbb];				// "a", "b", "c", ....
				alarmNoti_serName[index] = ccc;
				index++;
				//alarmNoti_serName[index++] = serName[eval(alarmNoti_serCode[i])-1];  	//이것은 위에 5줄을 한줄로 표현한것.
			}
			
			for(var i=0; i<unique_serCode.length; i++){
				console.log(manualList_debugPrefix + "고장관련 서비스이름 배열생성 ::: " + alarmNoti_serName[i]);
			}
			
			//고장상황에 맞춘 셀렉트 박스 생성
			for(var i=0; i<unique_serCode.length; i++){
				manualSel += "<option value='" + unique_serCode[i] + "'>" + alarmNoti_serName[i] + "</option>";
			}
			//셀렉트박스 삽입
			$('#manualField').html(manualSel).trigger("create").selectmenu( "refresh" );
		}else{
			//not (아무런 console도 안뜨게 주어진것.)
		}	
	}else{
		//생성
		manualSel = '<option value="no">분야없음</option>';
		//삽입
		$('#manualField').html(manualSel).trigger("create").selectmenu( "refresh" );
	}
	//매뉴얼 선택
	$("#manualField").val(maChecked).selectmenu( "refresh" );
	//검색어 입력
	$("#word").val(inputWordText);
}

/**
 * 선택한 분야 저장(뒤로 오기 했을때 그대로 설정 해주기 위해)	
 */
function storeMa(){
	
	maChecked = $("#manualField > option:selected").val();
	
	console.log(manualList_debugPrefix + "선택된 분야 ==== " + maChecked );
}

/**
 * 검색어 저장(뒤로 오기 했을때 그대로 설정 해주기 위해)
 */
function storeWord(){
	inputWordText = $('input:text[id=word]').val();
	
	if($.mobile.activePage.is('#page_manualList')){
		console.log(manualList_debugPrefix + "검색어 ==== " + inputWordText );
	}else{
		console.log(transOffice_debugPrefix + "검색어 ==== " + inputWordText );
	}
}

/**
 * 검색어 리셋
 */
function resetWord(){
	inputWordText="";
	$("#word").val("");
}

/**
 * 검색기능
 */
function filter(){
	var value = $('#word').val();	
	var valueUp = $('#word').val().toUpperCase(); //toUpperCase : 검색어를 대문자로 전환
	$('#listview > li').hide();
	$("#listview > li:contains('"+value+"')").show();
	$("#listview > li:contains('"+valueUp+"')").show();	
}

/**
 * 옵션중 분야선택과 그외의 것들을 택했을때 보여주는 리스트 선택(데이터를 보여줄 것인지 알림말을 보여 줄 것인지) 
 */
function selectManualList(){
	if(maChecked == "SelectManual" || maChecked == ""){
		showBeforeManualList();
	}else{
		showManualList();
	}
}

/**
 * 분야선택옵션 선택시 나타나는 리스트
 */
function showBeforeManualList(){
	
	var manualLi ="";

	manualLi = "<li data-icon='false'> " +
				"<a href='#'>" +
				"<center><h2>분야를 선택하세요.</h2></center>" +     
				"</a>" +
				"</li>";
		
	//매뉴얼 리스트 삽입
	$('#listview').html(manualLi).listview("refresh");	
}

/**
 * 셀렉트박스 선택을 통해 업무매뉴얼 리스트불러오기
 */
function showManualList(){
	// 페이지가 보여지면서 로더를 보여준다.
	$.mobile.loading( "show", {
		  text: "리스트를 읽어오는 중 입니다.",
		  textVisible: true,
		  theme: "a",
		  html: ""
	});

	//선택된 분야 읽어오기
	serviceId=$("#manualField > option:selected").val();
	
	console.log(manualList_debugPrefix + "리스트에서 읽어온 분야 ::: " + serviceId);
	console.log(manualList_debugPrefix + "입력된 검색어 ::: " + inputWordText);
	
	//매뉴얼리스트생성
	$.ajax({
		url: url + "ManualList",
		type: "post",
		timeout: commonTimeout,
		dataType: "json",
		data:{serviceid:serviceId},
		success: function(result){ 			
			var headerData = result.header;
			var manualLi = "";
							
			console.log(transOffice_debugPrefix + url+"ManualList");
			
			$.each(headerData, function(key, val) {
                console.log(transOffice_debugPrefix + key + " : " + val);
            });
			
			if(headerData.result != 0){
				manualLi = "<li data-icon='false'> "+
				"<a href='#'>" +
				"<center><h2>정보가 없습니다.</h2></center>" +     
				"</a>" +
				"</li>";
				$.mobile.hidePageLoadingMsg();
			}
			else{
				var bodyData = result.body;

				$.each(bodyData, function(key, val){
					$.each(val, function(key, val) {
						console.log(manualList_debugPrefix + key + " : " + val);
					});

					//페이지에 따라 리스트에 다른 링크 걸어 주기
					if($.mobile.activePage.attr('id') != 'page_manualList'){	//업무매뉴얼 페이지
						manualLi += "<li data-icon='false'>" +
						"<a href='alarmList_noti_detail_manual_detail.html?manualSeqNum="+val.MANUALSEQNUM+"'>" +	
						"<div class='listContent'>"+								
						"<h2>"+ val.SUBJECT +"</h2>"+				
						"<p style='display:inline-block; float:left'>"+ val.WRITEDATE +"</p>" +
						"<p style='display:inline-block; float:right'>"+  val.WRITERNAME + "</p>" +
						"</div>" +
						"</a>" +
						"</li>";				
					}else{		//고장진행에서 넘어온 업무매뉴얼 페이지				
						manualLi += "<li data-icon='false'>" +
						"<a href='board_manual_detail.html?manualSeqNum="+val.MANUALSEQNUM+"'>" +	
						"<div class='listContent'>" +								
						"<h2>"+ val.SUBJECT +"</h2>" +	
						"<p style='display:inline-block; float:left'>"+ val.WRITEDATE +"</p>" +
						"<p style='display:inline-block; float:right'>"+  val.WRITERNAME + "</p>" +
						"</div>" +
						"</a>" +
						"</li>";
					}					
				});
			}
			//매뉴얼 리스트 삽입
			$('#listview').html(manualLi).listview("refresh");
			$.mobile.hidePageLoadingMsg();		
		},
		error: function(jqXHR, textStatus, errorThrown){
			$.mobile.hidePageLoadingMsg();
			showCommonAlert("업무매뉴얼 목록", textStatus);
			console.log(manualList_debugPrefix + "매뉴얼리스트 출력 에러 : " + jqXHR.status);
			console.log(manualList_debugPrefix + "매뉴얼리스트 출력 에러 : " + jqXHR.responseText);
			console.log(manualList_debugPrefix + "매뉴얼리스트 출력 에러 : " + errorThrown);		
		} 
	}).done(function(){	//필터링된 목록은 필터링 된 상태로 남아 있게 하기.
		if(inputWordText==""){
			
		}else{		
			filter();
		}
	});
}

//로그인 페이지에서 매뉴얼 코드 배열 생성함.
$(document).on("pageshow","#page_login", function(event){  
	serviceCode_CodeName();
});

//메뉴패널 생성, 반드시 pagebeforecreate 이벤트단에서 호출한다.
$(document).on("pagebeforecreate", "#page_manualList" , function(event) {
	commonCreateMenuPanel();
});

//페이지 보여주기 전 단계에서 셀렉트 박스 설정해놓음.
$(document).on("pagebeforeshow","#page_manualList", function(event){
	makeSel();
});

//페이지 보여주면서 리스트 뿌려줌.
$(document).on("pageshow","#page_manualList", function(event){
	//	페이지에 따른 메뉴패널 설정
	commonConfigMenuPanel();
	
	$('#page_manualList').trigger('pagecreate');
	
	//화면고정
//	manualCSS();
	
	if(maChecked == "SelectManual" || maChecked == ""){		//'분야선택' 선택 시 
		showBeforeManualList();		//알림말 출력
	}else{	//서비스 분야 선택시
		showManualList();	//매뉴얼 데이터 출력
	}
		
	$("#btn_refresh").click(function () {
		$("#listview").empty();
		
		if(maChecked == "SelectManual" || maChecked == ""){
			showBeforeManualList();	
		}else{
			showManualList();	
		}
	});
});

//고장진행에서 넘어온 업무매뉴얼 페이지 보여주기 전에 셀렉트 박스 설정 해 놓기
$(document).on("pagebeforeshow","#page_alarmManualList", function(event){
	makeSel();
});

//고장진행에서 넘어온 업무매뉴얼 페이지 보여줌과 동시에 매뉴얼 데이터 뿌려주기
$(document).on("pageshow","#page_alarmManualList", function(event){
//	manualCSS();
	//화면상 백버튼 링크걸어주기
	$('#before_alarmDetail').attr('href','alarmList_noti_detail.html?notiseqnum=' + notiseqnum);
	
		showManualList();	
		
	$("#btn_refresh").click(function () {
		$("#listview").empty();
		
			showManualList();	
	});
});

//업무매뉴얼게시판을 나가면 저장한 분야 초기화 시키기
$(document).on("pagehide","#page_manualList", function(event){	
	if($.mobile.activePage.is('#page_manual_detail')){
		
	}else{
		maChecked="";
		inputWordText="";
	}
});

//고장진행 업무매뉴얼게시판을 나가면 저장한 분야 초기화 시키기
$(document).on("pagehide","#page_alarmManualList", function(event){	
	if($.mobile.activePage.is('#page_alarmManual_detail')){
		
	}else{
		maChecked="";
		inputWordText="";
	}
});