# Flutter Wrapper
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.**  { *; }
-keep class io.flutter.util.**  { *; }
-keep class io.flutter.view.**  { *; }
-keep class io.flutter.**  { *; }
-keep class io.flutter.plugins.**  { *; }

# Flutter Foreground Task
-keep class com.pravera.flutter_foreground_task.** { *; }

# WorkManager
-keep class androidx.work.** { *; }

# OneSignal
-keep class com.onesignal.** { *; }
-dontwarn com.onesignal.**

# Firebase
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**

# SQLite / SQLCipher
-keep class net.sqlcipher.** { *; }
-keep class com.tekartik.sqflite.** { *; }

# Audio Record
-keep class com.llfbandit.record.** { *; }

# Location / Geolocator
-keep class com.baseflow.geolocator.** { *; }
-keep class com.baseflow.permissionhandler.** { *; }

# Desugaring
-keep class java.time.** { *; }
-dontwarn java.time.**

# Google Play Core / Deferred Components
-dontwarn com.google.android.play.core.**
