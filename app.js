// app.js
// require http module
const http = require('http');

// use current environment port or specify port 5000
const PORT = process.env.PORT || 5000;

// function to process request data
function getReqData(req) {
    return new Promise((resolve, reject) => {
        try {
            let body = "";
            // listen to data sent by client
            req.on("data", (chunk) => {
                // append the string version to the body
                body += chunk.toString();
            });
            // listen till the end
            req.on("end", () => {
                // send back the data
                resolve(body);
            });
        } catch (error) {
            reject(error);
        }
    });
}

// create a server
const server = http.createServer(async (req, res) => {
    //set the request route
    if (req.url === "/" && req.method === "GET") {
        //response headers
        res.writeHead(200, { "Content-Type": "application/json" });
        //set the response
        res.write("Hello FW assesor!");
        //end the response
        res.end();
    }

    else if (req.url === "/split-payments/compute" && req.method === "POST") {

        // set the status code and content-type
        res.writeHead(200, { "Content-Type": "application/json" });

        const bodyStr = await getReqData(req);
        const body = JSON.parse(bodyStr);
        const {
            ID,
            SplitInfo,
            Amount
        } = body;

        const finalBreakdown = [];
        // const flatBreakdown = [];
        const percentageBreakdown = [];
        const ratioBreakdown = [];
        let totalRatio = 0;
        let currentBalance = Amount;

        // computations
        for (const split of SplitInfo) {
            switch (split.SplitType) {
                case "FLAT": {
                    finalBreakdown.push({
                        SplitEntityId: split.SplitEntityId,
                        Amount: split.SplitValue
                    });
                    currentBalance -= split.SplitValue;
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

        // res.send({
        //     "ID": ID,
        //     "Balance": currentBalance,
        //     "SplitBreakdown": finalBreakdown
        // });
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
            "ID": ID,
            "Balance": currentBalance,
            "SplitBreakdown": finalBreakdown
        }));


    }

    // If no route present
    else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Route not found" }));
    }
});

// app.post("/split-payments/compute", (req, res) => {
//     const {
//         ID,
//         SplitInfo,
//         Amount
//     } = req.body;
//     const finalBreakdown = [];
//     // const flatBreakdown = [];
//     const percentageBreakdown = [];
//     const ratioBreakdown = [];
//     let totalRatio = 0;
//     let currentBalance = Amount;

//     for (const split of SplitInfo) {
//         switch (split.SplitType) {
//             case "FLAT": {
//                 finalBreakdown.push({
//                     SplitEntityId: split.SplitEntityId,
//                     Amount: split.SplitValue
//                 });
//                 currentBalance -= split.SplitValue;
//                 break;
//             }
//             case "PERCENTAGE": {
//                 percentageBreakdown.push(split);
//                 break;
//             }
//             case "RATIO": {
//                 ratioBreakdown.push(split);
//                 totalRatio += split.SplitValue;
//                 break;
//             }
//             default: throw new Error();
//         }
//     }

//     // flat compute
//     // for (const flatSplit of flatBreakdown) {
//     //     finalBreakdown.push({
//     //         SplitEntityId: flatSplit.SplitEntityId,
//     //         Amount: flatSplit.SplitValue
//     //     });
//     //     currentBalance -= flatSplit.SplitValue;
//     // }

//     // percentage compute
//     for (const percentageSplit of percentageBreakdown) {
//         const value = currentBalance * (percentageSplit.SplitValue / 100);
//         finalBreakdown.push({
//             SplitEntityId: percentageSplit.SplitEntityId,
//             Amount: value
//         });
//         currentBalance -= value;
//     }

//     // ratio compute
//     for (const ratioSplit of ratioBreakdown) {
//         const value = currentBalance * (ratioSplit.SplitValue / totalRatio);
//         finalBreakdown.push({
//             SplitEntityId: ratioSplit.SplitEntityId,
//             Amount: value
//         });
//         currentBalance -= value;
//     }

//     res.send({
//         "ID": ID,
//         "Balance": currentBalance,
//         "SplitBreakdown": finalBreakdown
//     });
// });

server.listen(PORT, () => console.log(`Server running on port localhost:${PORT}`));
