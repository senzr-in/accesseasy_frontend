import 'dart:ui';
import 'package:adaptive_theme/adaptive_theme.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_foreground_task/flutter_foreground_task.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:get/get.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:onesignal_flutter/onesignal_flutter.dart';
import 'package:provider/provider.dart';
import 'package:workmanager/workmanager.dart';

import 'package:accesseasy_shared/UI_components/log_helper.dart';
import 'package:accesseasy_shared/UI_components/navigation_state.dart';
import 'package:accesseasy_shared/checkConnectivity/connectivity.dart';
import 'package:accesseasy_shared/core/constants.dart';
import 'package:accesseasy_shared/core/theme.dart';
import 'package:accesseasy_shared/lang/language_controller.dart';
import 'package:accesseasy_shared/services/analytics_service.dart';
import 'package:accesseasy_shared/services/notification_service.dart';

import 'database/patrol_database.dart';
import 'firebase_options.dart';
import 'splash/splash_screen.dart';
import 'sync/connectivity_sync_service.dart';

// ─────────────────────────────────────────────────────────────
//  Guard Patrol — Entry Point
// ─────────────────────────────────────────────────────────────

final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
    FlutterLocalNotificationsPlugin();

void setupReleaseDebugging() {
  if (kReleaseMode) {
    debugPrint = (String? message, {int? wrapWidth}) {
      print('RELEASE: $message');
    };

    FlutterError.onError = (FlutterErrorDetails details) {
      print('RELEASE ERROR: ${details.exception}');
      print('RELEASE STACK: ${details.stack}');
      FlutterError.dumpErrorToConsole(details);
      AnalyticsService.logEvent('flutter_error', {
        'exception': details.exception.toString(),
      });
    };

    PlatformDispatcher.instance.onError = (error, stack) {
      print('ASYNC ERROR: $error');
      AnalyticsService.logEvent('async_error', {'error': error.toString()});
      return true;
    };
  }
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // ── Lock portrait orientation ──────────────────────────────
  try {
    await SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
    ]);

    SystemChrome.setSystemUIOverlayStyle(
      const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.dark,
      ),
    );
  } catch (e) {
    print('SystemChrome error (safe to ignore on desktop): $e');
  }

  // ── Hive (local cache) ────────────────────────────────────
  try {
    await Hive.initFlutter();
    await LogHelper.init();
    await LogHelper.write('=== GUARD PATROL STARTED ===');
    await LogHelper.write('Time: ${DateTime.now()}');
  } catch (e) {
    debugPrint('Hive/Log init error: $e');
  }

  // ── SQLite PatrolDatabase (offline storage) ───────────────
  try {
    await PatrolDatabase().db; // warm-up: creates tables if needed
    await LogHelper.write('✅ SQLite PatrolDatabase initialized');
  } catch (e) {
    await LogHelper.write('❌ SQLite init error: $e');
    debugPrint('SQLite init error: $e');
  }

  // ── WorkManager (background tasks for patrol) ────────────
  try {
    await Workmanager().initialize(callbackDispatcher, isInDebugMode: false);
    await LogHelper.write('✅ WorkManager initialized');
  } catch (e) {
    await LogHelper.write('❌ WorkManager init error: $e');
  }

  // ── Flutter Foreground Task (patrol location tracking) ────
  try {
    FlutterForegroundTask.init(
      androidNotificationOptions: AndroidNotificationOptions(
        channelId: 'guard_tracking_channel',
        channelName: 'Guard Patrol Tracking',
        channelDescription: 'Keeps patrol location tracking active',
        channelImportance: NotificationChannelImportance.LOW,
        priority: NotificationPriority.LOW,
      ),
      iosNotificationOptions: const IOSNotificationOptions(
        showNotification: true,
        playSound: false,
      ),
      foregroundTaskOptions: ForegroundTaskOptions(
        eventAction: ForegroundTaskEventAction.repeat(5000),
        autoRunOnBoot: true,
        autoRunOnMyPackageReplaced: true,
        allowWakeLock: true,
        allowWifiLock: true,
      ),
    );
  } catch (e) {
    print('❌ Foreground Task init error: $e');
  }

  // ── Local Notifications ───────────────────────────────────
  try {
    await NotificationService().init();
    await LogHelper.write('✅ Local Notifications initialized');
  } catch (e) {
    await LogHelper.write('❌ Local Notifications init error: $e');
  }

  // ── OneSignal Push Notifications ─────────────────────────
  try {
    if (kOneSignalAppIdPatrol.isNotEmpty &&
        !kOneSignalAppIdPatrol.contains('REPLACE')) {
      OneSignal.Debug.setLogLevel(OSLogLevel.verbose);
      OneSignal.initialize(kOneSignalAppIdPatrol);
      OneSignal.Notifications.requestPermission(true);
      await LogHelper.write('✅ OneSignal initialized');
    } else {
      await LogHelper.write('⚠️ OneSignal skipped: Placeholder App ID');
    }
  } catch (e) {
    await LogHelper.write('❌ OneSignal init error: $e');
  }

  // ── Firebase ──────────────────────────────────────────────
  try {
    if (Firebase.apps.isEmpty) {
      await Firebase.initializeApp(
        options: DefaultFirebaseOptions.currentPlatform,
      );
      await LogHelper.write('✅ Firebase initialized');
    }
  } catch (e) {
    await LogHelper.write('⚠️ Firebase init skipped: $e');
    print('Firebase init skipped (placeholder config): $e');
  }

  // ── GetX services ─────────────────────────────────────────
  await Get.putAsync(() async => await LanguageController().init());

  // ── Theme ─────────────────────────────────────────────────
  final savedThemeMode = await AdaptiveTheme.getThemeMode();
  updateGlobalColors(savedThemeMode == AdaptiveThemeMode.dark);

  setupReleaseDebugging();
  await LogHelper.write('✅ Patrol App ready — launching UI');

  // ── Start auto-sync service (drains offline queue on reconnect) ──
  ConnectivitySyncService().start();

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => NavigationState()),
      ],
      child: MyApp(savedThemeMode: savedThemeMode),
    ),
  );
}

// ── Background task dispatcher ────────────────────────────────
@pragma('vm:entry-point')
void callbackDispatcher() {
  Workmanager().executeTask((task, inputData) async {
    print('🔄 Guard patrol background task: $task');
    try {
      if (task == 'patrol_checkpoint_task') {
        return true;
      }
      return false;
    } catch (e) {
      print('❌ Background task error: $e');
      return false;
    }
  });
}

// ── Root widget ───────────────────────────────────────────────
class MyApp extends StatelessWidget {
  final AdaptiveThemeMode? savedThemeMode;

  const MyApp({super.key, this.savedThemeMode});

  @override
  Widget build(BuildContext context) {
    return AdaptiveTheme(
      light: buildLightTheme(),
      dark: buildDarkTheme(),
      initial: savedThemeMode ?? AdaptiveThemeMode.light,
      builder: (theme, darkTheme) => GetMaterialApp(
        title: kAppNamePatrol,
        debugShowCheckedModeBanner: false,
        theme: theme,
        darkTheme: darkTheme,
        navigatorObservers: [
          AnalyticsService.getObserver(),
        ],
        builder: (context, child) => InternetConnectivityWidget(
          child: child ?? const SizedBox(),
        ),
        localizationsDelegates: const [
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        supportedLocales: const [
          Locale('en', 'US'),
          Locale('ar', ''),
          Locale('hi', ''),
        ],
        home: const SplashScreen(),
      ),
    );
  }
}
