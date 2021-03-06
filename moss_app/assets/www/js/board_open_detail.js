/**
 *	 board_open_detail.js
 */

var board_open_detail_debugPrefix = "[board_open_detail.js] : ";
var board_open_update_debugPrefix = "[board_open_detail.js] : ";
var freeSeqNum="";
var attachSeqNum="";

var updateSubject="";
var updateContent="";
var updateFileName="";

//var openCommentCount="";	//댓글 개수

//댓글 삭제
function deleteComment(commentSeqNum){
	$.ajax({
		url: url + "DeleteBDFreeComment",
		type: "post",
		timeout: commonTimeout,
		dataType: "json",
		data: {freeSeqNum:freeSeqNum,commentSeqNum:commentSeqNum},
		success: function (result) {
			var headerData = result.header;
			// header log
			console.log(board_open_detail_debugPrefix + "########### Header Data : boardCommentDelete  ###########");
			$.each(headerData, function(key, val){
				console.log(board_open_detail_debugPrefix + key + " : " + val);
			});

			if(headerData.result != 0) {
				$.mobile.hidePageLoadingMsg();
				showCommonAlert("자유게시판", headerData.errMsg);
			} else { 	
				// 화면에 리스트 출력이 완료되면 loader를 종료				                
				$.mobile.hidePageLoadingMsg();					    
			}
			console.log(board_open_detail_debugPrefix + "============ 자유게시판 댓글 삭제 완료 ============");
		},
		error: function(jqXHR, textStatus, errorThrown) {
			$.mobile.hidePageLoadingMsg();
			showCommonAlert("자유게시판", textStatus);
	        console.log(board_open_detail_debugPrefix + "자유게시판 댓글 삭제 에러 : " + jqXHR.status);
	        console.log(board_open_detail_debugPrefix + "자유게시판 댓글 삭제 에러 : " + jqXHR.responseText);
			console.log(board_open_detail_debugPrefix + "자유게시판 댓글 삭제 에러 : " + errorThrown);
	    }
	}).done(function() {
		getBoardOpenDetailPage();
	});
}

//첨부파일 삭제
function deleteAttachedFile(attSeqNum){
    $.ajax({
        url: url + "DeleteBDAttach",
        type: "post",
        timeout: commonTimeout,
        dataType: "json",
        data: {freeSeqNum:freeSeqNum,attachSeqNum:attachSeqNum},
        success: function (result) {
            var headerData = result.header;
            // header log
            console.log(board_open_detail_debugPrefix + "########### Header Data : boardAttachedFileDelete  ###########");
            $.each(headerData, function(key, val){
                console.log(board_open_detail_debugPrefix + key + " : " + val);
            });

            if(headerData.result != 0) {
                $.mobile.hidePageLoadingMsg();
                showCommonAlert("자유게시판", headerData.errMsg);
            } else {    
                // 화면에 리스트 출력이 완료되면 loader를 종료
                $.mobile.hidePageLoadingMsg();
                $('#openOriginal_file').html("<div id='noFileName'>없음</div>");
                attachSeqNum="";
            }
            console.log(board_open_detail_debugPrefix + "============ 자유게시판 첨부파일 삭제 완료 ============");
        },
        error: function(jqXHR, textStatus, errorThrown) {
            $.mobile.hidePageLoadingMsg();
            showCommonAlert("자유게시판", textStatus);
            console.log(board_open_detail_debugPrefix + "자유게시판 댓글 삭제 에러 : " + jqXHR.status);
            console.log(board_open_detail_debugPrefix + "자유게시판 댓글 삭제 에러 : " + jqXHR.responseText);
            console.log(board_open_detail_debugPrefix + "자유게시판 댓글 삭제 에러 : " + errorThrown);
        }
    }).done(function() {
        
    });
}


