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

app.get('/', (req,res) => {
    res.send("Hello FW assesor!");
});

app.post("/split-payments/compute", (req,res) => {
    //flat compute
    const num1 = 40;
    const num2 = 30;
    const result = num1 + num2;
    res.send({
        "ID": 1308,
        "Balance": 0,
        "SplitBreakdown": [
            {
                "SplitEntityId": "LNPYACC0019",
                "Amount": 5000
            },
            {
                "SplitEntityId": "LNPYACC0011",
                "Amount": 2000
            },
            {
                "SplitEntityId": "LNPYACC0015",
                "Amount": 2000
            }
        ]
    });

    function flatCompute() {
        flatCalc = payloadUno.Amount + 500;
    };

    function percentageCompute() {
        percentageCalc = payloadUno.Amount + (500*(30/100));
    };

    function ratioCompute() {
        ratioCalc = payloadUno.Amount + 500/(payloadUno.Amount + 700);
    };

});

app.listen(PORT, () => console.log(`Server running on port localhost:${PORT}`));
