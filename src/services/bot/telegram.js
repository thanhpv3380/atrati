/* eslint-disable no-nested-ternary */
/* eslint-disable no-continue */
const TelegramBot = require('node-telegram-bot-api');
const { BOT_TELEGRAM_ACCESS_TOKEN } = require('../../configs');
const { generateUUID } = require('../../utils/string');
const { toDate, getEndDate, getStartDate, dateToString } = require('../../utils/date');
const { formatNumberCurrency } = require('../../utils/number');

const userDao = require('../../daos/user');
const transactionDao = require('../../daos/transaction');
const messageDao = require('../../daos/message');
const financialTransactionDao = require('../../daos/financialTransaction');

const CustomError = require('../../errors/CustomError');
const errorCodes = require('../../errors/code');
const getErrorMessage = require('../../errors/message');

const {
  PAYMENT_STATUS,
  MESSAGE_STATUS,
  USER_SEX,
  FINANCIAL_TRANSACTION_TYPE,
  USER_ROLE,
  LANGUAGE,
  STAT_TYPE,
} = require('../../constants');

const ACTION_TYPE = {
  HELP: 'HELP',
  GET_MEMBERS: 'GET_MEMBERS',
  ADD_TRANSACTION: 'ADD_TRANSACTION',
  GET_TRANSACTIONS_BY_USER: 'GET_TRANSACTIONS_BY_USER',
  STATISTIC_BY_USER: 'STATISTIC_BY_USER',
  PAYMENT_TRANSACTION: 'PAYMENT_TRANSACTION',
  INCOME: 'INCOME',
  EXPENSE: 'EXPENSE',
  FINANCIAL_TRANSACTION_HISTORY: 'FINANCIAL_TRANSACTION_HISTORY', // BY DAY, WEEK, MONTH, YEAR (MESSAGE OR CHART)
};

const commands = {
  '/help': ACTION_TYPE.HELP,
  '/h': ACTION_TYPE.HELP,
  '/cmd': ACTION_TYPE.HELP,
  '/command': ACTION_TYPE.HELP,
  '/lenh': ACTION_TYPE.HELP,
  '/caulenh': ACTION_TYPE.HELP,

  '/members': ACTION_TYPE.GET_MEMBERS,
  '/member': ACTION_TYPE.GET_MEMBERS,
  '/mbs': ACTION_TYPE.GET_MEMBERS,
  '/mb': ACTION_TYPE.GET_MEMBERS,
  '/dstv': ACTION_TYPE.GET_MEMBERS,

  '/add': ACTION_TYPE.ADD_TRANSACTION,
  '/new': ACTION_TYPE.ADD_TRANSACTION,
  '/create': ACTION_TYPE.ADD_TRANSACTION,

  '/gd': ACTION_TYPE.GET_TRANSACTIONS_BY_USER,
  '/transaction': ACTION_TYPE.GET_TRANSACTIONS_BY_USER,
  '/tran': ACTION_TYPE.GET_TRANSACTIONS_BY_USER,

  '/payment': ACTION_TYPE.PAYMENT_TRANSACTION,
  '/tt': ACTION_TYPE.PAYMENT_TRANSACTION,
  '/thanhtoan': ACTION_TYPE.PAYMENT_TRANSACTION,

  '/stats': ACTION_TYPE.STATISTIC_BY_USER,
  '/stat': ACTION_TYPE.STATISTIC_BY_USER,
  '/thongke': ACTION_TYPE.STATISTIC_BY_USER,

  '/income': ACTION_TYPE.INCOME,
  '/in': ACTION_TYPE.INCOME,
  '/thu': ACTION_TYPE.INCOME,

  '/expense': ACTION_TYPE.EXPENSE,
  '/out': ACTION_TYPE.EXPENSE,
  '/chi': ACTION_TYPE.EXPENSE,

  '/inout': ACTION_TYPE.FINANCIAL_TRANSACTION_HISTORY,
  '/thuchi': ACTION_TYPE.FINANCIAL_TRANSACTION_HISTORY,
  '/chithu': ACTION_TYPE.FINANCIAL_TRANSACTION_HISTORY,
};