//게시판 삭제
function deleteBoard(){
    
    if(attachSeqNum == null || attachSeqNum == "null"){
        attachSeqNum = "";
    }
    
    $.ajax({
        url: url + "DeleteBDFree",
        type: "post",
        timeout: commonTimeout,
        dataType: "json",
        data: {freeSeqNum:freeSeqNum,attachSeqNum:attachSeqNum},
        success: function (result) {
            var headerData = result.header;
            // header log
            console.log(board_open_detail_debugPrefix + "########### Header Data : boardDelete  ###########");
            $.each(headerData, function(key, val){
                console.log(board_open_detail_debugPrefix + key + " : " + val);
            });

            if(headerData.result != 0) {
                $.mobile.hidePageLoadingMsg();
                showCommonAlert("자유게시판", headerData.errMsg);
            } else {    
	            // 화면에 리스트 출력이 완료되면 loader를 종료                              
	            $.mobile.hidePageLoadingMsg();                      
            }
            console.log(board_open_detail_debugPrefix + "============ 자유게시판 댓글 삭제 완료 ============");
        },
        error: function(jqXHR, textStatus, errorThrown) {
            $.mobile.hidePageLoadingMsg();
            showCommonAlert("자유게시판", textStatus);
            console.log(board_open_detail_debugPrefix + "자유게시판 댓글 삭제 에러 : " + jqXHR.status);
            console.log(board_open_detail_debugPrefix + "자유게시판 댓글 삭제 에러 : " + jqXHR.responseText);
            console.log(board_open_detail_debugPrefix + "자유게시판 댓글 삭제 에러 : " + errorThrown);
        }
    }).done(function() {
        //리스트 화면으로 
        showCommonAlert("자유게시판", '게시글이 삭제되었습니다');
        $.mobile.changePage("board_open.html");
    });
}

//게시글 수정
function changeBoard(){
    
    $.mobile.changePage("board_open_update.html");
}

//댓글 삭제 확인창
var showCommetDeleteConfirm = function(commentSeqNum) {
	function showCommetDeleteConfirmCallback(button) {
//		alert('You selected button ' + button);
		if (button == 2) {
			deleteComment(commentSeqNum);
		}
		confirmFlag = true;
	}
	if(confirmFlag) {
		confirmFlag = false;
		navigator.notification.confirm(
				'댓글을 삭제 하시겠습니까?', // message
				showCommetDeleteConfirmCallback, // callback to invoke with index of button pressed
				'자유게시판', // title
				'취소,확인' // buttonLabels
			);
	}
};
//게시글 삭제 버튼
var showBoardDeleteConfirm = function() {
    
    function showBoardDeleteConfirmCallback(button) {
//      alert('You selected button ' + button);
        if (button == 2) {
            deleteBoard();
        }
        confirmFlag = true;
    }
    if(confirmFlag) {
        confirmFlag = false;
        navigator.notification.confirm(
                '게시글을 삭제 하시겠습니까?', // message
                showBoardDeleteConfirmCallback, // callback to invoke with index of button pressed
                '자유게시판', // title
                '취소,확인' // buttonLabels
            );
    }
};

//게시글 수정 버튼
var showBoardChangeConfirm = function() {
    
    function showBoardChangeConfirmCallback(button) {
//      alert('You selected button ' + button);
        if (button == 2) {
            setBoardUpdateSubmit();
        }
        confirmFlag = true;
    }
    if(confirmFlag) {
        confirmFlag = false;
        navigator.notification.confirm(
                '게시글을 수정 하시겠습니까?', // message
                showBoardChangeConfirmCallback, // callback to invoke with index of button pressed
                '자유게시판', // title
                '취소,확인' // buttonLabels
            );
    }
};

