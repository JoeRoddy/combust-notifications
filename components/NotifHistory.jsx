import React from "react";
import { observer } from "mobx-react";

import notifStore from "../../stores/notificationStore";
import Notification from "./Notification";

const NotifHistory = props => {
  const notifications = notifStore.allNotifications;

  return (
    <span className="NotifHistory">
      <ul className="uk-list uk-list-divider uk-padding">
        {notifications &&
          Object.keys(notifications)
            .reverse()
            .map((notifId, i) => {
              return (
                <Notification key={i} notification={notifications[notifId]} />
              );
            })}
      </ul>
    </span>
  );
};

export default observer(NotifHistory);
