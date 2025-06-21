function updateBalanceMatrix(trip, expense) {
  const members = trip.members;
  const n = members.length;

  // init empty balanceMatrix if not already present
  if (!trip.balanceMatrix || trip.balanceMatrix.length !== n) {
    trip.balanceMatrix = Array(n).fill().map(() => Array(n).fill(0));
  }

  expense.paidBy.forEach(payer => {
    const payerIndex = members.findIndex(m => m.equals(payer.user));
    expense.splitBetween.forEach(splitUser => {
      const splitIndex = members.findIndex(m => m.equals(splitUser));
      if (splitIndex !== payerIndex) {
        const share = expense.amount / expense.splitBetween.length;
        trip.balanceMatrix[splitIndex][payerIndex] += share;
        trip.balanceMatrix[payerIndex][splitIndex] -= share;
      }
    });
  });

  return trip.balanceMatrix;
}

function getUserBalance(trip, userId) {
  const index = trip.members.findIndex(m => m.toString() === userId); 
  if (index === -1) return null;

  return trip.balanceMatrix[index].map((val, i) => ({
    otherUser: trip.members[i].toString(),
    balance: val
  }));
}


module.exports = { updateBalanceMatrix, getUserBalance };