//자유게시판 상세페이지 컨텐츠부분
function getBoardOpenDetailPage() {
    
	freeSeqNum = commonRequest("freeSeqNum");
	freeSeqNum = freeSeqNum.replace("#", "");
	console.log(board_open_detail_debugPrefix + "================ request freeseqnum ================ : " + freeSeqNum);

	$.ajax({
		url: url + "BDFreeDetail",
		type: "post",
		timeout: commonTimeout,
		dataType: "json",
		data: {freeSeqNum:freeSeqNum},
		success: function (result) {
			var headerData = result.header;
			// header log
			console.log(board_open_detail_debugPrefix + "########### Header Data : BDFreeDetail  ###########");
			$.each(headerData, function(key, val){
				console.log(board_open_detail_debugPrefix + key + " : " + val);
			});

			if(headerData.result != 0) {
				$.mobile.hidePageLoadingMsg();
				showCommonAlert("자유게시판[상세화면]", headerData.errMsg);
			} else { 
				var bodyData = result.detail;
				
				$.each(bodyData, function(key, val){
					console.log(board_open_detail_debugPrefix + "============ 자유게시판 상세화면 출력 ============");
					
					$.each(val, function(key, val) {
						console.log(board_open_detail_debugPrefix + key + " : " + val);
					});
					
					//	본문 테이블 생성
					var open_tableText =  "<table id='table_detail'>"+
	                "<tr>"+ 
	                "<td>제 목</td>"+
	                "<td colspan='3' id='board_open_title'></td>"+
	                "</tr>"+
	                "<tr>"+
	                "<td>작성일시</td>"+
	                "<td colspan='3' id='board_open_writeDate'></td>"+
	                "</tr>"+                           
	                "<tr>"+
	                "<td width='25%'>작 성 자</td>"+
	                "<td width='25%' id='board_open_writer'></td>"+
	                "<td width='25%'>조 회 수</td>"+
	                "<td width='25%' id='board_open_viewCount'></td>"+
	                "</tr>"+   
	                "<tr>"+
	                "<td colspan='4' id='board_open_content' valign='top' height='200'></td>"+
	                "</tr>"+
	                "<tr>"+
	                "<td>첨부파일</td>"+
	                "<td colspan='3' id='board_open_file'></td>"+
	                "</tr>"+
	                
	                "</table>";
					  var board_openCon = "<div id='board_openContents' style='width:100%; height:100%; padding:4px'><div>";
	                  
	                    console.log(board_open_detail_debugPrefix + "첨부파일 일련번호 : " + val.ATTACHSEQNUM);
	                    console.log(board_open_detail_debugPrefix + "content : " + val.CONTENT);
	                    
	                    //본문 테이블 넣기                                                                             
	                    $('#board_open_table').html(open_tableText);                
	                    $('#board_open_content').html(board_openCon);
	                    //본문 데이터 세팅             
	                    $('#board_open_title').text(val.SUBJECT);
	                    $('#board_open_writeDate').text(val.WRITEDATE);
	                    $('#board_open_writer').text(val.WRITERNAME);
	                    $('#board_open_viewCount').text(val.READCNT);
	                    $('#board_openContents').text(val.CONTENT);
	                    //	작성자의 경우 삭제,수정 버튼을 활성화
	                    if(loginId == val.WRITERID){
	                    	var board_button =                                                                                                                     
	            			'<a href="#board_option" id="popup_option" data-rel="popup"  data-role="button" data-transition="slidedown" data-position-to="window" data-mini="false" class="ui-btn-right"><img src="../img/free_deleteUpdate.png"></a>';
	                        $('#optionbutton').html(board_button);
	                    }
	                      //수정용 데이터
	                     updateSubject=val.SUBJECT;
	                     updateContent=val.CONTENT;
	                     updateFileName=val.FILENAME;
	                    $( '#popup_option' ).buttonMarkup( "refresh" );
	                    //본문 삭제용
	                    attachSeqNum = val.ATTACHSEQNUM;
	                    
	                console.log(board_open_detail_debugPrefix + "content : " +  $('#board_openContents').val(val.CONTENT));
                    if(val.FILENAME==null){
                        $('#board_open_file').html("<div id='noFileName'>없음</div>");
                    }else{	                  
                        if(deviceInfo == "Android"){ //안드로이드일땐 로더가 돌며 
                            $('#board_open_file').append( 
                                    "<div id='wrapper_filename'>" + val.FILENAME + "</div>" + 
                                    "<img id='img_filename' style='float:right; margin-right:0.25em;' class='fileDown' src='../img/floppy.png' onmouseover='Downloadloder();' onclick=commonDownloadURL('filedownload?attachSeqNum="+ val.ATTACHSEQNUM +"');>");
                        }else{
                            $('#board_open_file').append(
                                    "<div id='wrapper_filename'>" + val.FILENAME + "</div>" + 
                                    "<img id='img_filename' style='float:right; margin-right:0.25em;' class='fileDown' src='../img/floppy.png' onclick=commonDownloadURL('filedownload?attachSeqNum="+ val.ATTACHSEQNUM +"');>");
                        }
                        //첨부파일 사이즈         
                        var fileTextLength = $('#board_open_file').outerWidth() - 50;
                        $('#wrapper_filename').css("width", fileTextLength);
                    }
	                
	             // 자유게시판 상세 댓글
					var commentData = result.comment;
					var liText = "";
				
					
					$.each(commentData, function(key, val){
						console.log(board_open_detail_debugPrefix + "============ 자유게시판 상세화면 댓글 출력 ============ CommentSeqNum => " + val.COMMENTSEQNUM);
						
						$.each(val, function(key, val) {
							console.log(board_open_detail_debugPrefix + key + " : " + val);
						});
						
						// 자신이 쓴 댓글만 지울수 있음
						if(loginId == val.WRITERID){
							liText += 	"<li>" +
										"<div id='comment_list'>"+
										"<p><b>" + val.WRITEDATE + " (" + val.WRITERNAME + ")</b></p>" +
										"<p><div style='float:right'; onClick='showCommetDeleteConfirm("+val.COMMENTSEQNUM+");'><font color='red'>삭제</font></div></p>" +
										"</div>" +
										"<p style='white-space:pre-wrap; font-size:1em;'><div style='display:inline;'>" + val.CONTENT + "</div></p>"+
										"</li>";
						}else{
							liText += 	"<li>" +
										"<div id='comment_list'>" +
										"<p><b>" + val.WRITEDATE + " (" + val.WRITERNAME + ")</b></p>" +
										"</div>" +
										"<p style='white-space:pre-wrap; font-size:1em;'><div style='display:inline;'>" + val.CONTENT + "</div></p>"+
										"</li>";
						}						
					});
					$("#board_commentList").empty();
					$("#board_commentList").append(liText).listview("refresh");
					
					// 화면에 리스트 출력이 완료되면 loader를 종료				                
					$.mobile.hidePageLoadingMsg();
			    });
				 
			}
			console.log(board_open_detail_debugPrefix + "============ 자유게시판 상세화면 출력 완료 ============");
		},
		error: function(jqXHR, textStatus, errorThrown) {
			$.mobile.hidePageLoadingMsg();
			showCommonAlert("자유게시판", textStatus);
	        console.log(board_open_detail_debugPrefix + "자유게시판 상세화면 출력 에러 : " + jqXHR.status);
	        console.log(board_open_detail_debugPrefix + "자유게시판 상세화면 출력 에러 : " + jqXHR.responseText);
			console.log(board_open_detail_debugPrefix + "자유게시판 상세화면 출력 에러 : " + errorThrown);
	    }
	}).done(function() {
	   
	});
}

