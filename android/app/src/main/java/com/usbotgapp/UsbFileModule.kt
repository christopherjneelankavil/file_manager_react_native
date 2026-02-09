package com.usbotgapp

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.provider.DocumentsContract
import androidx.documentfile.provider.DocumentFile
import com.facebook.react.bridge.*
import java.util.ArrayList

class UsbFileModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    private var pickerPromise: Promise? = null

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName(): String {
        return "UsbFileModule"
    }

    @ReactMethod
    fun openDocumentTree(promise: Promise) {
        val currentActivity = getCurrentActivity()
        if (currentActivity == null) {
            promise.reject("ACTIVITY_NOT_FOUND", "Activity doesn't exist")
            return
        }

        pickerPromise = promise
        try {
            val intent = Intent(Intent.ACTION_OPEN_DOCUMENT_TREE)
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or
                    Intent.FLAG_GRANT_WRITE_URI_PERMISSION or
                    Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION)
            currentActivity.startActivityForResult(intent, REQUEST_CODE_OPEN_DOCUMENT_TREE)
        } catch (e: Exception) {
            pickerPromise?.reject("ERROR_OPENING_PICKER", e.message)
            pickerPromise = null
        }
    }

    @ReactMethod
    fun listFiles(uriString: String, promise: Promise) {
        try {
            val uri = Uri.parse(uriString)
            val directory = DocumentFile.fromTreeUri(reactApplicationContext, uri)

            if (directory == null || !directory.exists() || !directory.isDirectory) {
                promise.reject("INVALID_DIRECTORY", "The URI is not a valid directory")
                return
            }

            val fileList = WritableNativeArray()
            val files = directory.listFiles()

            for (file in files) {
                val fileMap = WritableNativeMap()
                fileMap.putString("name", file.name)
                fileMap.putString("uri", file.uri.toString())
                fileMap.putString("type", file.type)
                fileMap.putDouble("size", file.length().toDouble())
                fileMap.putDouble("lastModified", file.lastModified().toDouble())
                fileMap.putBoolean("isDirectory", file.isDirectory)
                fileList.pushMap(fileMap)
            }

            promise.resolve(fileList)
        } catch (e: Exception) {
            promise.reject("ERROR_LISTING_FILES", e.message)
        }
    }

    override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == REQUEST_CODE_OPEN_DOCUMENT_TREE) {
            if (pickerPromise != null) {
                if (resultCode == Activity.RESULT_OK && data != null) {
                    val uri = data.data
                    if (uri != null) {
                        try {
                            val takeFlags: Int = data.flags and
                                    (Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION)
                            reactApplicationContext.contentResolver.takePersistableUriPermission(uri, takeFlags)
                            pickerPromise?.resolve(uri.toString())
                        } catch (e: Exception) {
                            pickerPromise?.reject("PERMISSION_ERROR", "Failed to take persistable permission: " + e.message)
                        }
                    } else {
                        pickerPromise?.reject("URI_NULL", "Uri was null")
                    }
                } else {
                    pickerPromise?.reject("CANCELED", "User canceled")
                }
                pickerPromise = null
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        // Not needed for this
    }

    companion object {
        private const val REQUEST_CODE_OPEN_DOCUMENT_TREE = 42
    }
}
