export const toPayoutDto = (payout) => {
  if (!payout) return null;
  return {
    id:          payout._id?.toString(),
    amount:      payout.amount,
    bankInfo: {
      bankName:      payout.bankInfo?.bankName      || null,
      accountNumber: payout.bankInfo?.accountNumber || null,
      accountName:   payout.bankInfo?.accountName   || null,
    },
    status:      payout.status,
    adminNote:   payout.adminNote   || null,
    periodLabel: payout.periodLabel || null,
    processedAt: payout.processedAt || null,
    createdAt:   payout.createdAt,
    updatedAt:   payout.updatedAt,
  };
};

export const toAdminPayoutDto = (payout) => {
  if (!payout) return null;
  return {
    ...toPayoutDto(payout),
    instructor: {
      id:     payout.instructor?._id?.toString() || payout.instructor?.toString(),
      name:   payout.instructor?.name   || null,
      email:  payout.instructor?.email  || null,
      avatar: payout.instructor?.avatar || null,
    },
  };
};
