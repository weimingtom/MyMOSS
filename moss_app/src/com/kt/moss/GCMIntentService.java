/*
 * Copyright 2012 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.kt.moss;

import static com.kt.moss.CommonUtilities.EXTRA_MESSAGE;
import static com.kt.moss.CommonUtilities.EXTRA_PUSHTYPE;
import static com.kt.moss.CommonUtilities.SENDER_ID;
import static com.kt.moss.CommonUtilities.displayMessage;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.PowerManager;
import android.util.Log;

import com.google.android.gcm.GCMBaseIntentService;

/**
 * IntentService responsible for handling GCM messages.
 */
public class GCMIntentService extends GCMBaseIntentService {

    private static final String TAG = "GCMIntentService";

    public GCMIntentService() {
        super(SENDER_ID);
    }

    @Override
    protected void onRegistered(Context context, String registrationId) {
        Log.i(TAG, "Device registered: regId = " + registrationId);
        displayMessage(context, getString(R.string.gcm_registered, registrationId));
        ServerUtilities.register(context, registrationId);
    }

    @Override
    protected void onUnregistered(Context context, String registrationId) {
        Log.i(TAG, "Device unregistered");
        displayMessage(context, getString(R.string.gcm_unregistered));
        ServerUtilities.unregister(context, registrationId);
    }

    @Override
    protected void onMessage(Context context, Intent intent) {
        Log.i(TAG, "Received message. Extras : " + intent.getExtras());
        
        String message = intent.getExtras().getString(EXTRA_MESSAGE);
        String title = intent.getExtras().getString(EXTRA_PUSHTYPE);
        
        // noti 발생 시 상수로 사용할 변수
        int notiId = (int)System.currentTimeMillis();
        
        // 푸시 메세지 인코딩
        try {
			message = URLDecoder.decode(message, "EUC-KR");
		} catch (UnsupportedEncodingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
        
        displayMessage(context, message);
        // notifies user
        generateNotification(context, title, message, notiId);
		
        // 화면 잠금 상태 확인
		PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
		boolean isScreenOn = pm.isScreenOn();
		
		Log.i(TAG, "=============== isScreenOn() : " + isScreenOn);
		
		//	PopupActivity의 상태를 확인하여 바로 호출할 것인지, 액티비티를 종료한 뒤 호출.
		PushPopupActivity pushPopupActivity = (PushPopupActivity)PushPopupActivity.myActivity;
		
		//	팝업으로 사용할 액티비티를 호출할 인텐트를 작성. (인텐트 플래그에 유의한다. newTask | clearTop)
        Intent popupIntent = new Intent(context, PushPopupActivity.class).setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        popupIntent.putExtra("message", message);
        popupIntent.putExtra("pushType", title);
        popupIntent.putExtra("notiId", notiId);
		
		//	슬립 상태에서 푸시 메세지 처리 : 팝업 액티비티 호출.
		if(!isScreenOn) {
			Log.i(TAG, "=============== StartActivity() ===============");
			
	        startActivity(popupIntent);
		} 
		//	슬립상태에서 푸시 메세지가 도착하여 푸시 팝업이 나타나 있는 경우 팝업 처리
		else {
			if(PushPopupActivity.popupYN) {
				Log.i(TAG, "=============== finish() >> StartActivity() ===============");
				//	현재 팝업된 액티비티를 종료한 뒤, 새로운 액티비티를 시작한다.
				pushPopupActivity.finish();
		        startActivity(popupIntent);
			}
		}
    }

    @Override
    protected void onDeletedMessages(Context context, int total) {
        Log.i(TAG, "Received deleted messages notification");
        String message = getString(R.string.gcm_deleted, total);
        // noti 발생 시 상수로 사용할 변수
        int notiId = (int)System.currentTimeMillis();
        displayMessage(context, message);
        // notifies user
        generateNotification(context, null, message, notiId);
    }

    @Override
    public void onError(Context context, String errorId) {
        Log.i(TAG, "Received error: " + errorId);
        displayMessage(context, getString(R.string.gcm_error, errorId));
    }

    @Override
    protected boolean onRecoverableError(Context context, String errorId) {
        // log message
        Log.i(TAG, "Received recoverable error: " + errorId);
        displayMessage(context, getString(R.string.gcm_recoverable_error, errorId));
        return super.onRecoverableError(context, errorId);
    }

    /**
     * Issues a notification to inform the user that server has sent a message.
     */
    private void generateNotification(Context context, String title, String message, int notiId) {
    	
        int icon = R.drawable.ic_ktmoss;
        long when = System.currentTimeMillis();
        NotificationManager notificationManager = (NotificationManager)context.getSystemService(Context.NOTIFICATION_SERVICE);
        Notification notification = new Notification(icon, message, when);
//        String title = context.getString(R.string.app_name);
        Intent notificationIntent = new Intent(context, MainActivity.class);
        // set intent so it does not start a new activity
        notificationIntent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent intent = PendingIntent.getActivity(context, 0, notificationIntent, 0);
        // 상황에 따른 타이블과 알림음 발생
        if("1".equals(title)) {
        	title = "고장상황 발생";
        	notification.sound = Uri.parse("android.resource://" + getPackageName() + "/" + R.raw.pushtype1);
        }
        else if("2".equals(title)) {
        	title = "고장상황 진행";
        	notification.sound = Uri.parse("android.resource://" + getPackageName() + "/" + R.raw.pushtype2);
        }
        else if("3".equals(title)) {
        	title = "고장상황 회복";
        	notification.sound = Uri.parse("android.resource://" + getPackageName() + "/" + R.raw.pushtype3);
        }
        else if("4".equals(title)) {
        	title = "고장상황 수정";
        	notification.sound = Uri.parse("android.resource://" + getPackageName() + "/" + R.raw.pushtype4);
        }
        else {
        	title = "KT MOSS";
        	notification.defaults |= (Notification.DEFAULT_SOUND ) ;	//	기본 알림음 발생
        }
        notification.setLatestEventInfo(context, title, message, intent);
        notification.flags |= Notification.FLAG_AUTO_CANCEL;		//	상태바에서 푸시 선택시 알림 해제
        notification.defaults |= ( Notification.DEFAULT_VIBRATE) ;	//	기본 진동 발생
        notificationManager.notify(notiId, notification);			//	다중 noti 현재 시간을 상수로 사용
        
        Log.i(TAG, String.valueOf(notiId));
    }
}
