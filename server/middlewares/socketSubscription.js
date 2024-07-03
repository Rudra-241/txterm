import { checkAuth } from "./authentication.js";

const handleSocketSubscription = async (middlewareStream) => {
  for await (let action of middlewareStream) {
    if (action.type === action.SUBSCRIBE) {
      const realUsername = (await checkAuth(action.data)).username;
      if (action.channel !== realUsername) {
        console.log(realUsername);
        action.block("Unauthorized");
        action.socket.disconnect(3201, "Bad User");
      } else {
        action.allow();
      }
    } else {
      action.allow();
    }
  }
};

export { handleSocketSubscription };
