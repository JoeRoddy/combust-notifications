import firebase from "firebase/app";
import "firebase/database";

class NotificationDb {
  createNotification(notification, receiverUid, userId) {
    let defaultFields = {
      status: "unread"
    };
    notification.userId = receiverUid;
    notification.createdAt = new Date().getTime();
    notification.createdBy = userId;
    notification = Object.assign(defaultFields, notification);
    let db = firebase.database();
    let notificationRef = db.ref("notifications/notificationObjects").push();
    let notificationId = notificationRef.key;
    notificationRef.set(notification);
    db
      .ref(
        `notifications/notificationIdsByUser/${receiverUid}/${notificationId}`
      )
      .set(true);
  }

  updateNotification(notificationId, newData) {
    if (!notificationId || !newData) {
      return;
    }
    delete newData.id;
    firebase
      .database()
      .ref("notifications/notificationObjects")
      .child(notificationId)
      .update(newData);
  }

  deleteNotification(notificationId, userId) {
    let db = firebase.database();
    let idRef = db
      .ref("notifications/notificationIdsByUser")
      .child(userId)
      .child(notificationId);
    let notificationRef = db
      .ref("notifications/notificationObjects")
      .child(notificationId);
    idRef.set(null);
    notificationRef.set(null);
  }

  listenToNotificationsByUser(userId, callback) {
    _listenToNotificationIdsByUser(userId, (err, notificationId) => {
      if (err) return callback(err);
      this.listenToNotification(notificationId, callback);
    });
  }

  loadNotificationsOnceByUser(userId, callback) {
    _loadNotificationIdsByUser(userId, (err, notificationId) => {
      if (err) return callback(err);
      _loadNotificationOnce(notificationId, callback);
    });
  }

  listenToNotification(notificationId, callback) {
    firebase
      .database()
      .ref("notifications/notificationObjects")
      .child(notificationId)
      .on("value", snapshot => {
        let notification = snapshot.val();
        if (!notification) {
          return callback(
            "no userdata found for notification w/id: " + notificationId
          );
        }
        notification.id = notificationId;
        callback(null, notification);
      });
  }
}

const notificationDb = new NotificationDb();
export default notificationDb;

const _loadNotificationIdsByUser = function(userId, callback) {
  firebase
    .database()
    .ref("notifications/notificationIdsByUser")
    .child(userId)
    .once("child_added")
    .then(snap => {
      callback(null, snap.key);
    });
};

const _loadNotificationOnce = function(notificationId, callback) {
  firebase
    .database()
    .ref("notifications/notificationObjects")
    .child(notificationId)
    .once("value")
    .then(snapshot => {
      let notification = snapshot.val();
      if (!notification) {
        return callback(
          "no userdata found for notification w/id: " + notificationId
        );
      }
      notification.id = notificationId;
      callback(null, notification);
    });
};

const _listenToNotificationIdsByUser = function(userId, callback) {
  firebase
    .database()
    .ref("notifications/notificationIdsByUser")
    .child(userId)
    .on("child_added", snap => {
      callback(null, snap.key);
    });
};
