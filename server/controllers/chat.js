import { agServer } from "../index.js";

import { user } from "../models/user.js";

const onlineUsersAndtheirSocketIDs = new Map([]);
const createPrivateRoom = (req, res) => {
  onlineUsersAndtheirSocketIDs.set(req.get("socketID"), req.user.username);
  res.json({ message: "succesfully connected" });
};

const addNewFriend = async (req, res) => {
  const friendname = req.query.name;

  const friend = await user.findOne({ username: friendname });
  if (!friend) {
    return res.status(400).json({ error: `No user named ${friendname} found` });
  }
  const friends = (await user.findById(req.user._id)).friends;

  if (friends.includes(friend._id)) {
    return res.json({ message: "Already a friend" });
  }

  await user.findByIdAndUpdate(req.user._id, {
    $push: { friends: friend._id },
  });
  return res.json({ message: "success" });
};

export { onlineUsersAndtheirSocketIDs, createPrivateRoom, addNewFriend };
