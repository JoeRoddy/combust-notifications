import { observable, computed } from "mobx";
import notificationService from "../service/NotificationService";

//DEPENDENCIES
import usersStore from "./UsersStore";

class NotificationStore {
  subscribeToEvents() {
    //must be inline functions, or use .bind(this)
    usersStore.onLogin(this.loadNotificationsForUser.bind(this));
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
    notificationService.listenToNotificationsByUser(
      user.id,
      (err, notification) => {
        err ? console.log(err) : this.storeNotification(notification, userId);
      }
    );
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
    return notifs;
  }

  @computed
  get allNotifications() {
    return this.notificationMap.toJS();
  }

  getNotificationById(notificationId) {
    let notification = this.notificationMap.get(notificationId);
    if (!notification) {
      notificationService.listenToNotification(
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
    const userId = usersStore.userId;
    if (!notification || !userId) {
      return;
    }
    notificationService.createNotification(notification, userId);
  }

  deleteNotification(notificationId) {
    this.notificationMap.delete(notificationId);
    notificationService.deleteNotification(notificationId, usersStore.userId);
  }

  updateNotification(notification) {
    if (!notification) return;
    const notificationId = notification.id;
    delete notification.id;
    notificationService.updateNotification(notificationId, notification);
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
