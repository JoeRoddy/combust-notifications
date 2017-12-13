import firebase from "firebase";

class UsersService {
  createUser(user, callback) {
    if (!user || !user.email || !user.password) {
      throw new Error(
        `UserService.create(): requires a user object with an email && password`
      );
    }

    firebase
      .auth()
      .createUserWithEmailAndPassword(user.email, user.password)
      .then(res => {
        let userObj = this.generateUserObject(user.email);
        this.saveToUsersCollection(res.uid, userObj);
      })
      .catch(error => {
        let errorMessage = error.message;
        callback(errorMessage);
        console.log(errorMessage);
      });
  }

  saveToUsersCollection(uid, user) {
    if (!uid || !user) {
      return;
    }
    firebase
      .database()
      .ref("/users/")
      .child(uid)
      .set(user);
  }

  generateUserObject(email) {
    return {
      public: {
        //globally readable, user-writeable
        email: email,
        online: true,
        iconUrl: this.getRandomProfilePic()
      },
      private: {
        //user-only-readable, user-writeable
        conversations: {},
        friends: {},
        notificationToken: null,
        notificationsEnabled: true
      },
      server: {
        //user-only-readable, server-only writeable
        walletBalance: 0
      }
    };
  }

  getHttpToken() {
    return firebase.auth().currentUser.getToken(/* forceRefresh */ true);
  }

  listenForUserChanges(callback) {
    const that = this;
    let db = firebase.database();
    firebase.auth().onAuthStateChanged(userAuth => {
      console.log("authStateChange, user:", userAuth);
      if (userAuth) {
        let userRef = db.ref("users/" + userAuth.uid);
        userRef.once("value").then(snap => {
          let userData = snap.val();
          if (!userData) {
            let userObj = this.generateUserObject(userAuth.email);
            this.saveToUsersCollection(userAuth.uid, userObj);
            userObj.id = userAuth.uid;
            return callback(null, userObj);
          } else {
            userRef.child("public").update({ lastOnline: new Date() });
            that.listenToUser(userAuth.uid, (err, data) => {
              data.id = userAuth.uid;
              callback(null, data);
            });
          }
        });
      } else {
        callback(null, null);
      }
    });
  }

  listenToUser(uid, callback) {
    firebase
      .database()
      .ref("users")
      .child(uid)
      .on("value", snap => {
        let user = snap.val();
        if (!user) {
          callback("No user data found");
        } else {
          user.id = uid;
        }
        callback(null, user);
      });
    this.monitorOnlineStatus();
  }

  listenToPublicUserData(userId, callback) {
    firebase
      .database()
      .ref("users/" + userId + "/public")
      .on("value", snapshot => {
        let friend = snapshot.val();
        if (!friend) {
          callback(null, null);
        }
        friend.id = userId;
        callback(null, friend);
      });
  }

  login(user, callback) {
    let auth = firebase.auth();
    let db = firebase.database();
    auth.signInWithEmailAndPassword(user.email, user.password).then(
      res => {
        callback(null, res);
        db
          .ref("users")
          .child(res.uid)
          .child("public")
          .update({
            online: true
          });
      },
      err => {
        callback(err);
      }
    );
    this.monitorOnlineStatus();
  }

  logout(user) {
    if (!user) {
      throw new Error("No user provided to logout");
    }

    let auth = firebase.auth();
    user.online = false;
    this.updateFields(user, ["online"], "public");
    auth.signOut();
  }

  monitorOnlineStatus() {
    const currentUser = firebase.auth().currentUser;
    if (!currentUser || !currentUser.uid) {
      return;
    }
    const uid = currentUser.uid;
    let amOnline = firebase.database().ref("/.info/connected");
    let userRef = firebase.database().ref("/users/" + uid + "/public/online");
    amOnline.on("value", snapshot => {
      if (snapshot.val()) {
        userRef.onDisconnect().set(false);
        userRef.set(true);
      }
    });
    userRef.on("value", snapshot => {
      window.setTimeout(() => {
        userRef.set(true);
      }, 2000);
    });
  }

  updateUser(user) {
    let db = firebase.database();
    db
      .ref("users/")
      .child(user.id)
      .update(user);
  }

  updateFields(user, fields, privacy) {
    let currentUser = firebase.auth().currentUser;
    if (!fields || !user || !currentUser || !privacy) {
      return;
    }
    let db = firebase.database();
    let ref = db.ref("users/" + currentUser.uid + "/" + privacy);

    ref.once(
      "value",
      snapshot => {
        let currentUserOnDb = snapshot.val();
        if (!currentUserOnDb) {
          return;
        }
        fields.forEach(field => {
          currentUserOnDb[field] = user[field];
        });
        ref.update(currentUserOnDb);
      },
      errorObject => {
        console.log(
          "The read in userService.updateFields() failed: " + errorObject.code
        );
      }
    );
  }

  getRandomProfilePic() {
    const profilePics = [
      "https://firebasestorage.googleapis.com/v0/b/textable-92f65.appspot.com/o/dog1.jpeg?alt=media&token=320085e5-59a5-445e-a146-5411980e7a56",
      "https://firebasestorage.googleapis.com/v0/b/textable-92f65.appspot.com/o/dog2.jpeg?alt=media&token=54717b55-bbad-459e-8fb4-2dbf9caf76dd",
      "https://firebasestorage.googleapis.com/v0/b/textable-92f65.appspot.com/o/dog3.jpeg?alt=media&token=283db004-83d8-4857-84b4-7b0a61dc172f",
      "https://firebasestorage.googleapis.com/v0/b/textable-92f65.appspot.com/o/dog5.jpeg?alt=media&token=f3ce9b3d-34de-4124-aed2-67354220b9aa",
      "https://firebasestorage.googleapis.com/v0/b/textable-92f65.appspot.com/o/dog4.jpeg?alt=media&token=c7504834-c5e3-4081-8177-f013d8683f8d"
    ];

    return profilePics[Math.floor(Math.random() * profilePics.length)];
  }
}

const usersService = new UsersService();
export default usersService;
