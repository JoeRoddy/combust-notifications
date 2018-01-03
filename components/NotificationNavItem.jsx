import React, { Component } from "react";
import { observer } from "mobx-react";

import notificationStore from "../../../stores/NotificationStore";

@observer
export default class NotificationNavItem extends Component {
  state = {};

  render() {
    const notifications = notificationStore.notifications;
    const notifKeys = notifications ? Object.keys(notifications) : [];

    return (
      <div className="NotificationNavItem uk-navbar-item">
        <a
          href="#"
          data-uk-icon="bell"
          className={
            "uk-icon " + (notifKeys.length > 0 ? "uk-text-danger" : "uk-text")
          }
        />
        <div uk-dropdown="mode: click">
          <ul className="uk-nav uk-dropdown-nav">
            <li className="uk-nav-header">Notifications</li>
            {notifKeys.reverse().map((notifId, i) => {
              const notif = notifications[notifId];
              if (!notif) return;
              const actions = notif.actions && Object.keys(notif.actions);
              return (
                <li key={i}>
                  <div>{notif.body}</div>
                  <div className="uk-margin-small-top">
                    {actions &&
                      actions.map((action, actionI) => {
                        return (
                          <button
                            key={actionI}
                            className="uk-button uk-button-default uk-button-small"
                            onClick={e => {
                              notificationStore.handleNotificationAction(
                                notif,
                                action
                              );
                            }}
                          >
                            {action}
                          </button>
                        );
                      })}
                  </div>
                  {i < notifKeys.length - 1 && (
                    <hr className="uk-divider-small" />
                  )}
                </li>
              );
            })}
            {notifKeys.length <= 0 && <li>No new notifications</li>}
          </ul>
        </div>
      </div>
    );
  }
}
