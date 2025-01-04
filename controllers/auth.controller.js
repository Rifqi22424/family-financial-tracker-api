const prisma = require("../prisma/client");

const bcrypt = require("bcrypt");
const { generateToken } = require("../middlewares/jwt.middleware");
const { validateEmail, validatePassword } = require("../utils/validators");
const {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} = require("../utils/errors");

const saltRounds = 10;

const registerUser = async (req, res, next) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password || !confirmPassword) {
      throw new BadRequestError(
        "Masukan username, email, password, dan konfirmasi password"
      );
    }

    validateEmail(email);
    // validatePassword(password);

    if (password !== confirmPassword) {
      throw new BadRequestError("Password dan konfirmasi password tidak cocok");
    }

    const [existingUserByEmail, existingUserByUsername] = await Promise.all([
      prisma.user.findUnique({ where: { email } }),
      prisma.user.findUnique({ where: { username } }),
    ]);

    if (existingUserByEmail && !existingUserByEmail.isVerified) {
      const verificationCode = generateVerificationCode();
      await prisma.user.update({
        where: { email },
        data: {
          username,
          password: await bcrypt.hash(password, saltRounds),
          verificationCode,
        },
      });
      sendVerificationEmail(email, verificationCode);
      return res.json({
        message:
          "Verifikasi email telah dikirim ulang. Silakan cek email Anda.",
      });
    }

    if (existingUserByEmail || existingUserByUsername) {
      throw new BadRequestError(
        "Email atau username sudah terdaftar dan terverifikasi"
      );
    }

    const verificationCode = generateVerificationCode();
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        verificationCode,
      },
    });

    sendVerificationEmail(email, verificationCode);

    res.json({
      message: "Pendaftaran berhasil. Silakan cek email Anda untuk verifikasi.",
    });
  } catch (error) {
    console.error("Error during user registration:", error);
    next(error);
  }
};

const verifyUser = async (req, res, next) => {
  try {
    const { email, verificationCode } = req.body;

    if (!email || !verificationCode) {
      throw new BadRequestError("Email dan kode verifikasi wajib diisi");
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundError("User tidak ditemukan");
    }

    if (user.verificationCode !== verificationCode) {
      throw new UnauthorizedError("Kode verifikasi tidak valid");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationCode: null,
      },
    });

    res.json({ message: "User berhasil diverifikasi." });
  } catch (error) {
    console.error("Error during user verification:", error);
    next(error);
  }
};

const resendVerificationCode = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new BadRequestError("Masukan email");
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundError("User tidak ditemukan");
    }

    if (user.isVerified) {
      throw new BadRequestError("User sudah terverifikasi");
    }

    const newVerificationCode = generateVerificationCode();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode: newVerificationCode,
      },
    });

    sendVerificationEmail(email, newVerificationCode);

    res.json({
      message: "Kode verifikasi telah dikirim ulang.",
    });
  } catch (error) {
    console.error("Error during resend verification code:", error);
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      throw new BadRequestError("Masukan email atau username dan password");
    }

    let user = await prisma.user.findUnique({
      where: { email: identifier },
    });

    if (!user) {
      user = await prisma.user.findUnique({
        where: { username: identifier },
      });
    }

    if (!user) {
      throw new UnauthorizedError("Identifier atau password tidak valid");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedError("Identifier atau password tidak valid");
    }

    if (!user.isVerified) {
      throw new UnauthorizedError("User belum diverifikasi");
    }

    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error("Error during user login:", error);
    next(error);
  }
};

const generateVerificationCode = () => {
  const min = 100000;
  const max = 999999;
  const randomCode = Math.floor(Math.random() * (max - min + 1)) + min;

  return randomCode.toString();
};

const sendVerificationEmail = async (email, verificationCode) => {
  const nodemailer = require("nodemailer");

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "ayahhebatmangcoding@gmail.com",
      pass: "citl rjsa irmx tpcx",
    },
  });

  await new Promise((resolve, reject) => {
    transporter.verify(function (error, success) {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        console.log("Server is ready to take our messages");
        resolve(success);
      }
    });
  });

  const mailOptions = {
    from: "ayahhebatmangcoding@gmail.com",
    to: email,
    subject: "Verifikasi Akun",
    text: `Kode verifikasi Anda: ${verificationCode}`,
  };

  await new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        reject(err);
      } else {
        resolve(info);
      }
    });
  });
};

const changePassword = async (req, res, next) => {
  try {
    const { identifier, oldPassword, newPassword, confirmNewPassword } =
      req.body;

    if (!identifier || !oldPassword || !newPassword || !confirmNewPassword) {
      throw new BadRequestError(
        "Masukan identifier, password lama, password baru, dan konfirmasi password baru"
      );
    }

    let user = await prisma.user.findUnique({
      where: { email: identifier },
    });

    if (!user) {
      user = await prisma.user.findUnique({
        where: { username: identifier },
      });
    }

    if (!user) {
      throw new NotFoundError("User tidak ditemukan");
    }

    const passwordMatch = await bcrypt.compare(oldPassword, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedError("Password lama tidak valid");
    }

    if (newPassword !== confirmNewPassword) {
      throw new BadRequestError(
        "Password baru dan konfirmasi password baru tidak cocok"
      );
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedNewPassword,
      },
    });

    res.json({ message: "Password berhasil diubah" });
  } catch (error) {
    console.error("Error during password change:", error);
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyUser,
  resendVerificationCode,
  changePassword,
  generateVerificationCode,
  sendVerificationEmail,
};
