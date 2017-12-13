import { observable, computed } from "mobx";
import usersService from "../service/UsersService";
//DEPENDENCIES - none

class UsersStore {
  @observable userId = null;
  @observable usersMap = new Map();
  @observable privateInfo = null; //only reads/writes by user
  @observable serverInfo = null; //only user reads, only server writes

  onLoginTriggers = [];
  onLogoutTriggers = [];
  onLogin = func => {
    this.onLoginTriggers.push(func);
  };
  onLogout = func => {
    this.onLogoutTriggers.push(func);
  };

  listenToUser() {
    usersService.listenForUserChanges((err, user) => {
      if (err) {
        debugger;
        return;
      } else if (!user) {
        if (this.userId) {
          this.onUserLogout();
        }
        this.userId = null;
      } else {
        if (!this.userId) {
          this.onUserEstablished(user);
        }
        this.userId = user.id;
        this.usersMap.set(user.id, user.public);
        this.privateInfo = user.private;
        this.serverInfo = user.server;
      }
    });
  }

  @computed
  get user() {
    return this.usersMap.get(this.userId);
  }

  @computed
  get fullUser() {
    return {
      id: this.userId,
      public: this.user,
      private: this.privateInfo,
      server: this.serverInfo
    };
  }

  getUserById(userId) {
    const user = this.usersMap.get(userId);
    if (!user) {
      this.listenToPublicUserData(userId);
    }
    return user;
  }

  listenToPublicUserData(userId) {
    usersService.listenToPublicUserData(userId, (err, user) => {
      this.usersMap.set(userId, user);
    });
  }

  saveUserLocally(userId, user) {
    if (!user) {
      return;
    }
    user.id = userId;
    this.usersMap.set(userId, user);
  }

  logout() {
    usersService.logout(this.user);
  }

  createUser(user, callback) {
    usersService.createUser(user, callback);
  }

  login(user, callback) {
    usersService.login(user, callback);
  }

  onUserEstablished(user) {
    //module hook
    try {
      // friendStore.getFriendsForUser(user);
      this.onLoginTriggers.forEach(event => {
        event(user);
      });
    } catch (err) {
      console.log(err);
    }
  }

  searchFromLocalUsersByField(field, query) {
    let results = [];
    this.usersMap.entries().forEach(([uid, user]) => {
      if (
        user &&
        typeof user[field] === "string" &&
        user[field].toUpperCase().includes(query.toUpperCase())
      ) {
        results.push(user);
      }
    });
    return results;
  }

  onUserLogout() {
    //module hook
    const user = this.fullUser;

    try {
      this.onLogoutTriggers.forEach(event => {
        event(user);
      });
    } catch (err) {
      debugger;
    }
  }
}

const usersStore = new UsersStore();
export default usersStore;
