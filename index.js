import express from 'express';
import bodyParser from 'body-parser';

const app = express();
const PORT = 5000;

const payloadUno =
{
    "ID": 1308,
    "Amount": 12580,
    "Currency": "NGN",
    "CustomerEmail": "anon8@customers.io",
    "SplitInfo": [
        {
            "SplitType": "FLAT",
            "SplitValue": 45,
            "SplitEntityId": "LNPYACC0019"
        },
        {
            "SplitType": "RATIO",
            "SplitValue": 3,
            "SplitEntityId": "LNPYACC0011"
        },
        {
            "SplitType": "PERCENTAGE",
            "SplitValue": 3,
            "SplitEntityId": "LNPYACC0015"
        }
    ]
};

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send("Hello FW assesor!");
});

app.post("/split-payments/compute", (req, res) => {
    const {
        ID,
        SplitInfo,
        Amount
    } = req.body;
    const finalBreakdown = [];
    const flatBreakdown = [];
    const percentageBreakdown = [];
    const ratioBreakdown = [];
    let totalRatio = 0;
    let currentBalance = Amount;

    for (const split of SplitInfo) {
        switch (split.SplitType) {
            case "FLAT": {
                flatBreakdown.push(split);
                break;
            }
            case "PERCENTAGE": {
                percentageBreakdown.push(split);
                break;
            }
            case "RATIO": {
                ratioBreakdown.push(split);
                totalRatio += split.SplitValue;
                break;
            }
            default: throw new Error();
        }
    }

    // flat compute
    for (const flatSplit of flatBreakdown) {
        finalBreakdown.push({
            SplitEntityId: flatSplit.SplitEntityId,
            Amount: flatSplit.SplitValue
        });
        currentBalance -= flatSplit.SplitValue;
    }

    // percentage compute
    for (const percentageSplit of percentageBreakdown) {
        const value = currentBalance * (percentageSplit.SplitValue / 100);
        finalBreakdown.push({
            SplitEntityId: percentageSplit.SplitEntityId,
            Amount: value
        });
        currentBalance -= value;
    }

    // ratio compute
    for (const ratioSplit of ratioBreakdown) {
        const value = currentBalance * (ratioSplit.SplitValue / totalRatio);
        finalBreakdown.push({
            SplitEntityId: ratioSplit.SplitEntityId,
            Amount: value
        });
        currentBalance -= value;
    }

    res.send({
        "ID": ID,
        "Balance": currentBalance,
        "SplitBreakdown": finalBreakdown
    });
});

app.listen(PORT, () => console.log(`Server running on port localhost:${PORT}`));
