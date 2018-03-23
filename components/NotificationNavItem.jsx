import React, { Component } from "react";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";

import userStore from "../../stores/UserStore";
import notificationStore from "../../stores/NotificationStore";
import Notification from "./Notification";
import Icon from "../reusable/Icon";
import "./styles/Notifications.scss";

@observer
export default class NotificationNavItem extends Component {
  state = {
    isOpen: false
  };

  toggleDropDown = () => {
    this.setState({ isOpen: !this.state.isOpen });
  };

  render() {
    if (!userStore.userId) {
      return <span />;
    }

    const notifications = notificationStore.notifications;
    let notifKeys = notifications ? Object.keys(notifications) : [];
    let numNotifications = 0;
    notifKeys.forEach(id => {
      numNotifications += notifications[id].status === "unread" ? 1 : 0;
    });
    notifKeys = notifKeys.reverse().slice(0, 5); //render 5 most recent notifs

    return (
      <div className="NotificationNavItem uk-navbar-item">
        <span className="uk-inline">
          <Icon
            className={
              "uk-position-center uk-icon " +
              (numNotifications > 0 ? "uk-text-danger" : "uk-text")
            }
            onClick={this.toggleDropDown}
            type="bell"
          />
          {numNotifications > 0 && (
            <span className="uk-badge badge-danger uk-position-bottom-left">
              {numNotifications}
            </span>
          )}
        </span>
        {this.state.isOpen && (
          <div className="uk-card uk-card-default uk-padding-small dropdown">
            <ul className="uk-nav uk-dropdown-nav">
              <li className="uk-nav-header uk-margin-small-bottom">
                Notifications
              </li>
              <ul className="uk-list uk-list-divider">
                {notifKeys.map((notifId, i) => {
                  const notif = notifications[notifId];
                  if (!notif) return <span />;
                  return (
                    <Notification
                      key={i}
                      notification={notif}
                      toggleDropDown={this.toggleDropDown}
                    />
                  );
                })}
                <div className="uk-margin-small-top">
                  {notifKeys.length <= 0 ? (
                    <span className="uk-text-meta">No new notifications</span>
                  ) : (
                    <Link onClick={this.toggleDropDown} to="/notifications">
                      View all notifications
                    </Link>
                  )}
                </div>
              </ul>
            </ul>
          </div>
        )}
        {this.state.isOpen && (
          <span className="onClickOutside" onClick={this.toggleDropDown} />
        )}
      </div>
    );
  }
}
