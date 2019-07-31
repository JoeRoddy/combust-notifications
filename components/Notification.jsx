import React, { Component } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import { observer } from "mobx-react";

import notificationStore from "../../stores/notificationStore";

@observer
class Notification extends Component {
  state = {
    shouldMarkAsRead: true
  };

  componentWillUnmount() {
    this.state.shouldMarkAsRead && this.markNotifAsRead();
  }

  markNotifAsRead() {
    const { notification } = this.props;
    notificationStore.markNotifAsRead(notification.id);
  }

  render() {
    const { notification, toggleDropDown } = this.props;
    const actions = notification.actions && Object.keys(notification.actions);

    return (
      <li className="Notification">
        {notification.link ? (
          <span
            className="uk-link-text"
            onClick={e => {
              notificationStore.markNotifAsClicked(notification.id);
              toggleDropDown && toggleDropDown();
            }}
          >
            <Link to={notification.link}>{notification.body}</Link>
          </span>
        ) : (
          <div>{notification.body}</div>
        )}
        <div className="uk-text-meta uk-flex uk-flex-between">
          <span>{moment(notification.createdAt).fromNow()}</span>
          {notification.status === "unread" ? (
            <span className="uk-text-primary">new</span>
          ) : (
            <span>
              {notification.status === "clicked" ? "visited" : "seen"}
            </span>
          )}
        </div>
        {actions && (
          <div className="uk-margin-small-top">
            {actions.map((action, actionI) => {
              return (
                <button
                  key={actionI}
                  className="uk-button uk-button-default uk-button-small"
                  onClick={e => {
                    this.setState({ shouldMarkAsRead: false }, () => {
                      notificationStore.handleNotificationAction(
                        notification,
                        action
                      );
                    });
                  }}
                >
                  {action}
                </button>
              );
            })}
          </div>
        )}
      </li>
    );
  }
}

export default Notification;
