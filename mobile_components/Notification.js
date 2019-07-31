import React, { Component } from "react";
import { observer } from "mobx-react";
import { View, Text, TouchableOpacity } from "react-native";
import { Card } from "react-native-elements";
import moment from "moment";

import notificationStore from "../../stores/notificationStore";
import nav from "../../helpers/navigatorHelper";
import { colors, textStyles } from "../../assets/styles/AppStyles";
import { Button } from "../reusable";

@observer
class Notification extends Component {
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
      //mark as read in db, but continue displaying new on screen
      this.setState({ displayAsUnread: true });
      notificationStore.markNotifAsRead(notification.id);
    }
  }

  handleNotificationLink = link => {
    // "/profile/uid" => navigate("Profile", {id: "uid"});
    let arr = link.substring(1).split("/");
    let path = arr[0];
    path = path.charAt(0).toUpperCase() + path.substring(1);
    nav.navigate(path, arr[1] && { id: arr[1] });
  };

  render() {
    const { notification } = this.props;
    const actions = notification.actions && Object.keys(notification.actions);
    const NotifCardJsx = (
      <NotifCard notification={notification} actions={actions} that={this} />
    );

    return !notification.link ? (
      NotifCardJsx
    ) : (
      <TouchableOpacity
        onPress={() => this.handleNotificationLink(notification.link)}
      >
        {NotifCardJsx}
      </TouchableOpacity>
    );
  }
}

const NotifCard = ({ that, notification, actions }) => (
  <Card>
    {notification.link ? (
      <Text
        className="uk-link-text"
        onClick={() => {
          notificationStore.markNotifAsClicked(notification.id);
          that.setState({ displayAsUnread: false });
          nav.navigate(notification.link);
        }}
      >
        {notification.body}
      </Text>
    ) : (
      <Text>{notification.body}</Text>
    )}
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Text style={textStyles.secondary}>
        {moment(notification.createdAt).fromNow()}
      </Text>
      {notification.status === "unread" || that.state.displayAsUnread ? (
        <Text style={{ color: colors.success }}>new</Text>
      ) : (
        <Text style={textStyles.secondary}>
          {notification.status === "clicked" ? "visited" : "seen"}
        </Text>
      )}
    </View>
    {actions && (
      <View>
        {actions.map((action, actionI) => {
          return (
            <Button
              title={action.toUpperCase()}
              key={actionI}
              className="uk-button uk-button-default uk-button-small"
              containerViewStyle={{ marginTop: 8 }}
              backgroundColor={
                actionI % 2 === 0 ? colors.primary : colors.secondary
              }
              onPress={() => {
                notificationStore.handleNotificationAction(
                  notification,
                  action
                );
              }}
            />
          );
        })}
      </View>
    )}
  </Card>
);

export default Notification;
