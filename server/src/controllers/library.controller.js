import prisma from "../../prisma/client.js";
import { success, error } from "../utils/response.js";

export const getBooks = async (req, res) => {
  try {
    const books = await prisma.book.findMany({ orderBy: { title: "asc" } });
    return success(res, books, "Books fetched");
  } catch (err) {
    return error(res, err.message);
  }
};

export const createBook = async (req, res) => {
  try {
    const { title, author, isbn, copies } = req.body;
    if (!title) return error(res, "title required", 400);
    const c = Number(copies ?? 1);
    const book = await prisma.book.create({
      data: { title, author, isbn, copies: c, available: c },
    });
    return success(res, book, "Book created");
  } catch (err) {
    return error(res, err.message);
  }
};

export const loanBook = async (req, res) => {
  try {
    const { bookId, studentId, dueDate } = req.body;
    const book = await prisma.book.findUnique({ where: { id: Number(bookId) } });
    if (!book || book.available < 1) return error(res, "Book not available", 400);

    const loan = await prisma.$transaction(async (tx) => {
      const l = await tx.bookLoan.create({
        data: {
          bookId: Number(bookId),
          studentId: Number(studentId),
          dueDate: new Date(dueDate),
        },
        include: { book: true, student: true },
      });
      await tx.book.update({
        where: { id: Number(bookId) },
        data: { available: { decrement: 1 } },
      });
      return l;
    });
    return success(res, loan, "Book loaned");
  } catch (err) {
    return error(res, err.message);
  }
};

export const returnBook = async (req, res) => {
  try {
    const loan = await prisma.bookLoan.findUnique({ where: { id: Number(req.params.id) } });
    if (!loan) return error(res, "Loan not found", 404);
    if (loan.returnedAt) return error(res, "Already returned", 400);

    await prisma.$transaction([
      prisma.bookLoan.update({
        where: { id: loan.id },
        data: { returnedAt: new Date() },
      }),
      prisma.book.update({
        where: { id: loan.bookId },
        data: { available: { increment: 1 } },
      }),
    ]);
    return success(res, null, "Book returned");
  } catch (err) {
    return error(res, err.message);
  }
};

export const getLoans = async (req, res) => {
  try {
    const loans = await prisma.bookLoan.findMany({
      where: { returnedAt: null },
      include: { book: true, student: true },
      orderBy: { dueDate: "asc" },
    });
    return success(res, loans, "Active loans fetched");
  } catch (err) {
    return error(res, err.message);
  }
};
