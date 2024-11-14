import prompts from "prompts";

import * as math from "mathjs";
import axios from "axios";

type FeeSettings = {
  percentage?: { min: number; max: number | "Infinity"; value: number }[];
  businessBouquetCharge?: {
    min: number;
    max: number | "Infinity";
    value: number;
  }[];
};

class FeeService {
  public deductFeeFromLocalCurrencyAmount({
    localCurrencyAmount,
    feeSettings,
  }: {
    localCurrencyAmount: number;
    feeSettings: FeeSettings;
  }): number {
    const initialLocalCurrencyAmount = localCurrencyAmount;
    let feeAmount = 0;
    const percentage = feeSettings.percentage?.find((i) => {
      const min = i.min;
      const max = i.max === "Infinity" ? Number.POSITIVE_INFINITY : i.max;
      return localCurrencyAmount >= min && localCurrencyAmount <= max;
    })?.value;
    if (percentage) {
      feeAmount = math
        .chain(localCurrencyAmount)
        .multiply(math.chain(100).subtract(percentage).divide(100).done())
        .subtract(localCurrencyAmount)
        .multiply(-1)
        .add(feeAmount)
        .round(2)
        .done();
    }
    const businessBouquetCharge = feeSettings.businessBouquetCharge?.find(
      (i) => {
        const min = i.min;
        const max = i.max === "Infinity" ? Number.POSITIVE_INFINITY : i.max;
        return (
          initialLocalCurrencyAmount >= min && initialLocalCurrencyAmount <= max
        );
      },
    )?.value;
    if (businessBouquetCharge) {
      feeAmount = math
        .chain(feeAmount)
        .add(businessBouquetCharge)
        .round(2)
        .done();
    }
    return math
      .chain(initialLocalCurrencyAmount)
      .subtract(feeAmount)
      .round(2)
      .done();
  }

  public addFeeFromLocalCurrencyAmount({
    localCurrencyAmount,
    feeSettings,
  }: {
    localCurrencyAmount: number;
    feeSettings: FeeSettings;
  }): number {
    const initialAmount = localCurrencyAmount;
    const percentage = feeSettings.percentage?.find((i) => {
      const min = i.min;
      const max = i.max === "Infinity" ? Number.POSITIVE_INFINITY : i.max;
      return localCurrencyAmount >= min && localCurrencyAmount <= max;
    })?.value;
    if (percentage) {
      localCurrencyAmount = math
        .chain(initialAmount)
        .divide(math.chain(100).subtract(percentage).divide(100).done())
        .round(2)
        .done();
    }
    const businessBouquetCharge = feeSettings.businessBouquetCharge?.find(
      (i) => {
        const min = i.min;
        const max = i.max === "Infinity" ? Number.POSITIVE_INFINITY : i.max;
        return initialAmount >= min && initialAmount <= max;
      },
    )?.value;
    if (businessBouquetCharge) {
      localCurrencyAmount = math
        .chain(localCurrencyAmount)
        .add(businessBouquetCharge)
        .round(2)
        .done();
    }
    return localCurrencyAmount;
  }
}

const collectionFeeSettingsBefore30August: FeeSettings = {
  percentage: [
    {
      min: 0,
      max: "Infinity",
      value: 0,
    },
  ],
};

const collectionFeeSettingsAfter30August: FeeSettings = {
  percentage: [
    {
      min: 0,
      max: "Infinity",
      value: 1,
    },
  ],
};

const payoutB2CFeeSettings: FeeSettings = {
  percentage: [
    {
      min: 0,
      max: "Infinity",
      value: 0.5,
    },
  ],
  businessBouquetCharge: [
    {
      min: 1,
      max: 499,
      value: 5,
    },
    {
      min: 500,
      max: 999,
      value: 6,
    },
    {
      min: 1000,
      max: 1499,
      value: 7,
    },
    {
      min: 1500,
      max: 2499,
      value: 8,
    },
    {
      min: 2500,
      max: 3499,
      value: 9,
    },
    {
      min: 3500,
      max: 4999,
      value: 10,
    },
    {
      min: 5000,
      max: 7499,
      value: 11,
    },
    {
      min: 7500,
      max: 9999,
      value: 12,
    },
    {
      min: 10000,
      max: 14999,
      value: 13,
    },
    {
      min: 15000,
      max: 19999,
      value: 14,
    },
    {
      min: 20000,
      max: 24999,
      value: 15,
    },
    {
      min: 25000,
      max: 29999,
      value: 16,
    },
    {
      min: 30000,
      max: 34999,
      value: 17,
    },
    {
      min: 35000,
      max: 39999,
      value: 18,
    },
    {
      min: 40000,
      max: 44999,
      value: 19,
    },
    {
      min: 45000,
      max: 69999,
      value: 20,
    },
    {
      min: 70000,
      max: "Infinity",
      value: 50,
    },
  ],
};

