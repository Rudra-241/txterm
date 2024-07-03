import { checkAuth } from "./authentication.js";

const handleSocketSubscription = async (middlewareStream) => {
  for await (let action of middlewareStream) {
    if (action.type === action.SUBSCRIBE) {
      await handleSubscriptionAction(action);
    } else {
      action.allow();
    }
  }
};

const handleSubscriptionAction = async (action) => {
  switch (action.data.type) {
    case "self":
      await handleSelfSubscription(action);
      break;
    case "channel":
      handleChannelSubscription(action);
      break;
    default:
      action.block("Invalid subscription type");
  }
};

const handleSelfSubscription = async (action) => {
  const realUsername = (await checkAuth(action.data.sessionID)).username;
  if (action.channel !== realUsername) {
    console.log(realUsername);
    action.block("Unauthorized");
    action.socket.disconnect(3201, "Bad User");
  } else {
    action.allow();
  }
};

const handleChannelSubscription = (action) => {
  if (isPublicChannel(action.channel)) {
    action.allow();
  } else {
    action.block("Not a public channel");
  }
};

const isPublicChannel = (channel) => {
  // Testing
  return true;
};

export { handleSocketSubscription };