// cordova api fileUploader
function boardFileUpload() {
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
	    params.content = contents;
	    options.params = params;
	    
	    var ft = new FileTransfer();
	    ft.upload(imgUrl, encodeURI(url + "FaultNotiComment"), winUpload, failUpload, options);
	}
}

function boardWinUpload(r) {
	$.mobile.hidePageLoadingMsg();
	$("#setContent").val("");
    console.log("Code = " + r.responseCode);
    console.log("Response = " + r.response);
    console.log("Sent = " + r.bytesSent);
    
    // 업로드 완료 후 다시 상세페이지로 전환한다.
    $('#btn_back').click();
}

function boardFailUpload(error) {
	$.mobile.hidePageLoadingMsg();
    showCommonAlert("An error has occurred: Code" , error.code);
    console.log("upload error source " + error.source);
    console.log("upload error target " + error.target);
}

function setBoardComment() {
	// 댓글이 입력 되지 않고 전송 버튼을 눌렸을 때 체크
	if($("#open_input_content").val().length == "") {
		showCommonAlert("댓글작성", '댓글을 입력하세요');
	} else {
		$("#freeseqnum").val(freeSeqNum);
		$("#writerid").val(loginId);
		$("#writername").val(userName);
		$("#open_content").val($("#open_input_content").val());
		
		console.log(board_open_detail_debugPrefix + "============= 댓글 입력 파라미터 ==========");
		console.log(board_open_detail_debugPrefix + "freeseqnum = " + $("#freeseqnum").val());
		console.log(board_open_detail_debugPrefix + "writerid = " + $("#writerid").val());
		console.log(board_open_detail_debugPrefix + "writername = " + $("#writername").val());
		console.log(board_open_detail_debugPrefix + "content = " + $("#open_content").val());
		
		 $( "#myForm_openComment" ).submit();
	}
}
//수정페이지 데이터 set
function setBoardUpdateSubmit() {
    if($("#board_UpdateSubject").val().length == "") {
        showCommonAlert("제목작성", '제목을 입력하세요');
    }else if($("#board_UpdateContent").val().length == "") {
        showCommonAlert("내용작성", '내용을 입력하세요');
    }else {
         //파라미터 넘기는부분
        if($("#openUpdateFileButton").val().length == 0) {
            
            console.log(board_open_update_debugPrefix + "============= 게시글 ==========");
            $('#update_attachseqnum_onlyText').val("");
            $('#update_freeSeqNum_onlyText').val(freeSeqNum);
            $("#board_updateSubject_onlyText").val($("#board_UpdateSubject").val());
            $("#board_updateContent_onlyText").val($("#board_UpdateContent").val());
            
            console.log(board_open_write_debugPrefix + "============= 게시글 입력 파라미터 ==========");
            console.log(board_open_write_debugPrefix + "attachSeqNum = " + $("#update_attachseqnum_onlyText").val());
            console.log(board_open_write_debugPrefix + "freeSeqNum = " + $("#update_freeSeqNum_onlyText").val());
            console.log(board_open_write_debugPrefix + "content = " + $("#board_updateSubject_onlyText").val());
            console.log(board_open_write_debugPrefix + "subject = " + $("#board_updateContent_onlyText").val());
            $( "#board_update_BDfree_onlyText" ).submit();   
        } else {
            
            console.log(board_open_write_debugPrefix + "============= 게시글 + 파일 ==========");
            $('#update_freeSeqNum').val(freeSeqNum);
            $('#update_attachseqnum').val(attachSeqNum);
            
            console.log(board_open_write_debugPrefix + "============= 게시글 입력 파라미터 ==========");
            console.log(board_open_write_debugPrefix + "attachSeqNum = " + $('#update_attachseqnum').val());
            console.log(board_open_write_debugPrefix + "freeSeqNum = " + $('#update_freeSeqNum').val());
            console.log(board_open_write_debugPrefix + "BDfile = " + $("#openUpdateFileButton").val());
            
            $( "#board_update_BDfree" ).submit(); 
        }
    }
    
}
//수정페이지 
function showBoardRequestUpdate(formData, jqForm, options) {
    $.mobile.loading( "show", {
          text: "작성 글 업로드...",
          textVisible: true,
          theme: "a",
          html: ""
    });
    var queryString = $.param(formData); 
    console.log(board_open_update_debugPrefix + 'About to submit: \n\n' + queryString);
    return true; 
} 
//수정페이지
function showBoardResponseUpdate(responseText, statusText, xhr, $form)  {
    
    console.log(board_open_update_debugPrefix + 'status: ' + statusText + '\n\nresponseText: \n' + responseText + '\n\nThe output div should have already been updated with the responseText.');
    
    var headerData = responseText.header;
    // header log
    console.log(board_open_update_debugPrefix + "============= showBoardResponseUpdate =============");
    $.each(headerData, function(key, val){
        console.log(board_open_update_debugPrefix + key + " : " + val);
    });
   
    if(headerData.result != 0) {
        $.mobile.hidePageLoadingMsg();
        showCommonAlert("자유게시판", headerData.errMsg);
    } else { 
        $.mobile.hidePageLoadingMsg();
        $("#board_UpdateSubject").val("");
        showCommonAlert("자유게시판", '게시글이 수정되었습니다.');
        $.mobile.changePage("board_open_detail.html?freeSeqNum=" + freeSeqNum);
    }
} 
//수정페이지
var boardUpdateOptions = { 
        beforeSubmit:  showBoardRequestUpdate,    // pre-submit callback 
        success:       showBoardResponseUpdate,   // post-submit callback
        url : url + "ChangeBDFree",
        dataType:  "json",              // 'xml', 'script', or 'json' (expected server response type)
        clearForm: true,                // clear all form fields after successful submit 
        resetForm: true,                // reset the form after successful submit 
        timeout:   commonTimeout
};

