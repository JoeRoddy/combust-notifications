import React from "react";
import { View, ScrollView } from "react-native";
import { observer } from "mobx-react";

import notifStore from "../../stores/notificationStore";
import Header from "../reusable/Header";
import Notification from "./Notification";

const NotifHistory = props => {
  const notifications = notifStore.allNotifications;

  return (
    <View style={{ flex: 1 }}>
      <Header title="Notifications" />
      <ScrollView style={{ marginBottom: 10 }}>
        {notifications &&
          Object.keys(notifications)
            .reverse()
            .map((notifId, i) => {
              return (
                <Notification key={i} notification={notifications[notifId]} />
              );
            })}
      </ScrollView>
    </View>
  );
};

export default observer(NotifHistory);
