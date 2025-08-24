export const calculateTaxes = (amount, region = 'ES') => {
  // IVA general en España: 21%
  const taxRate = 0.21;
  const taxAmount = amount * taxRate;
  const totalAmount = amount + taxAmount;
  
  return {
    subtotal: amount,
    tax: taxAmount,
    total: totalAmount,
    taxRate: taxRate
  };
};