const actions = {
  [ACTION_TYPE.HELP]: () => {
    let message = '🖥 Commands: \n\n';
    message += `1. Lấy danh sách user: /members, /member, /mbs, /mb, /dstv \n=> Thông tin user luôn bao gồm một mã code để tra cứu. \nVí dụ: [1] Nguyen Van A - Mã code là 1 \n\n`;
    message += `2. Thêm giao dịch: /add, /new, /create \n=> Chỉ user có role ADMIN mới có quyền. \nVí dụ: /add ds_user_code,so_tien,mo_ta,ngay_giao_dich \n\n`;
    message += `3. Thanh toán: /payment, /tt, /thanhtoan \n=> Chỉ user có role ADMIN mới có quyền. \nVí dụ: /payment ds_user_code \n\n`;
    message += `4. Thống kê chi tiết giao dịch: /gd, /transaction, /tran \n=> Phải là ADMIN mới có quyền truyền vào user_code. \nVí dụ: /gd user_code,status \n\n`;
    message += `5. Thống kê giao dịch: /stats, /stat, /thongke \nVí dụ: /stats \n\n`;
    message += `6. Thêm thu: /income, /in, /thu \nVí dụ: /income so_tien,mo_ta,ngay_thu \n\n`;
    message += `7. Thêm chi: /expense, /out, /chi \nVí dụ: /expense so_tien,mo_ta,ngay_chi \n\n`;
    message += `8. Thống kê thu chi: /inout, /thuchi, /chithu \n=> Chỉ xem được của chính mình \nVí dụ: /inout type,start_time,end_time,in_out\n - type: Loại thống kê (DAY, WEEK, MONTH, YEAR) \n - start_time, end_time: Query khi không truyền vào type\n - in_out: loại thu hoặc chi (INCOME: thu - EXPENSE: chi)\n\n`;

    return message;
  },
  [ACTION_TYPE.GET_MEMBERS]: async () => {
    const { items: users } = await userDao.findUsers({ sort: { code: 1 } });
    if (users.length === 0) return '📦 No data';

    let message = '🕵🏻 Members: \n\n';
    for (const user of users) {
      if (user.code === 0) continue;
      message += `[${user.code}] ${user.name}\n`;
    }

    return message;
  },
  [ACTION_TYPE.ADD_TRANSACTION]: async (msg, userReq) => {
    if (userReq.role !== USER_ROLE.ADMIN) throw new CustomError(errorCodes.UNAUTHORIZED);

    const [userCodesStr, amount, description, dateStr] = msg.split(',');
    if (!userCodesStr || !amount) throw new CustomError(errorCodes.MESSAGE_PARAM_INVALID);

    const userCodes = userCodesStr.split('.').join(',');
    const { items: users } = await userDao.findUsers({ codes: userCodes });

    const transactionAdd = {
      date: dateStr ? toDate(dateStr) : new Date(),
      description,
      amount,
      status: PAYMENT_STATUS.UNPAID,
    };

    await transactionDao.createManyTransaction(
      users.map((user) => ({
        ...transactionAdd,
        userId: user._id,
      })),
    );

    await userDao.updateManyUser(
      { _id: { $in: users.map((user) => user._id) } },
      { $inc: { unpaidAmount: amount } },
    );

    return '✅ Add success';
  },
  [ACTION_TYPE.GET_TRANSACTIONS_BY_USER]: async (msg, userReq) => {
    const [userCode, status] = msg.split(',');

    let user = userReq;
    if (userCode) {
      if (userReq.role !== USER_ROLE.ADMIN) throw new CustomError(errorCodes.UNAUTHORIZED);
      user = await userDao.findUser({ code: userCode });
    }

    const { items: transactions } = await transactionDao.findTransactions({
      userId: user._id,
      status: status || PAYMENT_STATUS.UNPAID,
    });

    if (transactions.length === 0) return '📦 No data';

    let message = '🕵🏻 Transactions: \n';
    message += `${user.sex === USER_SEX.MALE ? '👦🏼' : '🧒🏼'} User: [${user.code}] ${user.name}\n\n`;

    for (const transaction of transactions) {
      const { date, amount = 0, description } = transaction;
      message += `${dateToString(date, 'DD/MM/YYYY HH:mm')}: ${formatNumberCurrency(amount)} ${
        description ? `(${description})` : ''
      }\n`;
    }

    return message;
  },
  [ACTION_TYPE.PAYMENT_TRANSACTION]: async (msg, userReq) => {
    if (userReq.role !== USER_ROLE.ADMIN) throw new CustomError(errorCodes.UNAUTHORIZED);

    const [userCodesStr] = msg.split(',');
    if (!userCodesStr) throw new CustomError(errorCodes.MESSAGE_PARAM_INVALID);

    const userCodes = userCodesStr.split('.').join(',');
    const { items: users } = await userDao.findUsers({ codes: userCodes });

    await transactionDao.updateManyTransaction(
      { userId: { $in: users.map((user) => user._id) } },
      { status: PAYMENT_STATUS.PAID },
    );

    await Promise.all(
      users.map(async (user) => {
        await userDao.updateUser(
          { _id: user._id },
          { paidAmount: user.paidAmount + user.unpaidAmount, unpaidAmount: 0 },
        );
      }),
    );

    return '✅ Payment success';
  },
  [ACTION_TYPE.STATISTIC_BY_USER]: async (msg) => {
    const [userCode] = msg.split(',');

    let users = [];
    if (userCode) {
      const user = await userDao.findUser({ code: userCode });
      if (!user) throw new CustomError(errorCodes.USER_NOT_FOUND);

      users.push(user);
    } else {
      const { items } = await userDao.findUsers({});
      users = items;
    }

    let message = '📊 Statistic:\n\n';

    for (const user of users) {
      if (user.code === 0) continue;
      message += `${user.sex === USER_SEX.MALE ? '👦🏼' : '🧒🏼'} [${user.code}] ${
        user.name
      }: ${formatNumberCurrency(user.unpaidAmount)}\n`;
    }

    return message;
  },

  [ACTION_TYPE.INCOME]: async (msg, user) => {
    const { _id: userId } = user;
    const [amount, description, dateStr] = msg.split(',');
    if (!amount) throw new CustomError(errorCodes.MESSAGE_PARAM_INVALID);

    const financialTransactionAdd = {
      date: dateStr ? toDate(dateStr) : new Date(),
      description,
      amount,
      type: FINANCIAL_TRANSACTION_TYPE.INCOME,
      userId,
    };

    await financialTransactionDao.createFinancialTransaction(financialTransactionAdd);
    return '✅ Add income success';
  },
  [ACTION_TYPE.EXPENSE]: async (msg, user) => {
    const { _id: userId } = user;
    const [amount, description, dateStr] = msg.split(',');
    if (!amount) throw new CustomError(errorCodes.MESSAGE_PARAM_INVALID);

    const financialTransactionAdd = {
      date: dateStr ? toDate(dateStr) : new Date(),
      description,
      amount,
      type: FINANCIAL_TRANSACTION_TYPE.EXPENSE,
      userId,
    };

    await financialTransactionDao.createFinancialTransaction(financialTransactionAdd);
    return '✅ Add expense success';
  },
  [ACTION_TYPE.FINANCIAL_TRANSACTION_HISTORY]: async (msg, user) => {
    const { _id: userId } = user;
    const [statType, startTimeStr, endTimeStr, typeReq] = msg.split(',');

    let startTime;
    let endTime;
    if (!statType) {
      startTime = startTimeStr ? toDate(startTimeStr) : getStartDate();
      endTime = endTimeStr ? toDate(endTimeStr) : getEndDate();
    }

    const { items: financialTransactions } =
      await financialTransactionDao.findFinancialTransactions({
        type: typeReq,
        startTime,
        endTime,
        userId,
        sort: { date: -1 },
      });

    if (financialTransactions.length === 0) return '📦 No data';

    const statRules = {
      [STAT_TYPE.DAY]: (item) => dateToString(getStartDate(item.date), 'DD/MM/YYYY'),
      [STAT_TYPE.WEEK]: (item) =>
        `${dateToString(getStartDate(item.date, 'isoWeek'), 'DD/MM/YYYY')} - ${dateToString(
          getEndDate(item.date, 'isoWeek'),
          'DD/MM/YYYY',
        )}`,

      [STAT_TYPE.MONTH]: (item) => dateToString(item.date, 'MM/YYYY'),
      [STAT_TYPE.YEAR]: (item) => dateToString(item.date, 'YYYY'),
    };

    const statData = {};
    for (const financialTransaction of financialTransactions) {
      const { date, type, amount = 0, description } = financialTransaction;

      const statRule = statRules[statType];
      const statKey = statRule
        ? statRule(financialTransaction)
        : dateToString(date, 'DD/MM/YYYY HH:mm');

      let income = 0;
      let expense = 0;
      if (type === FINANCIAL_TRANSACTION_TYPE.INCOME) {
        income += amount;
      } else {
        expense += amount;
      }

      statData[statKey] = {
        total: (statData[statKey]?.total || 0) + income - expense,
        income: (statData[statKey]?.income || 0) + income,
        expense: (statData[statKey]?.expense || 0) + expense,
        description: !statType && description,
      };
    }

    let totalIncome = 0;
    let totalExpense = 0;

    let message = '💸 Financial Transaction:\n';
    message += `${user.sex === USER_SEX.MALE ? '👦🏼' : '🧒🏼'} User: [${user.code}] ${user.name}\n\n`;

    for (const statKey of Object.keys(statData)) {
      const { total = 0, income = 0, expense = 0, description } = statData[statKey];
      message += total === 0 ? '🟠 ' : total > 0 ? '🟢 ' : '🔴 ';
      totalIncome += income;
      totalExpense += expense;

      message += `${statKey}: ${formatNumberCurrency(total)} (${
        statType
          ? `+${formatNumberCurrency(income)}, -${formatNumberCurrency(totalExpense)}`
          : description || ''
      }) \n`;
    }

    const total = totalIncome - totalExpense;
    message += `\n================\n${
      total === 0 ? '🟧' : total > 0 ? '🟩' : '🟥'
    } Total: ${formatNumberCurrency(total)} (+${formatNumberCurrency(
      totalIncome,
    )}, -${formatNumberCurrency(totalExpense)})`;

    return message;
  },
};

