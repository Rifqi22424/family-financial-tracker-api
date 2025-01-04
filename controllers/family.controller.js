const prisma = require("../prisma/client");
const { BadRequestError, NotFoundError } = require("../utils/errors");

const createFamily = async (req, res, next) => {
  try {
    const { name, role } = req.body;
    const userId = req.userId;

    if (!name || !role) {
      throw new BadRequestError("Masukan nama keluarga dan role anda");
    }

    const existingFamily = await prisma.family.findUnique({
      where: { name },
    });

    if (existingFamily) {
      throw new BadRequestError("Nama keluarga sudah ada");
    }

    // Buat keluarga baru
    const family = await prisma.family.create({
      data: {
        name,
        familyHeadId: userId,
      },
    });

    // Buat member untuk user yang membuat keluarga
    const member = await prisma.member.create({
      data: {
        userId,
        familyId: family.id,
        role,
        isFamilyHead: true,
        canAddIncome: true,
        canViewFamilyReport: true,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        memberId: member.id,
      },
    });

    res.json({ data: { family, member } });
  } catch (error) {
    console.error("Error during family creation:", error);
    next(error);
  }
};

const joinFamily = async (req, res, next) => {
  try {
    const { familyCode, role } = req.body;
    const userId = req.userId;

    if (!familyCode) {
      throw new BadRequestError("Masukan kode keluarga");
    }

    const family = await prisma.family.findUnique({
      where: { familyCode },
    });

    if (!family) {
      throw new NotFoundError("Keluarga tidak ditemukan");
    }

    // Pastikan user belum menjadi member dalam keluarga ini
    const existingMember = await prisma.member.findFirst({
      where: { familyId: family.id, userId },
    });

    if (existingMember) {
      throw new BadRequestError("Anda sudah menjadi anggota keluarga ini");
    }

    // Buat member baru untuk user yang bergabung
    const member = await prisma.member.create({
      data: {
        userId,
        familyId: family.id,
        role: role || "ANAK",
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        memberId: member.id,
      },
    });

    res.json({ data: { family, member } });
  } catch (error) {
    console.error("Error during family joining:", error);
    next(error);
  }
};

const getFamilyMembers = async (req, res, next) => {
  try {
    const userId = req.userId;

    const member = await prisma.member.findUnique({
      where: { userId },
      select: { familyId: true },
    });

    if (!member) throw new NotFoundError("Member tidak ditemukan");

    const members = await prisma.member.findMany({
      where: { familyId: member.familyId },
      include: { user: true },
    });

    res.json({ data: members });
  } catch (error) {
    console.error("Error getting family members:", error);
    next(error);
  }
};

module.exports = { createFamily, joinFamily, getFamilyMembers };
