const StudyMaterial = require("../models/StudyMaterial");

const getMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    const material = await StudyMaterial.findById(id);

    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    res.status(200).json(material);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Could not fetch material" });
  }
};

module.exports = { getMaterial };
