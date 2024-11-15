import { user } from "../models/user.js";
import { setSocketUser } from "../commons/sessions.js";

const createPrivateRoom = async (req, res) => {
  await setSocketUser(req.get("socketID"), req.user.username);
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

const getFriends = async (req, res) => {
  const me = await user
    .findById(req.user._id)
    .populate("friends", "username");
  const list = (me?.friends ?? []).map((friend) => ({
    username: friend.username,
  }));
  return res.json({ list });
};

export {
  createPrivateRoom,
  addNewFriend,
  getFriends,
};
