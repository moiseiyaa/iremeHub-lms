"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
// User schema
const UserSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    role: {
        type: String,
        enum: ['student', 'educator', 'admin'],
        default: 'student'
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    avatar: {
        public_id: String,
        url: {
            type: String,
            default: 'https://res.cloudinary.com/demo/image/upload/v1/sample/default-avatar.jpg'
        }
    },
    bio: {
        type: String,
        maxlength: [500, 'Bio cannot be more than 500 characters']
    }
});
// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
        return;
    }
    const salt = await bcryptjs_1.default.genSalt(10);
    this.password = await bcryptjs_1.default.hash(this.password, salt);
    next();
});
// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
    const secret = process.env.JWT_SECRET || 'devmode_secret_key_for_testing';
    // @ts-ignore - Ignoring TypeScript error for jwt.sign
    return jsonwebtoken_1.default.sign({ id: this._id }, secret, { expiresIn: process.env.JWT_EXPIRE || '30d' });
};
// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcryptjs_1.default.compare(enteredPassword, this.password);
};
// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function () {
    // Generate token
    const resetToken = crypto_1.default.randomBytes(20).toString('hex');
    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto_1.default
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    // Set expire
    this.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    return resetToken;
};
const User = mongoose_1.default.model('User', UserSchema);
exports.default = User;
