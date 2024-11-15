import { Channel } from "../models/channels.js";
import { logger } from "../commons/logger.js";

const getAllPublicChannels = async (req, res) => {
  try {
    const publicChannels = await Channel.find({ isPublic: true });
    return res.json({ list: publicChannels });
  } catch (error) {
    logger.error("Failed to fetch public channels", error);
    return res.json({ message: "Error fetching public channels" });
  }
};

const addNewChannel = async (req, res) => {
  const name = req.query.name;
  const description = req.query.desc;
  const isPublic = true;
  try {
    const newChannel = new Channel({
      name,
      description,
      isPublic,
    });

    await newChannel.save();
    return res.json({ message: "success" });
  } catch (error) {
    logger.error("Failed to add channel", error);
    return res.json({ message: "some error occurred" });
  }
};

export { getAllPublicChannels, addNewChannel };
