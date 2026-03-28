const Pack = require("../models/Pack");

// ✅ MUST MATCH NAME
const getPacks = async (req, res) => {
  try {
    const packs = await Pack.find();
    res.json(packs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createPack = async (req, res) => {
  try {
    const pack = new Pack(req.body);
    const saved = await pack.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ EXPORT CORRECTLY
module.exports = { getPacks, createPack };