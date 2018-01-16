import React, { Component } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import { observer } from "mobx-react";

import notificationStore from "../../stores/NotificationStore";

@observer
export default class Notification extends Component {
  state = {
    displayAsUnread: false
  };

  componentDidMount() {
    this.markNotifAsRead();
  }

  componentDidUpdate() {
    this.markNotifAsRead();
  }

  markNotifAsRead() {
    const { notification } = this.props;
    if (notification.status === "unread" && !this.state.displayAsUnread) {
      debugger;
      //mark as read in db, but continue displaying new on screen
      this.setState({ displayAsUnread: true });
      notificationStore.markNotifAsRead(notification.id);
    }
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
              this.setState({ displayAsUnread: false });
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
          {notification.status === "unread" || this.state.displayAsUnread ? (
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
      </li>
    );
  }
}
