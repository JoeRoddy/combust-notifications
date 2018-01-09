import React from "react";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import moment from "moment";

import notificationStore from "../../../stores/NotificationStore";

const Notification = ({ notification }) => {
  const actions = notification.actions && Object.keys(notification.actions);

  return (
    <li className="Notification">
      {notification.link ? (
        <a
          className="uk-link-text"
          onClick={e => notificationStore.markNotifAsRead(notification.id)}
        >
          <Link to={notification.link}>{notification.body}</Link>
        </a>
      ) : (
        <div>{notification.body}</div>
      )}
      {actions && (
        <div className="uk-margin-small-top">
          {actions.map((action, actionI) => {
            return (
              <button
                key={actionI}
                className="uk-button uk-button-default uk-button-small"
                onClick={e => {
                  notificationStore.handleNotificationAction(
                    notification,
                    action
                  );
                }}
              >
                {action}
              </button>
            );
          })}
        </div>
      )}
      <div className="uk-text-meta">
        {moment(notification.createdAt).fromNow()}
      </div>
    </li>
  );
};

export default observer(Notification);
