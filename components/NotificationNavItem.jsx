import React from "react";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";

import Notification from "./Notification";
import notificationStore from "../../../stores/NotificationStore";

const NotificationNavItem = props => {
  const notifications = notificationStore.notifications;
  let notifKeys = notifications ? Object.keys(notifications) : [];
  notifKeys = notifKeys.reverse().slice(0, 6); //render 6 most recent notifs

  return (
    <div className="NotificationNavItem uk-navbar-item">
      <span className="uk-inline">
        <Icon
          className={
            "uk-position-center uk-icon " +
            (notifKeys.length > 0 ? "uk-text-danger" : "uk-text")
          }
          type="bell"
        />
        {notifKeys.length > 0 && (
          <span className="uk-badge badge-danger uk-position-bottom-left">
            {notifKeys.length}
          </span>
        )}
      </span>
      <div uk-dropdown="mode: click">
        <ul className="uk-nav uk-dropdown-nav">
          <li className="uk-nav-header uk-margin-small-bottom">
            Notifications
          </li>
          <ul className="uk-list uk-list-divider">
            {notifKeys.map((notifId, i) => {
              const notif = notifications[notifId];
              if (!notif) return <span />;
              return <Notification key={i} notification={notif} />;
            })}
            {notifKeys.length <= 0 && <li>No new notifications</li>}
            <div className="uk-margin-small-top">
              <Link to="/notifications">View all notifications</Link>
            </div>
          </ul>
        </ul>
      </div>
    </div>
  );
};

export default observer(NotificationNavItem);

const Icon = props => {
  //eslint-disable-next-line
  return <a uk-icon={"icon: " + props.type} {...props} />;
};