const payoutB2BFeeSettings: FeeSettings = {
  percentage: [
    {
      min: 0,
      max: "Infinity",
      value: 0.5,
    },
  ],
  businessBouquetCharge: [
    {
      min: 1,
      max: 49,
      value: 2,
    },
    {
      min: 50,
      max: 100,
      value: 3,
    },
    {
      min: 101,
      max: 500,
      value: 8,
    },
    {
      min: 501,
      max: 1000,
      value: 13,
    },
    {
      min: 1001,
      max: 1500,
      value: 18,
    },
    {
      min: 1501,
      max: 2500,
      value: 25,
    },
    {
      min: 2501,
      max: 3500,
      value: 30,
    },
    {
      min: 3501,
      max: 5000,
      value: 39,
    },
    {
      min: 5001,
      max: 7500,
      value: 48,
    },
    {
      min: 7501,
      max: 10000,
      value: 54,
    },
    {
      min: 10001,
      max: 15000,
      value: 63,
    },
    {
      min: 15001,
      max: 20000,
      value: 68,
    },
    {
      min: 20001,
      max: 25000,
      value: 74,
    },
    {
      min: 25001,
      max: 30000,
      value: 79,
    },
    {
      min: 30001,
      max: 35000,
      value: 90,
    },
    {
      min: 35001,
      max: 40000,
      value: 106,
    },
    {
      min: 40001,
      max: 45000,
      value: 110,
    },
    {
      min: 45001,
      max: "Infinity",
      value: 115,
    },
  ],
};