//상세페이지 댓글
function showBoardRequest(formData, jqForm, options) {
	$.mobile.loading( "show", {
		  text: "댓글 업로드...",
		  textVisible: true,
		  theme: "a",
		  html: ""
	});
	
    var queryString = $.param(formData); 
    console.log(board_open_detail_debugPrefix + 'About to submit: \n\n' + queryString);

    return true; 
} 


function showBoardResponse(responseText, statusText, xhr, $form)  { 
//	console.log(board_open_detail_debugPrefix + 'status: ' + statusText + '\n\nresponseText: \n' + responseText + '\n\nThe output div should have already been updated with the responseText.');
   
    var headerData = responseText.header;      
	// header log
	console.log(board_open_detail_debugPrefix + "============= showBoardCommentResponse =============");
	$.each(headerData, function(key, val){
		console.log(board_open_detail_debugPrefix + key + " : " + val);
	});
	
	if(headerData.result != 0) {
		showCommonAlert("자유게시판", headerData.errMsg);
		$.mobile.hidePageLoadingMsg();		
	} else { 				
		// 화면에 리스트 출력이 완료되면 loader를 종료				                
		$.mobile.hidePageLoadingMsg();									    
	}
          
    getBoardOpenDetailPage();
    
    $("#open_input_content").val("");
} 

