
// File: src-tauri/gen/android/app/src/main/java/com/jaka_mobile/app/SyncAlarmReceiver.kt
package com.jaka_mobile.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.view.View
import android.view.ViewGroup
import android.webkit.WebView

class SyncAlarmReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        MainActivity.instance?.runOnUiThread {
            // Walk the view hierarchy to find the WebView and invoke window.sync()
            MainActivity.instance
                ?.window
                ?.decorView
                ?.rootView
                ?.let { findWebView(it) }
                ?.evaluateJavascript("window.sync()", null)
        }
    }

    private fun findWebView(view: View): WebView? {
        if (view is WebView) return view
        if (view is ViewGroup) {
            for (i in 0 until view.childCount) {
                findWebView(view.getChildAt(i))?.let { return it }
            }
        }
        return null
    }
}
