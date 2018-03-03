import { observable, computed } from "mobx";

import notificationDb from "../db/NotificationDb";
import userStore from "./UserStore";

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
  }

  @computed
  get notifications() {
    const unfiltered = this.notificationMap.toJS();
    let notifs = {};
    for (let key in unfiltered) {
      const notif = unfiltered[key];
      if (notif.status === "unread" || notif.actions) {
        notifs[key] = notif;
      }
    }
    return unfiltered;
  }

  @computed
  get allNotifications() {
    return this.notificationMap.toJS();
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