const connect = async () => {
  const bot = new TelegramBot(BOT_TELEGRAM_ACCESS_TOKEN, { polling: true });
  const botInfo = await bot.getMe();
  logger.info(`Connected telegram bot, botInfo: ${JSON.stringify(botInfo)}`);

  bot.on('message', async (msg) => {
    if (!msg?.text?.startsWith('/') || msg?.from?.is_bot) return;

    const {
      text,
      from,
      chat: { id: chatId },
      date: chatDate,
    } = msg;
    const requestId = generateUUID();
    const messageInDb = await messageDao.createMessage({
      date: chatDate ? new Date(chatDate * 1000) : new Date(),
      messageReq: msg,
      status: MESSAGE_STATUS.PENDING,
    });

    try {
      logger.info(
        `[TELEGRAM_BOT][reqId=${requestId}][REQUEST][bot=${JSON.stringify({
          name: botInfo.username,
          id: botInfo.id,
        })}][message=${JSON.stringify(msg)}]`,
      );

      const [commandReq, ...messageReq] = text.split(' ');
      if (!commandReq || !commands[commandReq]) throw new CustomError(errorCodes.MESSAGE_INVALID);

      const actionType = commands[commandReq];
      if (!actions[actionType]) throw new CustomError(errorCodes.FEATURE_NOT_ACTIVE);

      let user = await userDao.findUser({ telegramId: from.id });
      if (!user) {
        user = await userDao.createUser({
          name: `${from?.first_name} ${from?.last_name}`,
          telegramId: from.id,
          role: USER_ROLE.MEMBER,
          paidAmount: 0,
          unpaidAmount: 0,
          sex: USER_SEX.MALE,
          telegramLanguage: from.language_code || LANGUAGE.VI,
        });
      }

      const messageRes = (await actions[actionType](messageReq.join(' '), user)) || '✅ Success';
      logger.info(
        `[TELEGRAM_BOT][reqId=${requestId}][RESPONSE][message=${JSON.stringify(messageRes)}]`,
      );

      bot.sendMessage(chatId, messageRes);
      await messageDao.updateMessage(
        { _id: messageInDb._id },
        { messageRes, status: MESSAGE_STATUS.SUCCESS },
      );
    } catch (error) {
      const { code, message } = error;
      const messageRes = `❌ ${getErrorMessage(code) || 'An error has occurred'}!!!`;
      const messageLog = message || JSON.stringify(error);

      logger.error(`[TELEGRAM_BOT][reqId=${requestId}][RESPONSE][error=${messageLog}]`);

      bot.sendMessage(chatId, messageRes);
      await messageDao.updateMessage(
        { _id: messageInDb._id },
        { messageRes: messageLog, status: MESSAGE_STATUS.FAILED },
      );
    }
  });
};

module.exports = { connect };
