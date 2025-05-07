// controllers/accountRoleController.js

const AccountRole = require('../models/accountRoleModel');

exports.getAllRoles = (req, res) => {
  AccountRole.getAllRoles((err, roles) => {
    if (err) {
      console.error("Error fetching roles:", err);
      return res.status(500).json({ message: "Error fetching roles" });
    }
    res.json(roles);
  });
};

exports.getRoleById = (req, res) => {
  const { roleID } = req.params;

  AccountRole.getRoleById(roleID, (err, role) => {
    if (err) {
      console.error("Error fetching role by ID:", err);
      return res.status(500).json({ message: "Error fetching role" });
    }
    if (!role) return res.status(404).json({ message: "Role not found" });

    res.json(role);
  });
};