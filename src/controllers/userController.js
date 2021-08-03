// Global Controllers

export const join = (req, res) => res.send("Join");
export const login = (req, res) => res.send("Log in");

// Public User Controllers

export const logout = (req, res) => res.send("Log out");
export const edit = (req, res) => res.send("Edit User");
export const remove = (req, res) => res.send("Remove User");

// Personal User Controllers

export const see = (req, res) => res.send("See User");
