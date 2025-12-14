const StudyMaterial = require('../models/StudyMaterial');

const createMaterial = async (req, res) => {
  try {
    const { title, subject, content, userId } = req.body;

    console.log("yeah bitch");
    

    const material = await StudyMaterial.create({
      title,
      subject,
      content,
      user: userId, // later this will come from auth middleware
    });

    res.status(201).json(material);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Could not create material' });
  }
};

module.exports = { createMaterial };
