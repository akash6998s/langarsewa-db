const fs = require("fs");
const path = require("path");
const filePath = path.join(__dirname, "../data/members.json");
const imageFolder = path.join(__dirname, "../images");

const getAllMembers = (req, res) => {
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  res.json(data);
};

const updateMemberFieldsPost = (req, res) => {
  const {
    rollNumber,
    name = "",
    last_name = "",
    phone_no = "",
    address = "",
  } = req.body;

  if (!rollNumber) {
    return res.status(400).json({ message: "rollNumber is required" });
  }

  const rollNum = parseInt(rollNumber);
  const members = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const index = members.findIndex((m) => m.roll_no === rollNum);

  // Delete existing image file for this roll number (any extension)
  const existingFiles = fs.readdirSync(imageFolder);
  existingFiles.forEach((file) => {
    if (file.startsWith(`${rollNum}.`)) {
      fs.unlinkSync(path.join(imageFolder, file));
    }
  });

  // Save uploaded image if available
  let imageName = "";
  if (req.file) {
    const ext = path.extname(req.file.originalname);
    imageName = `${rollNum}${ext}`;
    const destPath = path.join(imageFolder, imageName);
    fs.renameSync(req.file.path, destPath);
  }

  if (index !== -1) {
    // Update existing member — always update with the received values
    members[index].name = name;
    members[index].last_name = last_name;
    members[index].phone_no = phone_no;
    members[index].address = address;
    if (req.file) {
      members[index].img = imageName;
    }

    fs.writeFileSync(filePath, JSON.stringify(members, null, 2), "utf-8");
    return res.json({
      message: "Member updated",
      updatedMember: members[index],
    });
  } else {
    // Add new member
    const newMember = {
      roll_no: rollNum,
      name,
      last_name,
      phone_no,
      address,
      img: imageName || `${rollNum}.png`,
      email: "",
      isAdmin: false,
      isSuperAdmin: false,
    };

    members.push(newMember);
    fs.writeFileSync(filePath, JSON.stringify(members, null, 2), "utf-8");
    return res.status(201).json({ message: "New member added", newMember });
  }
};


const deleteMemberDetailsPost = (req, res) => {
  const { rollNumber } = req.body;

  if (!rollNumber) {
    return res.status(400).json({ message: "rollNumber is required" });
  }

  const members = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const index = members.findIndex((m) => m.roll_no === rollNumber);

  if (index === -1) {
    return res.status(404).json({ message: "No member found with rollNumber" });
  }

  members[index].name = "";
  members[index].last_name = "";
  members[index].phone_no = "";
  members[index].address = "";

  fs.writeFileSync(filePath, JSON.stringify(members, null, 2), "utf-8");

  res.json({
    message: `Member details cleared for roll_no ${rollNumber}`,
    updatedMember: members[index],
  });
};

module.exports = {
  getAllMembers,
  updateMemberFieldsPost,
  deleteMemberDetailsPost,
};
