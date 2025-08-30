package com.jaka_mobile.app

// class MainActivity : TauriActivity()

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.os.SystemClock

class MainActivity : TauriActivity() {
  companion object {
    /** Exposed so SyncAlarmReceiver can grab this instance */
    @JvmStatic var instance: MainActivity? = null
  }

  private lateinit var alarmMgr: AlarmManager
  private lateinit var alarmIntent: PendingIntent

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    instance = this

    // Prepare AlarmManager
    alarmMgr = getSystemService(Context.ALARM_SERVICE) as AlarmManager

    // Create a broadcast PendingIntent with the IMMUTABLE flag
    val intent = Intent(this, SyncAlarmReceiver::class.java)
    alarmIntent = PendingIntent.getBroadcast(
      this,
      0,
      intent,
      PendingIntent.FLAG_IMMUTABLE
    )
  }

  override fun onPause() {
    super.onPause()
    // Schedule first alarm in 15 minutes, then repeat every 15
    val interval = 15 * 60_000L
    alarmMgr.setInexactRepeating(
      AlarmManager.ELAPSED_REALTIME_WAKEUP,
      SystemClock.elapsedRealtime() + interval,
      interval,
      alarmIntent
    )
  }

  override fun onResume() {
    super.onResume()
    // Cancel alarms when the app returns to foreground
    alarmMgr.cancel(alarmIntent)
  }

  override fun onDestroy() {
    super.onDestroy()
    if (isFinishing) instance = null
  }
}