(async () => {
  const response = await prompts({
    type: "password",
    name: "apiKey",
    message: "Please enter Fonbnk API key",
    validate: (value: string) =>
      value.length < 1 ? `API key can't be empty` : true,
  });

  const { data: BTCTransactions } = await axios.request<{
    data: {
      status: "FAILED" | "COMPLETE" | "PAID";
      category: "CREDIT" | "DEBIT";
      amount: string;
      created_at: string;
    }[];
  }>({
    method: "POST",
    url: "https://pretium.africa/api/v1/payment/transactions",
    headers: {
      "Content-Type": "application/json",
      "api-key": response.apiKey,
    },
    data: {
      start_date: "2024-01-01",
      end_date: "2024-12-31",
    },
  });
  const { data: BTBTransactions } = await axios.request<{
    data: {
      is_paid: "PENDING" | "PAID";
      type: "PAYBILL" | "BUY_GOODS";
      amount: string;
      created_at: string;
    }[];
  }>({
    method: "POST",
    url: "https://pretium.africa/api/v1/payment/b2b/transactions",
    headers: {
      "Content-Type": "application/json",
      "api-key": response.apiKey,
    },
    data: {
      start_date: "2024-01-01",
      end_date: "2024-12-31",
    },
  });

  //the date when 1% collection fee was introduced
  const august30 = new Date("2024-08-30");

  const feeService = new FeeService();

  // Calculate total collected KES
  let totalCollectedKES = 0;
  for (const transaction of BTCTransactions.data.filter(
    (record) =>
      record.category === "CREDIT" &&
      ["COMPLETE", "PAID"].includes(record.status),
  )) {
    totalCollectedKES = math
      .chain(totalCollectedKES)
      .add(
        feeService.deductFeeFromLocalCurrencyAmount({
          localCurrencyAmount: Number(transaction.amount),
          feeSettings:
            new Date(transaction.created_at).getTime() < august30.getTime()
              ? collectionFeeSettingsBefore30August
              : collectionFeeSettingsAfter30August,
        }),
      )
      .round(2)
      .done();
  }

  // Calculate total payed out KES B2C
  let totalPayedOutKESB2C = 0;
  for (const transaction of BTCTransactions.data.filter(
    (record) =>
      record.category === "DEBIT" &&
      ["COMPLETE", "PAID"].includes(record.status),
  )) {
    totalPayedOutKESB2C = math
      .chain(totalPayedOutKESB2C)
      .add(
        feeService.addFeeFromLocalCurrencyAmount({
          localCurrencyAmount: Number(transaction.amount),
          feeSettings: payoutB2CFeeSettings,
        }),
      )
      .round(2)
      .done();
  }

  // Calculate total payed out KES B2B
  let totalPayedOutKESB2B = 0;
  for (const transaction of BTBTransactions.data.filter(
    (record) =>
      record.is_paid === "PAID" &&
      ["PAYBILL", "BUY_GOODS"].includes(record.type),
  )) {
    totalPayedOutKESB2B = math
      .chain(totalPayedOutKESB2B)
      .add(
        feeService.addFeeFromLocalCurrencyAmount({
          localCurrencyAmount: Number(transaction.amount),
          feeSettings: payoutB2BFeeSettings,
        }),
      )
      .round(2)
      .done();
  }

  const totalWithdrawnKES = math
    //https://celoscan.io/tx/0x9a50fefa36057c78abbbdc8f3dd5dee7eaeedb5ad29220db8013cc84c1982eb7 KES 135.25 * 100cUSD = 13525 KES
    .chain(math.chain(100).multiply(135.25).round(0).done())
    //https://celoscan.io/tx/0xcf9e80128d9852122f4f64c5065d683ef6429440af2fb594cb709f722c8bc826 KES 135 * 9500cUSD = 1282500 KES
    .add(math.chain(9500).multiply(135).round(0).done())
    //https://celoscan.io/tx/0x397ce2e9b29153847afbb598ec7b4a3dc4925204da3cc044618a7194fc57992e KES 135.17 * 4000cUSD = 540680 KES
    .add(math.chain(4000).multiply(135.17).round(0).done())
    .round(0)
    .done();

  const totalFundedKES = math
    //https://celoscan.io/tx/0x33efcdfb1ba6e392f255f32ca4b02f4f4b7e965e6e77ea488bf06df1177c50d5 KES 124.5 * 100cUSD = 12450 KES
    .chain(math.chain(100).multiply(124.5).round(0).done())
    //https://celoscan.io/tx/0x93c38a493e650f05f201d90051f16b89e851a9cc5f7588eeb6b1d6576f2293c9 KES 123.51 * 500cUSD = 61755 KES
    .add(math.chain(500).multiply(123.51).round(0).done())
    //https://celoscan.io/tx/0xe857c39a2e987a798e6a0fdcc2154c8944cf5cd103a60881db594b31d8d91ddb KES 122.41 * 500cUSD = 61205 KES
    .add(math.chain(500).multiply(122.41).round(0).done())
    .round(0)
    .done();

  const finalBalance = math
    .chain(totalFundedKES)
    .add(totalCollectedKES)
    .subtract(totalWithdrawnKES)
    .subtract(totalPayedOutKESB2C)
    .subtract(totalPayedOutKESB2B)
    .round(2)
    .done();

  const { data: account } = await axios.request<{
    data: {
      account_balance: number;
    };
  }>({
    method: "POST",
    url: "https://pretium.africa/api/v1/payment/organization",
    headers: {
      "Content-Type": "application/json",
      "api-key": response.apiKey,
    },
  });

  console.log(`Total collected KES API: ${totalCollectedKES} KES`);
  console.log(`Total payed out KES B2C API: ${totalPayedOutKESB2C} KES`);
  console.log(`Total payed out KES B2B API: ${totalPayedOutKESB2B} KES`);
  console.log(`Total account manually withdrawn KES: ${totalWithdrawnKES} KES`);
  console.log(`Total account manually funded KES: ${totalFundedKES} KES`);
  console.log(
    `${totalCollectedKES} + ${totalFundedKES} - ${totalWithdrawnKES} - ${totalPayedOutKESB2C} - ${totalPayedOutKESB2B} = ${finalBalance} KES`,
  );
  console.log(`Final calculated balance: ${finalBalance} KES`);
  console.log(`Pretium balance: ${account.data.account_balance} KES`);

  const diff = math
    .chain(finalBalance)
    .subtract(account.data.account_balance)
    .round(2)
    .done();

  console.log("==========================");
  console.log(`Difference: ${diff} KES`);
  console.log("==========================");

  process.exit(0);
})();
