import { observable, computed } from "mobx";

import notificationDb from "../db/notificationDb";
import userStore from "./userStore";

class NotificationStore {
  init() {
    userStore.onLogin(this.loadNotificationsForUser.bind(this));
  }

  notificationActionHandlers = new Map();
  onNotificationAction = (notifType, callback) => {
    let handlers = this.notificationActionHandlers.get(notifType) || [];
    handlers.push(callback);
    this.notificationActionHandlers.set(notifType, handlers);
  };

  @observable notificationMap = new Map();
  @observable numUnreadNotifs = 0;

  loadNotificationsForUser(user) {
    const userId = user.id;
    if (!userId) {
      return;
    }
    notificationDb.listenToNotificationsByUser(user.id, (err, notification) => {
      err ? console.log(err) : this.storeNotification(notification, userId);
    });
  }

  storeNotification(notification, userId) {
    this.notificationMap.set(notification.id, notification);
    this.determineUnreadNotifs();
  }

  determineUnreadNotifs() {
    let count = 0;
    this.notificationMap.forEach(notif => {
      count += notif.status === "unread" ? 1 : 0;
    });
    this.numUnreadNotifs = count;
  }

  @computed
  get notifications() {
    let notifs = {};
    this.notificationMap.forEach((notif, key) => {
      if (notif.status === "unread" || notif.actions) {
        notifs[key] = notif;
      }
    });
    return notifs;
  }

  @computed
  get allNotifications() {
    let allNotifs = {};
    this.notificationMap.forEach((n, id) => (allNotifs[id] = n));
    return allNotifs;
  }

  getNotificationById(notificationId) {
    let notification = this.notificationMap.get(notificationId);
    if (!notification) {
      notificationDb.listenToNotification(
        notificationId,
        (err, notification) => {
          err
            ? console.log(err)
            : this.notificationMap.set(notificationId, notification);
        }
      );
    }
    return notification;
  }

  createNotification(notification) {
    const userId = userStore.userId;
    if (!notification || !userId) {
      return;
    }
    notificationDb.createNotification(notification, userId);
  }

  deleteNotification(notificationId) {
    this.notificationMap.delete(notificationId);
    notificationDb.deleteNotification(notificationId, userStore.userId);
  }

  updateNotification(notification) {
    if (!notification) return;
    const notificationId = notification.id;
    delete notification.id;
    notificationDb.updateNotification(notificationId, notification);
  }

  markNotifAsClicked(notifId) {
    this.notificationMap.get(notifId).status = "read";
    this.updateNotification({
      id: notifId,
      status: "clicked"
    });
  }

  markNotifAsRead(notifId) {
    this.notificationMap.get(notifId).status = "read";
    this.updateNotification({
      id: notifId,
      status: "read"
    });
  }

  handleNotificationAction(notification, action) {
    const type = notification.type;
    const handlers = this.notificationActionHandlers.get(type) || [];
    handlers.forEach(handler => {
      handler(notification, action);
    });
    this.deleteNotification(notification.id);
  }
}

const notificationStore = new NotificationStore();
export default notificationStore;
