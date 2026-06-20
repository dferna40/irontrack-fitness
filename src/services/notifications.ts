import Constants, { ExecutionEnvironment } from "expo-constants";

type ExpoNotificationsModule = typeof import("expo-notifications");

let notificationsModulePromise: Promise<ExpoNotificationsModule | null> | null = null;
let notificationHandlerConfigured = false;

function isExpoGo() {
  return Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
}

async function getNotificationsModule() {
  if (isExpoGo()) {
    return null;
  }

  if (!notificationsModulePromise) {
    notificationsModulePromise = import("expo-notifications");
  }

  return notificationsModulePromise;
}

async function ensureNotificationHandler() {
  const Notifications = await getNotificationsModule();

  if (!Notifications || notificationHandlerConfigured) {
    return Notifications;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  notificationHandlerConfigured = true;

  return Notifications;
}

export async function requestLocalNotificationPermissions() {
  const Notifications = await ensureNotificationHandler();

  if (!Notifications) {
    return {
      supported: false,
      granted: false,
    };
  }

  const permissions = await Notifications.requestPermissionsAsync();

  return {
    supported: true,
    granted: permissions.granted,
  };
}

export async function scheduleLocalNotification(options: {
  title: string;
  body: string;
  soundEnabled?: boolean;
}) {
  const Notifications = await ensureNotificationHandler();

  if (!Notifications) {
    return false;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: options.title,
      body: options.body,
      sound: options.soundEnabled ? "default" : false,
    },
    trigger: null,
  });

  return true;
}
