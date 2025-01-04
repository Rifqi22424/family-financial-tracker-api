const prisma = require("../prisma/client");
const {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} = require("../utils/errors");

const getBalance = async (req, res, next) => {
  try {
    const userId = req.userId;
    const member = await prisma.member.findUnique({
      where: { userId },
      select: { balance: true },
    });

    if (!member) throw new NotFoundError("Member tidak ditemukan");

    res.json({ balance: member.balance });
  } catch (error) {
    console.error("Error getting balance:", error);
    next(error);
  }
};

const getMonthlyTransactions = async (req, res, next) => {
  try {
    const { transactionType } = req.query; // INCOME atau EXPENSE
    const userId = req.userId;

    const currentDate = new Date();
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const lastDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    const transactions = await prisma.transaction.findMany({
      where: {
        member: { userId },
        transactionType,
        transactionAt: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
      orderBy: { transactionAt: "desc" },
    });

    res.json({ data: transactions });
  } catch (error) {
    console.error("Error getting monthly transactions:", error);
    next(error);
  }
};

const getRecentTransactions = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10 } = req.query;

    const transactions = await prisma.transaction.findMany({
      where: { member: { userId } },
      orderBy: { transactionAt: "desc" },
      skip: (page - 1) * limit,
      take: parseInt(limit),
    });

    res.json({ data: transactions });
  } catch (error) {
    console.error("Error getting recent transactions:", error);
    next(error);
  }
};

const createTransaction = async (req, res, next) => {
  try {
    const { amount, transactionType, description, category, transactionAt } =
      req.body;
    const userId = req.userId;

    if (
      !amount ||
      !transactionType ||
      !description ||
      !category ||
      !transactionAt
    ) {
      throw new BadRequestError("Semua data wajib diisi");
    }

    const member = await prisma.member.findUnique({ where: { userId } });
    if (!member) throw new NotFoundError("Member tidak ditemukan");

    if (transactionType === "INCOME" && !member.canAddIncome) {
      throw new ForbiddenError(
        "Anda tidak memiliki izin untuk menambah pemasukan"
      );
    }

    const adjustment = transactionType === "INCOME" ? amount : -amount;

    const transaction = await prisma.transaction.create({
      data: {
        familyId: member.familyId,
        memberId: member.id,
        amount,
        transactionType,
        description,
        category,
        transactionAt: new Date(transactionAt),
      },
    });

    await prisma.member.update({
      where: { id: member.id },
      data: { balance: { increment: adjustment } },
    });

    res.json({ data: transaction });
  } catch (error) {
    console.error("Error creating transaction:", error);
    next(error);
  }
};

const createTransfer = async (req, res, next) => {
  try {
    const { recipientId, amount, description } = req.body;
    const userId = req.userId;

    if (!recipientId || !amount || !description) {
      throw new BadRequestError("Semua data wajib diisi");
    }

    const sender = await prisma.member.findUnique({ where: { userId } });
    const recipient = await prisma.member.findUnique({
      where: { id: recipientId },
    });

    if (!sender || !recipient)
      throw new NotFoundError("Pengirim atau penerima tidak ditemukan");
    if (sender.familyId !== recipient.familyId) {
      throw new ForbiddenError(
        "Transfer hanya diperbolehkan antar anggota keluarga"
      );
    }
    if (sender.balance < amount) {
      throw new ForbiddenError("Saldo tidak mencukupi untuk transfer");
    }

    await prisma.$transaction([
      prisma.member.update({
        where: { id: sender.id },
        data: { balance: { decrement: amount } },
      }),
      prisma.member.update({
        where: { id: recipient.id },
        data: { balance: { increment: amount } },
      }),
      prisma.transaction.create({
        data: {
          familyId: sender.familyId,
          memberId: sender.id,
          amount: -amount,
          transactionType: "EXPENSE",
          description: `Transfer ke ${recipient.userId}: ${description}`,
          category: "Transfer",
          transactionAt: new Date(),
        },
      }),
      prisma.transaction.create({
        data: {
          familyId: recipient.familyId,
          memberId: recipient.id,
          amount,
          transactionType: "INCOME",
          description: `Transfer dari ${sender.userId}: ${description}`,
          category: "Transfer",
          transactionAt: new Date(),
        },
      }),
    ]);

    res.json({ message: "Transfer berhasil" });
  } catch (error) {
    console.error("Error during transfer:", error);
    next(error);
  }
};

module.exports = {
  getBalance,
  getMonthlyTransactions,
  getRecentTransactions,
  createTransaction,
  createTransfer,
};
