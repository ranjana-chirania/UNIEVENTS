const crypto = require("crypto");
const mongoose = require("mongoose");

const HASH_PREFIX = "scrypt";

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hashedBuffer = crypto.scryptSync(password, salt, 64);
  return `${HASH_PREFIX}$${salt}$${hashedBuffer.toString("hex")}`;
}

function isHashedPassword(password) {
  return typeof password === "string" && password.startsWith(`${HASH_PREFIX}$`);
}

function verifyHashedPassword(storedPassword, candidatePassword) {
  if (!isHashedPassword(storedPassword)) {
    return false;
  }

  const [, salt, originalHash] = storedPassword.split("$");
  const candidateHash = crypto.scryptSync(candidatePassword, salt, 64).toString("hex");

  return crypto.timingSafeEqual(
    Buffer.from(originalHash, "hex"),
    Buffer.from(candidateHash, "hex")
  );
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: /.+@.+\..+/,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      required: true,
      enum: ["faculty", "student"],
      default: "student",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", function hashUserPassword() {
  if (!this.isModified("password") || isHashedPassword(this.password)) {
    return;
  }

  this.password = hashPassword(this.password);
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  if (!this.password || !candidatePassword) {
    return false;
  }

  if (isHashedPassword(this.password)) {
    return verifyHashedPassword(this.password, candidatePassword);
  }

  return this.password === candidatePassword;
};

module.exports = mongoose.model("User", userSchema);
