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

const getTransactions = async (req, res, next) => {
  try {
    const { transactionType, timePeriod, page = 1, limit = 10 } = req.query; // INCOME/EXPENSE, timePeriod: day/week/month/year/all
    const userId = req.userId;

    if (!transactionType || !["INCOME", "EXPENSE"].includes(transactionType)) {
      throw new BadRequestError("Jenis transaksi tidak valid");
    }

    if (
      !timePeriod ||
      !["day", "week", "month", "year", "all"].includes(timePeriod)
    ) {
      throw new BadRequestError("Rentang waktu tidak valid");
    }

    const currentDate = new Date();
    let startDate, endDate;

    // Tentukan rentang tanggal berdasarkan timePeriod
    switch (timePeriod) {
      case "day":
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate()
        );
        endDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate() + 1
        );
        break;

      case "week":
        const firstDayOfWeek = currentDate.getDate() - currentDate.getDay(); // Mulai minggu (Minggu)
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          firstDayOfWeek
        );
        endDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          firstDayOfWeek + 7
        );
        break;

      case "month":
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        );
        endDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0
        );
        break;

      case "year":
        startDate = new Date(currentDate.getFullYear(), 0, 1);
        endDate = new Date(currentDate.getFullYear() + 1, 0, 0);
        break;

      case "all":
        startDate = undefined; // Tidak ada batas bawah
        endDate = undefined; // Tidak ada batas atas
        break;

      default:
        throw new BadRequestError("Rentang waktu tidak valid");
    }

    const skip = (page - 1) * parseInt(limit);
    const take = parseInt(limit);

    const transactions = await prisma.transaction.findMany({
      where: {
        member: { userId },
        transactionType,
        ...(timePeriod !== "all" && {
          transactionAt: {
            gte: startDate,
            lte: endDate,
          },
        }),
      },
      orderBy: { transactionAt: "desc" },
      skip,
      take,
    });

    const totalTransactions = await prisma.transaction.count({
      where: {
        member: { userId },
        transactionType,
        ...(timePeriod !== "all" && {
          transactionAt: {
            gte: startDate,
            lte: endDate,
          },
        }),
      },
    });

    res.json({
      data: transactions,
      meta: {
        page: parseInt(page),
        limit: take,
        total: totalTransactions,
        totalPages: Math.ceil(totalTransactions / take),
      },
    });
  } catch (error) {
    console.error("Error getting transactions:", error);
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

    // Cari member berdasarkan userId
    const member = await prisma.member.findUnique({ where: { userId } });
    if (!member) throw new NotFoundError("Member tidak ditemukan");

    // Periksa izin untuk menambah pemasukan
    if (transactionType === "INCOME" && !member.canAddIncome) {
      throw new ForbiddenError(
        "Anda tidak memiliki izin untuk menambah pemasukan"
      );
    }

    // Periksa saldo untuk pengeluaran
    if (transactionType === "EXPENSE" && member.balance < amount) {
      throw new BadRequestError(
        "Saldo tidak mencukupi untuk melakukan pengeluaran"
      );
    }

    // Sesuaikan nilai saldo
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

const getTotalTransaction = async (req, res, next) => {
  try {
    const { transactionType, timePeriod } = req.query; // INCOME atau EXPENSE, timePeriod: day, week, month, year
    const userId = req.userId;

    if (!transactionType || !["INCOME", "EXPENSE"].includes(transactionType)) {
      throw new BadRequestError("Jenis transaksi tidak valid");
    }

    if (
      !timePeriod ||
      !["day", "week", "month", "year", "all"].includes(timePeriod)
    ) {
      throw new BadRequestError("Rentang waktu tidak valid");
    }

    const currentDate = new Date();
    let startDate, endDate;

    // Tentukan rentang tanggal berdasarkan timePeriod
    switch (timePeriod) {
      case "day":
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate()
        );
        endDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate() + 1
        );
        break;

      case "week":
        const firstDayOfWeek = currentDate.getDate() - currentDate.getDay(); // Mulai minggu (Minggu)
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          firstDayOfWeek
        );
        endDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          firstDayOfWeek + 7
        );
        break;

      case "month":
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        );
        endDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0
        );
        break;

      case "year":
        startDate = new Date(currentDate.getFullYear(), 0, 1);
        endDate = new Date(currentDate.getFullYear() + 1, 0, 0);
        break;

      case "all":
        startDate = undefined; // Tidak ada batas bawah
        endDate = undefined; // Tidak ada batas atas
        break;

      default:
        throw new BadRequestError("Rentang waktu tidak valid");
    }

    const total = await prisma.transaction.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        member: { userId },
        transactionType,
        ...(timePeriod !== "all" && {
          transactionAt: {
            gte: startDate,
            lte: endDate,
          },
        }),
      },
    });

    res.json({
      transactionType,
      timePeriod,
      total: total._sum.amount || 0,
    });
  } catch (error) {
    console.error("Error getting total transactions:", error);
    next(error);
  }
};

module.exports = {
  getBalance,
  getTransactions,
  getRecentTransactions,
  createTransaction,
  createTransfer,
  getTotalTransaction,
};
