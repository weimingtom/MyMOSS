var alarmList_noti_detail_contact_debugPrefix = "[alarmList_noti_detail_contact.js] : ";

var commonShowConfirm = function(number) {
    function onConfirm(button) {
        if(button == 2) {
            location.href = "tel:" + number;
        }
    }
    navigator.notification.confirm(
        number, // message
        onConfirm, // callback to invoke with index of button pressed
        '전화연결을하시겠습니까?', // title
        '취소,연결'
    );
};

function call_Test(number){
    if ( number == undefined || number == "" || number == null)return;
        
    commonShowConfirm(number);
   
        
    
}



function showcontactList(){
    // 페이지가 보여지면서 로더를 보여준다.
    $.mobile.loading( "show", {
          text: "리스트를 읽어오는 중 입니다.",
          textVisible: true,
          theme: "a",
          html: ""
    });
    
    notiseqnum=notiseqnum; 
      
       console.log(alarmList_noti_detail_contact_debugPrefix + "넘어온 시퀀스넘버 = " + notiseqnum);
    
    $.ajax({
        url: url+"FaultNotiContactNumber",        
        type: "post",
        timeout : commonTimeout,
        dataType : "json",
        data: {notiseqnum : notiseqnum}, //인풋(접속)
        
        
        success: function (result) {
            var bodyData = result.body; //아웃풋 정보 가져오기
            var contactli="";
            
            if(bodyData.length > 0){
            $.each(bodyData, function(key, val){ //아웃풋 뿌리기
                
                $.each(val, function(key, val) {
                    console.log(alarmList_noti_detail_contact_debugPrefix + key + " : " + val);
                });
                    
                if(val.PHONENUMBER == null ){
                    contactli +=        
                           "<li data-icon='false'>" +
                           "<a href='#'>" +
                           "<div class='listContent'>" +
                           "<p style='display:inline; font-weight:900;'>"+ val.USER_NM +"</p>" +
                           "<p style='display:inline; float:right'>미 등록</p>" +
                           "<p>"+ val.DEPARTMENT_NAME  +"</p>" +
                           "</div>" +
                           "</a>" +
                       "</li>";
   
                    
                }else{
                contactli += "<li data-icon='false' onclick=\"javascript:call_Test('"+ val.PHONENUMBER +"');\">" +
	                    		 "<a href='#'>" +
	                    		 "<div class='listContent'>" +
	                             "<p style='display:inline; font-weight:900;'>"+ val.USER_NM +"</p>" +
	                             "<p style='display:inline; float:right'>"+  val.PHONENUMBER + "</p>" +
	                             "<p>"+ val.DEPARTMENT_NAME  +"</p>" +
	                             "</div>" +
	                             "</a>" +
                             "</li>";
               
                }

                });
            }else{
                contactli = "<li data-icon='false'> "+
                           "    <a href='#'>" +
                           "        <center><h2>데이터가 존재하지 않습니다.</h2></center>" +
                           "    </a>" +
                           "</li>";
            }
            $('#contactList').append(contactli).listview("refresh");
            $.mobile.hidePageLoadingMsg();
        },
        error: function(jqXHR, textStatus, errorThrown){
            console.log(alarmList_noti_detail_contact_debugPrefix + "연락처 조회 리스트 출력 에러 : " + jqXHR.status);
            console.log(alarmList_noti_detail_contact_debugPrefix + "연락처 조회 리스트 출력 에러 : " + jqXHR.responseText);
            console.log(alarmList_noti_detail_contact_debugPrefix + "연락처 조회 리스트 출력 에러 : " + errorThrown);
        } 
    });
}   

$(document).on("pageshow","#page_contact_list", function(event){
    $("#btn_back").attr("href", $("#btn_back").attr("href") + "?notiseqnum=" + notiseqnum);
    showcontactList();

});



