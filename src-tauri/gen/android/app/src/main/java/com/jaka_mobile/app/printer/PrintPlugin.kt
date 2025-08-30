package com.jaka_mobile.app.printer

import android.app.Activity
import android.content.Context
import android.print.PrintManager
import android.print.PrintAttributes
import android.webkit.WebView
import app.tauri.annotation.Command
import app.tauri.annotation.TauriPlugin
import app.tauri.plugin.Plugin
import app.tauri.plugin.Invoke

@TauriPlugin
class PrintPlugin(private val activity: Activity) : Plugin(activity) {
  private lateinit var webView: WebView

  // Tauri gives us the WebView instance here:
  override fun load(webView: WebView) {
    this.webView = webView
  }

  @Command
  fun printPage(invoke: Invoke) {
    activity.runOnUiThread {
      val pm = activity.getSystemService(Context.PRINT_SERVICE) as PrintManager
      val jobName = "${activity.applicationInfo.loadLabel(activity.packageManager)} Document"
      val adapter = webView.createPrintDocumentAdapter(jobName)
      pm.print(jobName, adapter, PrintAttributes.Builder().build())
    }
  }
}