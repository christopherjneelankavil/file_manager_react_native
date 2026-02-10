package com.usbotgapp

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.provider.DocumentsContract
import androidx.documentfile.provider.DocumentFile
import com.facebook.react.bridge.*
import java.util.ArrayList
import android.util.Log
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.io.InputStream
import java.io.OutputStream
import java.io.FileNotFoundException
import java.io.IOException

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

    @ReactMethod
    fun copyFiles(sourceUris: ReadableArray, targetFolderUri: String, promise: Promise) {
        val currentActivity = getCurrentActivity()
        if (currentActivity == null) {
            promise.reject("ACTIVITY_NOT_FOUND", "Activity doesn't exist")
            return
        }

        Thread {
            try {
                val targetUri = Uri.parse(targetFolderUri)
                val targetDir = DocumentFile.fromTreeUri(reactApplicationContext, targetUri)

                if (targetDir == null || !targetDir.exists() || !targetDir.isDirectory) {
                    promise.reject("INVALID_TARGET", "Target is not a valid directory")
                    return@Thread
                }

                var successCount = 0
                val totalFiles = sourceUris.size()

                for (i in 0 until totalFiles) {
                    val sourceUriString = sourceUris.getString(i)
                    if (sourceUriString == null) continue

                    val sourceUri = Uri.parse(sourceUriString)
                    // Get file name
                    var sourceFile: DocumentFile? = null
                    try {
                        sourceFile = DocumentFile.fromSingleUri(reactApplicationContext, sourceUri)
                    } catch (e: Exception) {
                        // Try tree uri if single uri fails, or just proceed
                    }
                    
                    val fileName = sourceFile?.name ?: "file_$i"
                    
                    // Emit progress
                    sendEvent("CopyProgress", WritableNativeMap().apply {
                        putInt("handled", i)
                        putInt("total", totalFiles)
                        putString("currentFile", fileName)
                    })

                    try {
                        val input = reactApplicationContext.contentResolver.openInputStream(sourceUri)
                        
                        // Create destination file
                        // Handle mime type - simpler to use */* or try to guess. 
                        // For copy, we might need to preserve the type. 
                        // DocumentFile.getType() can return null.
                        val mimeType = sourceFile?.type ?: "application/octet-stream"
                        val destFile = targetDir.createFile(mimeType, fileName)
                        
                        if (destFile != null && input != null) {
                            val output = reactApplicationContext.contentResolver.openOutputStream(destFile.uri)
                            if (output != null) {
                                input.use { ignored ->
                                    output.use { ignored ->
                                        copyStream(input, output)
                                    }
                                }
                                successCount++
                            } else {
                                input.close()
                                // Failed to open output
                            }
                        } else {
                            input?.close()
                            // Failed to create file
                        }

                    } catch (e: Exception) {
                        Log.e("UsbFileModule", "Error copying file $fileName", e)
                        // Continue to next file
                    }
                }

                promise.resolve(successCount)

            } catch (e: Exception) {
                promise.reject("COPY_ERROR", e.message)
            }
        }.start()
    }

    private fun copyStream(input: java.io.InputStream, output: java.io.OutputStream) {
        val buffer = ByteArray(8 * 1024)
        var bytesRead: Int
        while (input.read(buffer).also { bytesRead = it } != -1) {
            output.write(buffer, 0, bytesRead)
        }
    }

    private fun sendEvent(eventName: String, params: WritableMap?) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
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
