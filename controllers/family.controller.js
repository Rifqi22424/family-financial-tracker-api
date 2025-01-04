const prisma = require("../prisma/client");

const createFamily = async (req, res, next) => {
  try {
    const { name, role } = req.body;
    const userId = req.userId;

    if (!name) {
      throw new BadRequestError("Masukan nama keluarga");
    }

    const existingFamily = await prisma.family.findUnique({
      where: { name },
    });

    if (existingFamily) {
      throw new BadRequestError("Nama keluarga sudah ada");
    }

    const family = await prisma.family.create({
      data: {
        name,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        familyId: family.id,
        role: role || "AYAH",
      },
    });

    res.json({ data: family });
  } catch (error) {
    console.error("Error during family creation:", error);
    next(error);
  }
};

const joinFamily = async (req, res, next) => {
  try {
    const { familyCode } = req.body;
    const userId = req.userId;

    if (!familyCode) {
      throw new BadRequestError("Masukan ID keluarga");
    }

    const family = await prisma.family.findUnique({
      where: { familyCode },
    });

    if (!family) {
      throw new NotFoundError("Keluarga tidak ditemukan");
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        familyId: family.id,
      },
    });

    res.json({ data: user });
  } catch (error) {
    console.error("Error during family joining:", error);
    next(error);
  }
};

module.exports = { createFamily, joinFamily };
