var board_open_debugPrefix = "[board_open.js] : ";

var listPageNo="1"; //페이지 단위: 더보기를 눌렀을시 페이지가 1씩증가한다.
var listPageUnit="30"; //각 페이지의 리스트 갯수 ex)1page 에 5개의 리스트 출력

function showOpenList(){
    if(listPageNo > 1){
        $('#listAdd').remove();
    }
    // 페이지가 보여지면서 로더를 보여준다.
    $.mobile.loading( "show", {
          text: "리스트를 읽어오는 중 입니다.",
          textVisible: true,
          theme: "a",
          html: ""
    });
    //리스트 불러오기
    $.ajax({
    	url: url + "BDFreeListByRowNum",
    	type: "post",
    	timeout: commonTimeout,
    	dataType: "json",
    	data:{pageNo:listPageNo, recordCount:listPageUnit},
    	success: function(result){ 
    		var bodyData = result.body;
    		var headerData = result.header;
    		var openLi = "";
    		console.log(board_open_debugPrefix + "########### Header Data : OPEN  ###########");
    		$.each(headerData, function(key, val) {
                console.log(board_open_debugPrefix + key + " : " + val);
            });
    		if(headerData.result != 0){
    				openLi = "<li data-icon='false'> "+
		    				"<a href='#'>" +
		    				"<center><h2>정보가 없습니다.</h2></center>" +     
		    				"</a>" +
		    				"</li>";   						
    		}
    		else{
    			$.each(bodyData, function(key, val){
    				$.each(val, function(key, val) {
    					console.log(board_open_debugPrefix + key + " : " + val);
    				});    				
    				openLi += "<li data-icon='false'>" +
			    				"<a href='board_open_detail.html?freeSeqNum="+val.FREESEQNUM+"'>" +	
			    				"<div class='listContent'>" + 
			    				"<h2>"+ val.SUBJECT +"</h2>" +		//제목만
//			    				"<h2>"+ val.SUBJECT +" [" + openCommentCount + "]</h2>" + 		//댓글갯수 표시
			    				"<p style='display:inline-block; float:left'>"+ val.WRITEDATE +"</p>" +
			    				"<p style='display:inline-block; float:right'>"+  val.WRITERNAME + "</p>" +
			    				"</div>" +
			    				"</a>" +
			    				"</li>";
    			});
    			
    			
    		}
    		if(bodyData.length == listPageUnit){
    		openLi += "<li id='listAdd' data-icon='false' data-theme='a' > "+
            "<a href='#' onclick='showOpenList()'>" +
            "<center><h2>더보기</h2></center>" +     
            "</a>" +
            "</li>";
    		}
    		//매뉴얼 리스트 삽입
    		$('#listview').append(openLi).listview("refresh");
    		$.mobile.hidePageLoadingMsg();		
    	},
    	error: function(jqXHR, textStatus, errorThrown){
    	    $.mobile.hidePageLoadingMsg();
            showCommonAlert("자유게시판", textStatus);
    		console.log(board_open_debugPrefix + "자유게시판 리스트 출력 에러 : " + jqXHR.status);
    		console.log(board_open_debugPrefix + "자유게시판 리스트 출력 에러 : " + jqXHR.responseText);
    		console.log(board_open_debugPrefix + "자유게시판 리스트 출력 에러 : " + errorThrown);		
    	} 
    }).done(function(){
        listPageNo = parseInt(listPageNo) + 1;
    });
    
}   
$(document).on("pagebeforecreate","#page_board_open", function(event){   
//  메뉴패널 생성, 반드시 pagebeforecreate 이벤트단에서 호출한다.
    commonCreateMenuPanel();

});

$(document).on("pageshow","#page_board_open", function(event){
   
    //  페이지에 따른 메뉴패널 설정
    commonConfigMenuPanel();
    //  페이지가 생성된 후 상황에 단설정 상태에 따른 팝업창을 호출
    $('#page_board_open').trigger('pagecreate');
    
	showOpenList();
    //새로고침 클릭시 다시 리스트 불러오기
    $("#btn_refresh").click(function () {
        $("#listview").empty();
        listPageNo = 1;
        showOpenList(); 
    });
});