var boardOptions = { 
        beforeSubmit:  showBoardRequest,  	// pre-submit callback 
        success:       showBoardResponse,  	// post-submit callback
        url : url + "WriteBDFreeComment",
        dataType:  "json",        		// 'xml', 'script', or 'json' (expected server response type)
        clearForm: true,        		// clear all form fields after successful submit 
        resetForm: true,        		// reset the form after successful submit 
        timeout:   commonTimeout
};

function UpdatetableResize() {
    //디바이스에 따라 화면 높이 맞추기
    var header = $("div[data-role='header']:visible");      //  header 사이즈
    var footer = $("div[data-role='footer']:visible");      //  footer 사이즈
    var content = $("div[data-role='content']:visible");    //  content 사이즈
    var viewport_height = $(window).height();               //  전체 화면 사이즈
    //  content 사이즈 계산 (전체화면높이 - header높이 - footer높이 - 상하padding)
    var content_height = (viewport_height - header.outerHeight() - footer.outerHeight()) - 18;
    //  content 상하 margin 제거
    content_height -= (content.outerHeight() - content.height());
    
    var tdHeight = $("#openUpdate_title").height();
    
    
    //  content 높이에서 td 2개 높이를 제외한 값으로 Textarea 크기를 설정한다.
    var tdTextareaHeight = content_height - (tdHeight * 2.5);
    //  Textarea 크기 설정
    $("#board_UpdateContent").css('height', tdTextareaHeight);
}

$(document).on("pageshow","#page_board_open_detail",function(event){
    $.mobile.loading( "show", {
        text: "로딩중...",
        textVisible: true,
        theme: "a",
        html: ""
  });
    getBoardOpenDetailPage();
 
    
    $('#btn_openComment_text').click(function(){
    	setBoardComment();
    });
    //	하위버전 OS에서 해당 폼 안에 아래 속성이 존재할 경우 
	//	페이지 로딩이 되지 않아 페이지 로딩 후 스크립트로 속성 추가
	$("#myForm_openComment").attr("data-ajax", false);
	
	$('#myForm_openComment').ajaxForm(boardOptions);		// ajax 폼 전송
}); 

$(document).on("pagebeforeshow","#page_board_open_update",function(event){
    
});

$(document).on("pageshow","#page_board_open_update",function(event){
    
    $('#detail_pageButton').click(function(){
        $.mobile.changePage("board_open_detail.html?freeSeqNum=" + freeSeqNum);
    });
    
    //상세페이지 데이터를 수정페이지로 넘김
    $('#board_UpdateSubject').val(updateSubject);
    $('#board_UpdateContent').val(updateContent);
    if(attachSeqNum==null){
        $('#openOriginal_file').html("<div id='noFileName'>없음</div>");
    }else{
        $('#openOriginal_file').append( "<div id='wrapper_filename' style='width:85%;'>" + updateFileName + "</div>" + 
                                        "<img id='img_filedelete' style='float:right; margin-right:0.25em; width:2em;' src='../img/free_del.png' onclick=deleteAttachedFile();>");
    }
    $('#page_board_open_update').trigger('pagecreate');
    
    $("#board_update_BDfree").attr("data-ajax", false);
    $("#board_update_BDfree_onlyText").attr("data-ajax", false);
    // ajax 폼 전송
    $("#board_update_BDfree").ajaxForm(boardUpdateOptions);
    $("#board_update_BDfree_onlyText").ajaxForm(boardUpdateOptions);
    
    //수정폼 사이즈 
    UpdatetableResize();
}); 
